import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { db } from "../db";
import { users } from "../db/schema";
import { and, eq, gt, or } from "drizzle-orm";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcryptjs, { hash } from "bcryptjs";
import env from "../utils/env";
import { User } from "../utils/interface";
import {
  changeCurrentPasswordValidation,
  forgatePasswordValidation,
  loginUserValidation,
  registerUserValidation,
  resetForgottoenPasswordValidation,
  userRoleValidation,
} from "../utils/validators";
import {
  AccountStatusEnum,
  USER_TEMPORARY_TOKEN_EXPIRY,
  UserLoginType,
  UserRolesEnum,
} from "../constant";
import {
  forgatePasswordEmail,
  sendVerificationEmail,
} from "../utils/mail/verificationEmail";
import { ApiResponse } from "../utils/ApiResponse";

// Extend the Express Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: User;
}

async function genrateHashPassword(password: string) {
  //hash password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  return hashedPassword;
}

const genrateAccessToken = async (userId: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const accessToken = await jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: env.ACCESS_TOKEN_EXPIRY,
      }
    );

    return { accessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong during the genration of the access  token"
    );
  }
};

const generateTemporaryToken = async () => {
  // this will send to the user email
  const unHashedToken = crypto.randomBytes(20).toString("hex");

  // this hashed token will save in the db
  const hashedToken = crypto
    .createHash("sha256")
    .update(unHashedToken)
    .digest("hex");

  // This is the expiry time for the token (20 minutes)
  const tokenExpiry = new Date(Date.now() + USER_TEMPORARY_TOKEN_EXPIRY);

  return { unHashedToken, hashedToken, tokenExpiry };
};

const handleSocialLogin = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        throw new ApiError(403, "UserId is not provided");
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user?.id))
        .limit(1);

      if (!user) {
        return res.status(403).json(new ApiError(403, "User Dose Not Exist"));
      }

      const { accessToken } = await genrateAccessToken(user.id);

      const options = {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
      };

      return res
        .status(301)
        .cookie("accessToken", accessToken, options)
        .redirect(
          // redirect user to the frontend endpoint
          `${env.CLIENT_SSO_REDIRECT_URL}`
        );
    } catch (error: any) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            `Registration Using Google Oauth failed : ${error?.message}`
          )
        );
    }
  }
);

const registerUser = asyncHandler(async (req, res) => {
  try {
    const result = registerUserValidation.safeParse(req.body);

    if (!result.success) {
      const registerErrors =
        result.error.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `${registerErrors?.length > 0 ? registerErrors[0].message : "Invalid Data In Form"}`
          )
        );
    }

    const { email, password, username } = result.data;

    //check for existing user

    const [existingUser] = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)));

    if (existingUser) {
      return res
        .status(409)
        .json(
          new ApiError(409, "User with email or username already exist in ")
        );
    }

    //hash password

    const hashedPassword = await genrateHashPassword(password);

    // generate tokens
    const { unHashedToken, hashedToken, tokenExpiry } =
      await generateTemporaryToken();

    // save user to db
    const [createdUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        avatarUrl: "",
        accountStatus: AccountStatusEnum.UNVERIFIED,
        isEmailVerified: false,
        loginType: UserLoginType.EMAIL_PASSWORD,
        role: UserRolesEnum.USER,
        verifyToken: hashedToken,
        verifyTokenExpiry: tokenExpiry,
      })
      .returning();

    // send email

    await sendVerificationEmail(
      email,
      username,
      `${req.protocol}://${req.get(
        "host"
      )}/api/v1/users/verify-email/${unHashedToken}`
    );

    const findCreatedUser = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        accountStatus: users.accountStatus,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, createdUser.id));

    if (!findCreatedUser) {
      return res
        .status(500)
        .json(
          new ApiError(500, "Something Went Wrong While Registering the user")
        );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          200,
          { user: findCreatedUser },
          "Users registerd Successfully and verification email has been sent on your email"
        )
      );
  } catch (error: any) {
    return res
      .status(500)
      .json(new ApiError(500, `Registration failed : ${error?.message}`));
  }
});

const verifyEmail = asyncHandler(async (req, res) => {
  try {
    const { verificationToken } = req.params;
    if (!verificationToken) {
      return res
        .status(400)
        .json(new ApiError(400, "Verification token is not provided"));
    }
    // generate a hash from the token that we are receiving
    let hashedToken = crypto
      .createHash("sha256")
      .update(verificationToken)
      .digest("hex");

    // check dose user exist in db with the hash and the active verifyTokenexipry
    const [dbUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.verifyToken, hashedToken),
          gt(users.verifyTokenExpiry, new Date())
        )
      )
      .limit(1);

    if (!dbUser) {
      return res
        .status(489)
        .json(new ApiError(489, "Token is invalid or expired"));
    }

    const [verifiedUser] = await db
      .update(users)
      .set({
        verifyToken: "",
        isEmailVerified: true,
        accountStatus: AccountStatusEnum.VERIFIED,
      })
      .where(eq(users.id, dbUser.id))
      .returning();

    if (!verifiedUser) {
      return res
        .status(403)
        .json(new ApiError(403, `Unable to Verfiy the user`));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isEmailVerified: true, AccountStatus: "Verified" },
          "Email is verified"
        )
      );
  } catch (error: any) {
    return res
      .status(500)
      .json(new ApiError(500, `VerifyMail send failed : ${error?.message}`));
  }
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const result = loginUserValidation.safeParse(req.body);

    if (!result.success) {
      const loginErrors =
        result.error.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `${loginErrors?.length > 0 ? loginErrors[0].message : "Invalid Data In Form"}`
          )
        );
    }

    const { email, password } = result.data;

    if (!email) {
      return res.status(400).json(new ApiError(400, "Email is required"));
    }

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "No User Found With This Email"));
    }

    if (user.loginType !== UserLoginType.EMAIL_PASSWORD) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            `You have previously registered using ${user.loginType?.toLowerCase()}. Please use the ${user.loginType?.toLowerCase()} login option to access your account.`
          )
        );
    }

    // comapre the incoming passowrd with the hashed passowrd

    const isPasswordValid = await bcryptjs.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid user credentials"));
    }

    const { accessToken } = await genrateAccessToken(user.id);

    const [loggedInUser] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        accountStatus: users.accountStatus,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, user.id));

    const options = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken },
          "User logged in successfully"
        )
      );
  } catch (error: any) {
    return res
      .status(500)
      .json(new ApiError(500, `Login failed : ${error?.message}`));
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    const options = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error: any) {
    return res
      .status(500)
      .json(new ApiError(500, `Logout failed : ${error?.message}`));
  }
});

const resendEmailVerification = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user?.id) {
        return res
          .status(403)
          .json(new ApiError(403, "UserId is not provided"));
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user?.id))
        .limit(1);

      if (!user) {
        return res.status(404).json(new ApiError(404, "No User Found"));
      }

      if (user.isEmailVerified) {
        return res
          .status(409)
          .json(new ApiError(409, "User Already Have Verfied Email"));
      }

      const { unHashedToken, hashedToken, tokenExpiry } =
        await generateTemporaryToken();

      await db
        .update(users)
        .set({
          verifyToken: hashedToken,
          verifyTokenExpiry: tokenExpiry,
        })
        .where(eq(users.id, user.id));

      await sendVerificationEmail(
        user.email,
        user.username,
        `${req.protocol}://${req.get(
          "host"
        )}/api/v1/users/verify-email/${unHashedToken}`
      );

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
    } catch (error: any) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            `Resend Email Verification failed : ${error?.message}`
          )
        );
    }
  }
);

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  try {
    const result = forgatePasswordValidation.safeParse(req.body);

    if (!result.success) {
      const forgatePassword =
        result.error.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `${forgatePassword?.length > 0 ? forgatePassword[0].message : "Invalid Data In Form"}`
          )
        );
    }

    const { email } = result.data;

    const [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      return res
        .status(404)
        .json(new ApiResponse(404, "User Dose Not Exist With This Email"));
    }

    const { unHashedToken, hashedToken, tokenExpiry } =
      await generateTemporaryToken();

    // updating user in the db

    await db
      .update(users)
      .set({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: tokenExpiry,
      })
      .where(eq(users.id, user.id));

    await forgatePasswordEmail(
      user.email,
      user.username,
      //  NOTE: Following link should be the link of the frontend page responsible to request password reset
      // Frontend will send the below token in requset parmas with the new password in the request body to the backend reset password endpoint
      `${env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "Password reset mail has been sent on your mail id"
        )
      );
  } catch (error: any) {
    return res
      .status(500)
      .json(new ApiError(500, `Forgate Passowrd Request : ${error?.message}`));
  }
});

const resetForgottoenPassword = asyncHandler(async (req, res) => {
  try {
    const { resetToken } = req.params;
    const result = resetForgottoenPasswordValidation.safeParse(req.body);

    if (!result.success) {
      const resetPasswordError =
        result.error.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `${resetPasswordError?.length > 0 ? resetPasswordError[0].message : "Invalid Data In Form"}`
          )
        );
    }

    const { newPassword } = result.data;

    //create hash from incoming token
    let hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // see if user have same hash or not also check the expirey of the resetToken

    const [dbUser] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.forgotPasswordToken, hashedToken),
          gt(users.forgotPasswordExpiry, new Date())
        )
      )
      .limit(1);

    if (!dbUser) {
      return res
        .status(409)
        .json(new ApiError(489, "Token is invalid or expired"));
    }

    // hash the password first before saving in db
    const hashedPassword = await genrateHashPassword(newPassword);

    // save user in the db
    const [updatedUser] = await db
      .update(users)
      .set({
        forgotPasswordToken: "",
        password: hashedPassword,
      })
      .where(eq(users.id, dbUser.id))
      .returning();

    if (!updatedUser) {
      return res
        .status(403)
        .json(new ApiError(403, `Unable to update the password`));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error: any) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          `Reset Forgottoen Password Request : ${error?.message}`
        )
      );
  }
});

const changeCurrentPassword = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user?.id) {
        return res
          .status(403)
          .json(new ApiError(403, "UserId is not provided"));
      }

      const result = changeCurrentPasswordValidation.safeParse(req.body);

      if (!result.success) {
        const changePasswordError =
          result.error.errors.map((err) => ({
            code: err.code,
            message: err.message,
          })) || [];

        return res
          .status(400)
          .json(
            new ApiError(
              400,
              `${changePasswordError?.length > 0 ? changePasswordError[0].message : "Invalid Data In Form"}`
            )
          );
      }

      const { newPassword, oldPassword } = result.data;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.user.id));

      if (!user) {
        return res.status(404).json(new ApiError(404, `No User Found`));
      }

      // comapre the oldPassword with the user.passowrd present in the db

      const isPasswordValid = bcryptjs.compare(oldPassword, user.password);

      if (!isPasswordValid) {
        return res
          .status(400)
          .json(new ApiError(400, `Old Password dose not matched`));
      }

      // hash the new passowrd before saving in the db

      const hashedPassword = await genrateHashPassword(newPassword);

      const [updateUser] = await db
        .update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, user.id))
        .returning();

      if (!updateUser) {
        return res
          .status(403)
          .json(
            new ApiError(
              403,
              `Some thing went wrong during the password update`
            )
          );
      }

      return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
    } catch (error: any) {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            `Change Current Password Request Failed : ${error?.message}`
          )
        );
    }
  }
);

const assignRole = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;

    const result = userRoleValidation.safeParse(req.body);

    if (!result.success) {
      const changePasswordError =
        result.error.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `${changePasswordError?.length > 0 ? changePasswordError[0].message : "Invalid Data In Form"}`
          )
        );
    }

    const { role } = result.data;

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json(new ApiError(404, "User dose not exist"));
    }

    const [updateUser] = await db
      .update(users)
      .set({ role })
      .where(eq(users.id, user.id))
      .returning();

    if (!updateUser) {
      return res
        .status(404)
        .json(new ApiError(404, "User assigned roled failed"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Role changed for the user"));
  } catch (error: any) {
    return res
      .status(500)
      .json(
        new ApiError(500, `assign Role Request Failed : ${error?.message}`)
      );
  }
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

//TODO: Update User Avatar Left

export {
  handleSocialLogin,
  registerUser,
  verifyEmail,
  loginUser,
  logoutUser,
  resendEmailVerification,
  forgotPasswordRequest,
  resetForgottoenPassword,
  changeCurrentPassword,
  assignRole,
  getCurrentUser,
};
