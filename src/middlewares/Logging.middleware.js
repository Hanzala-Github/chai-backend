import { asyncHandler } from "../utils/asyncHandler.js";

export const LogRequest = asyncHandler(async (req, _, next) => {
  console.log(`Request to ${req.originalUrl} with query :`, req.query);
  next();
});
