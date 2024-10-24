import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const healthcheck = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(
        new ApiResponse(200, {}, "Check Kar Server Ki Health Tu Check Kar")
      );
  } catch (error: any) {
    throw new ApiError(500, error?.message);
  }
});

export { healthcheck };
