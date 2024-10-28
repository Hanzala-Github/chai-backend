import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// toggleVideoLike
const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId || !userId) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId formate");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (existingLike) {
    await existingLike.remove();
    const likeCount = await Like.countDocuments({ video: videoId });
    res.status(200).json(new ApiResponse(200, { likeCount }, "Video unLiked"));
  } else {
    const newLike = new Like({
      video: videoId,
      likedBy: userId,
    });

    await newLike.save();
    const likeCount = await Like.countDocuments({ video: videoId });
    res.status(200).json(200, { likeCount }, "Video liked");
  }
});

// toggleCommentLike
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId || !userId) {
    throw new ApiError(400, "Comment ID and User ID are required.");
  }

  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment ID formate.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const comment = await Comment.findById(commentId).session(session);

    if (!comment) {
      throw new ApiError(404, "Comment not found.");
    }

    const existingLike = await Like.findOne({
      comment: commentId,
      likedBy: userId,
    }).session(session);

    let likeCount;

    if (existingLike) {
      // Remove the like (unlike)
      await existingLike.remove({ session });
      likeCount = await Like.countDocuments({ comment: commentId }).session(
        session
      );
      await session.commitTransaction();
      return res
        .status(200)
        .json(new ApiResponse(200, { likeCount }, "Comment unliked."));
    } else {
      // Add a like
      const newLike = new Like({
        comment: commentId,
        likedBy: userId,
      });
      await newLike.save({ session });
      likeCount = await Like.countDocuments({ comment: commentId }).session(
        session
      );
      await session.commitTransaction();
      return res
        .status(200)
        .json(new ApiResponse(200, { likeCount }, "Comment liked."));
    }
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(500, "An error occurred while toggling the like.");
  } finally {
    session.endSession();
  }
});

// toggleTweetLike
const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId || !userId) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId formate");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tweet = await Like.findById(tweetId).session(session);
    if (!tweet) {
      throw new ApiError(404, "tweet not found");
    }

    const existingLike = await Like.findOne({
      tweet: tweetId,
      likedBy: userId,
    }).session(session);

    let likeCount;

    if (existingLike) {
      await existingLike.remove({ session });

      likeCount = await Like.countDocuments({ tweet: tweetId });
      await session.commitTransaction();

      res
        .status(200)
        .json(new ApiResponse(200, { likeCount }, "tweet unLiked"));
    } else {
      const newLike = new Like({
        tweet: tweetId,
        likedBy: userId,
      }).session(session);

      await newLike.save({ session });

      await session.commitTransaction();
      res.status(200).json(new ApiResponse(200, { likeCount }, "Tweet liked"));
    }
  } catch (error) {
    await session.abortTransaction();
    return next(new ApiError(500, error.message));
  } finally {
    session.endSession();
  }
});

// getLikedVideos
const getLikedVideos = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  try {
    const likedVideos = await Like.find({
      likedBy: userId,
      video: { $exists: true },
    }).populate("video");

    if (!likedVideos.length) {
      return res
        .status(404)
        .json(new ApiResponse(404, [], "No liked videos found"));
    }

    const videos = likedVideos.map((like) => like.video);

    res
      .status(200)
      .json(
        new ApiResponse(200, { videos }, "Liked videos retrieved successfully")
      );
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});

// This is the export
export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos };
