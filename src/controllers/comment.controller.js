import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/APiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

// get video comments
const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const comments = await Comment.find({ video: videoId })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  if (!comments || comments.length === 0) {
    throw new ApiError(404, "No commint found for this video");
  }

  const totalComments = await Comment.countDocuments({ video: videoId });

  res.status(200).json(
    new ApiResponse(201, {
      comments,
      currentPage: page,
      totalPages: Math.ceil(totalComments / limit),
      totalComments,
    })
  );
});

// addComment

const addComment = asyncHandler(async (req, res) => {
  const { videoId, text, userId } = req.body;

  if (!text || text.trim().length === 0 || !videoId) {
    throw new ApiError(400, "Text length and videoId are required");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const comment = new Comment({
    video: videoId,
    user: userId,
    text,
  });

  await comment.save();
  res
    .status(200)
    .json(new ApiResponse(201, { comment }, "comment added successfully"));
});

// updateComment

const updateComment = asyncHandler(async (req, res) => {
  const { videoId, userId, text } = req.body;

  if (!videoId || !userId || text.trim().length === 0) {
    throw new ApiError(400, "Text, userId, and videoId are required");
  }

  const comment = await Comment.findOneAndUpdate(
    { video: videoId, user: userId },
    { $set: { text } },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  res.status(200).json(201, { comment }, "comment is updated successfully");
});

// deleteComment

const deleteComment = asyncHandler(async (req, res) => {
  const { videoId, userId } = req.body;

  const comment = await Comment.findOneAndDelete({
    video: videoId,
    user: userId,
  });

  if (!comment) {
    throw new ApiError(404, "comment not found");
  }
  res.status(200).json(201, null, "comment deleted successfully");
});
// This is the export part
export { getVideoComments, addComment, updateComment, deleteComment };
