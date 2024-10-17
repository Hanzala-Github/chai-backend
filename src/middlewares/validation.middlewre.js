import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const validationPagination = asyncHandler((req, _, next) => {
  const { page, limit } = req.body;

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination parameters");
  }

  next();
});
