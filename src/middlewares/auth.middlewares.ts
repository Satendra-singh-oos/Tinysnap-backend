import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import env from "../utils/env";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import { db } from "../db";

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  username: string;
  role: string;
}

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json(new ApiError(401, "Unauthorized request"));
    }

    const verifyedToken = (await jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET
    )) as CustomJwtPayload;

    const userId: string = verifyedToken?.id;

    const [user] = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        role: users.role,
        isEmailVerified: users.isEmailVerified,
        accountStatus: users.accountStatus,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json(new ApiError(401, "Invalid access token"));
    }

    req.user = user;

    next();
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(500, "Something went wrong during verify of jwt token")
      );
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(404).json(new ApiError(401, "Unauthorized request"));
    }

    const verifyedToken = (await jwt.verify(
      token,
      env.ACCESS_TOKEN_SECRET
    )) as CustomJwtPayload;

    const userId: string = verifyedToken?.id;

    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json(new ApiError(401, "Invalid access token"));
    }

    // check dose the user is addmin or not
    if (user.role !== "ADMIN") {
      return res
        .status(404)
        .json(new ApiError(401, "Not Authorized To Access"));
    }

    next();
  } catch (error) {
    return res
      .status(404)
      .json(new ApiError(500, "Something went wrong during verify of jwt"));
  }
});
