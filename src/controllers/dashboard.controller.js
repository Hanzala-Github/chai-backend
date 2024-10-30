import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { Video } from "../models/video.model.js";
import { Like } from "../models/like.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;

  const totalSubscribers = await Subscription.countDocuments({
    channel: channelId,
  });

  if (!totalSubscribers) {
    throw new ApiError(400, "Subscription model are required");
  }

  const totalVideos = await Video.countDocuments({ owner: userId });
  const totalLikes = await Like.countDocuments({ likedBy: userId });
  const totalVideosViews = await Video.aggregate([
    {
      $group: {
        _id: null,
        totalViews: { $sum: "$views" },
      },
    },
  ]);

  const totalViews =
    totalVideosViews.length > 0 ? totalVideosViews[0].totalVideos : 0;

  const channelState = {
    totalVideos,
    totalLikes,
    totalVideosViews,
    totalViews,
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { data: channelState },
        "Channel statistics retrieved successfully"
      )
    );
});

//  getChannelVideos
const getChannelVideos = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

  if (!channelId) {
    throw new ApiError(400, "channelId is required");
  }

  const parsedLimit = Number(limit);
  const parsedPage = Number(page);

  const videos = await Video.find({ owner: channelId })
    .sort(sort)
    .skip((parsedPage - 1) * parsedLimit)
    .limit(parsedLimit)
    .select("title duration views thumbnail");

  if (!videos.length) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, { data: [] }, "No videos found for this channel.")
      );
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, { data: videos }, "Videos retrieved successfully")
    );
});

// This is the export part
export { getChannelStats, getChannelVideos };
