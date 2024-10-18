import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

// create the video
const CreateVideo = asyncHandler(async (req, res) => {
  const { title, description, duration, owner } = req.body;

  const videoFilePath = req.file?.path;

  if (!videoFilePath) {
    throw new ApiError(400, "videoFile path is missing");
  }

  const uploadResult = await uploadOnCloudinary(videoFilePath);

  if (!uploadResult) {
    throw new ApiError(500, "Failed to upload video");
  }

  // if (video.thumbnail) {
  //   await uploadOnCloudinary.uploader.destroy(video.thumbnail.public_id);
  // }

  const newVideo = new Video({
    videoFile: uploadResult?.secure_url,
    thumbnail: uploadResult?.thumbnail_url,
    title,
    description,
    duration,
    owner,
  });

  await newVideo.save();

  res
    .status(200)
    .json(new ApiResponse(201, { newVideo }, "Video created successfully"));
});

// Get videos with pagination

const GetVideosWithPagination = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, isPublished, owner } = req.query;

  const matchCriteria = {};

  if (isPublished !== undefined) {
    matchCriteria.isPublished = isPublished === "true";
  }
  if (!owner) {
    throw new ApiError(404, "owner not found");
  } else {
    matchCriteria.owner = owner;
  }

  const aggergateQuery = Video.aggregate([{ $match: matchCriteria }]);
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 },
  };

  const Videos = await Video.aggregatePaginate(aggergateQuery, options);

  // return response

  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { Videos },
        "video aggregatePaginate generate successfully"
      )
    );
});

// Get single video

const GetSingleVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id).populate("owner");

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(201, { video }, "video find successfully"));
});

//UpdateVideo

const UpdateVideo = asyncHandler(async (req, res) => {
  const { videoFile, thumbnail, title, description, duration, isPublished } =
    req.body;

  const { id } = req.params;

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const updateFields = {};

  if (videoFile) {
    const uploadedVideo = await uploadOnCloudinary(videoFile);

    if (!uploadedVideo) {
      throw new ApiError(500, "Failed to upload video to cloudinary");
    }

    // delete the video from cloudinary
    if (video.videoFile) {
      await uploadOnCloudinary.uploader.destroy(video.videoFile.public_id);
    }

    updateFields.videoFile = uploadedVideo.url;
  }

  if (thumbnail) {
    const uploadedThumbnail = await uploadOnCloudinary(thumbnail);

    if (!uploadedThumbnail) {
      throw new ApiError(500, "Failed to upload thumbnail to cloudinary");
    }

    // delete the thumbnail from cloudinary
    if (video.thumbnail) {
      await uploadOnCloudinary.uploader.destroy(video.thumbnail.public_id);
    }

    updateFields.thumbnail = uploadedThumbnail.url;
  }

  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (duration) updateFields.duration = duration;
  if (isPublished) updateFields.isPublished = isPublished;

  const updatedVideo = await Video.findByIdAndUpdate(
    id,
    {
      $set: { updateFields },
    },
    { new: true }
  );

  await updatedVideo.save();

  res
    .status(200)
    .json(new ApiResponse(201, { updatedVideo }, "Video updated successfully"));
});

//DeleteVideo

const DeleteVideo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findByIdAndDelete(id);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(201, null, "video deleted successfully"));
});

// togglePublishStatus

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  video.isPublished = !video.isPublished;

  const updatedVideo = await video.save();
  res
    .status(200)
    .json(
      new ApiResponse(
        201,
        { video: updatedVideo },
        video.isPublished
          ? "This video has been published."
          : "This video has been unpublished."
      )
    );
});

// ....This is the export part of the all controllers..........//
export {
  CreateVideo,
  GetVideosWithPagination,
  GetSingleVideo,
  UpdateVideo,
  DeleteVideo,
  togglePublishStatus,
};
