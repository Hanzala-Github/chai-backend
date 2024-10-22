import mongoose from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
// toggleSubscription
const toggleSubscription = asyncHandler(async (req, res) => {
  const { subscriberId, channelId } = req.params;

  if (!subscriberId || !channelId) {
    throw new ApiError(400, "Subscriber ID and Channel ID are required.");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSubscription) {
    await existingSubscription.remove();
    return res
      .status(200)
      .json(
        new ApiResponse(201, { success: true }, "Unsubscribed successfully")
      );
  } else {
    const newSubscription = new Subscription({
      subscriber: subscriberId,
      channel: channelId,
    });

    await newSubscription.save();
    return res
      .status(200)
      .json(new ApiResponse(201, { success: true }, "Subscribed successfully"));
  }
});

// getUserChannelSubscribers
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(channelId)) {
    throw new ApiError(400, "Invalid channel Id formate");
  }

  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  const subscribers = await Subscription.find({ channel: channelId })
    .skip(skip)
    .limit(limit)
    .populate("subscriber", "username fullName avatar")
    .exec();

  if (subscribers.length === 0) {
    throw new ApiError(404, "No subscriber found for this channel");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subscribers, page, limit },
        "Scbscriber fetched successfully"
      )
    );
});

// getSubscribedChannels

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "Subscriber ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber ID format");
  }

  const subscriptions = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username fullName avatar")
    .exec();

  if (!subscriptions.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No subscribed channels found"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscriptions,
        "Subscribed channels retrieved successfully"
      )
    );
});

// This is the export part
export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
