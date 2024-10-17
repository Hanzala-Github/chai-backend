import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyOwnership = asyncHandler(async (req, _, next) => {
  const { id } = req.params;

  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(404, "owner not found");
  }

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  if (!video.owner.equals(userId)) {
    throw new ApiError(403, "You do not have permission to modify this video");
  }
  next();
});
