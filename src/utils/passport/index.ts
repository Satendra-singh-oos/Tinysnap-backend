import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { ApiError } from "../ApiError";
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import env from "../env";

import {
  AccountStatusEnum,
  UserLoginType,
  UserRolesEnum,
} from "../../constant";

try {
  passport.serializeUser((user: any, next) => {
    next(null, user.id);
  });

  passport.deserializeUser(async (id: string, next) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (user) {
        next(null, user); // User found
      } else {
        next(new ApiError(404, "User does not exist"), null); // User not found
      }
    } catch (error: any) {
      next(
        new ApiError(
          500,
          "Something went wrong while deserializing the user. Error: " + error
        ),
        null
      );
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_CALLBACK_URL,
      },
      async (_, __, profile: Profile, next) => {
        // check if the user with email already exist in db
        if (!profile._json?.email) {
          return next(
            new ApiError(400, "Google profile email is missing"),
            undefined
          );
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, profile._json.email))
          .limit(1);

        if (user) {
          if (
            user.loginType.toLowerCase() !==
            UserLoginType.EMAIL_PASSWORD.toLowerCase()
          ) {
            // If user is registered with some other method, we will ask him/her to use the same method as registered.
            // TODO: We can redirect user to appropriate frontend urls which will show users what went wrong instead of sending response from the backend

            next(
              new ApiError(
                400,
                "You have previously registered using " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  ". Please use the " +
                  user.loginType?.toLowerCase()?.split("_").join(" ") +
                  " login option to access your account."
              ),
              undefined
            );
          } else {
            next(null, user);
          }
        } else {
          // If user with email dose not exists means the user is comming for the first time

          const createdUser = await db.insert(user).values({
            username: profile._json.email?.split("@")[0],
            email: profile._json.email,
            avatarUrl: profile._json.picture,
            password: profile._json.sub,
            role: UserRolesEnum.USER,
            loginType: UserLoginType.GOOGLE,
            isEmailVerified: true,
            accountStatus: AccountStatusEnum.VERIFIED,
          });

          if (createdUser) {
            next(null, createdUser);
          } else {
            next(
              new ApiError(500, "Error while registering the user"),
              undefined
            );
          }
        }
      }
    )
  );
} catch (error: any) {
  console.error("PASSPORT ERROR: ", error);
}
