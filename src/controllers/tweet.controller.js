import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// createTweet
const createTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const { content } = req.body;

  if (!userId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId formate");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const newTweet = new Tweet({
    content,
    owner: userId,
  });

  await newTweet.save();

  res
    .status(200)
    .json(new ApiResponse(200, { newTweet }, "Tweet created successfully"));
});

// getUserTweets
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!userId) {
    throw new ApiError(400, "userId are required");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid tweetId and userId formate");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const skip = (page - 1) * limit;

  const tweets = await Tweet.find({ owner: userId })
    .limit(Number(limit))
    .skip(skip)
    .sort({ createdAt: -1 })
    .populate("owner", "username fullName avatar")
    .exec();

  if (tweets.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No tweets found for this user"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { tweets }, "User tweets retrieved successfully")
    );
});

// updateTweet

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  if (!tweetId || !content) {
    throw new ApiError(400, "All fields are required");
  }

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId formate");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id) {
    throw new ApiError(403, "You are not authorized to update this tweet");
  }

  tweet.content = content;
  const updateTweet = await tweet.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updateTweet },
        "Your tweet was updated successfully"
      )
    );
});

// deleteTweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet Id are required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id formate");
  }

  const deleteTweet = await Tweet.findOneAndDelete({ _id: tweetId });

  if (!deleteTweet) {
    throw new ApiError(404, "Tweet not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});
// This is the export part
export { createTweet, getUserTweets, updateTweet, deleteTweet };
