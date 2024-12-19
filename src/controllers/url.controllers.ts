/*
1) Create shortUrl = req.body will take url short it save in db and return the short url length will be 8-10 char max (of create by server)
 also user can input max and url can service for max 6 month
2) Delete ShortUrl 
3) Get shortUrl  -> redirect to original url
*/

import crypto from "crypto";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { createURLValidation } from "../utils/validators";
import { db } from "../db";
import { tinyUrls } from "../db/schema";
import { eq } from "drizzle-orm";
import { AuthenticatedRequest } from "../utils/interface";
import { ApiResponse } from "../utils/ApiResponse";
import env from "../utils/env";

async function genrateShortName() {
  let hashedString = await crypto
    .createHash("sha256")
    .digest("base64")
    .slice(0, 16);

  hashedString = hashedString.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);

  let checkUniqueShortName = await await db
    .select()
    .from(tinyUrls)
    .where(eq(tinyUrls.shortName, hashedString));

  while (checkUniqueShortName) {
    hashedString = await genrateShortName();
    checkUniqueShortName = await db
      .select()
      .from(tinyUrls)
      .where(eq(tinyUrls.shortName, hashedString));
  }

  return hashedString;
}

const createShortURL = asyncHandler(async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(403).json(new ApiError(403, "UserId is not provided"));
    }

    const result = await createURLValidation.safeParse(req.body);

    if (!result.success) {
      const createShortURLError =
        result.error.errors.map((err) => ({
          code: err.code,
          message: err.message,
        })) || [];

      return res
        .status(400)
        .json(
          new ApiError(
            400,
            `${createShortURLError?.length > 0 ? createShortURLError[0].message : "Invalid Data In Form"}`
          )
        );
    }

    const { originalUrl, expireDate, customName } = result.data;

    /*
     1) check if custom name present in body or not customName.length>0
     3) if customName not presne then genrate the custom name and return the response 
    */

    if (customName) {
      //TODO: if present then check dose that name already present or not if present then check is it expired or not if expired then delete that entry and create the new one

      const [url] = await db
        .select()
        .from(tinyUrls)
        .where(eq(tinyUrls.shortName, customName));

      const currentDate = new Date();
      // !! THINK we have already a staus filed in the tinyURL
      if (url.urlValidity < currentDate && url.isActive === true) {
        //TODO: throw errror that customName is not avaliable
      }
    } else {
      const shortName = await genrateShortName();

      const [createUrl] = await db
        .insert(tinyUrls)
        .values({
          originalUrl,
          shortName,
          userId: req.user.id,
          shortUrl: `https://${env.SERVER_BASE_URL}/${shortName}`,
          urlValidity: expireDate,
          isActive: true,
          status: "ACTIVE",
        })
        .returning();

      const [findCreatedShortUrl] = await db
        .select({
          shortUrl: tinyUrls.shortUrl,
          originalUrl: tinyUrls.originalUrl,
          totalVisits: tinyUrls.totalVisits,
        })
        .from(tinyUrls)
        .where(eq(tinyUrls.id, createUrl.id));

      if (!findCreatedShortUrl) {
        return res
          .status(500)
          .json(
            new ApiError(
              500,
              "Something Went Wrong While Createing  the short url please try again"
            )
          );
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            findCreatedShortUrl,
            "Url Shortend Created Succesfully"
          )
        );
    }
  } catch (error: any) {
    return res
      .status(500)
      .json(
        new ApiError(500, `assign Role Request Failed : ${error?.message}`)
      );
  }
});

export { createShortURL };
