import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/Video.model.js";
import { User } from "../models/User.model.js";
import mongoose from "mongoose";

// createPlaylist

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { userId } = req.params;

  if (!name || !description || !userId) {
    throw new ApiError(400, "Name, description, and userId are required.");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const playList = new Playlist({
    name,
    description,
    owner: userId,
  });

  if (!playList) {
    throw new ApiError(401, "playList creation failed please try again");
  }

  await playList.save();

  res
    .status(200)
    .json(new ApiResponse(201, { playList }, "PlayList created successfully"));
});

// getUserPlaylists
const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(401, "userId is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const playlists = await Playlist.find({ owner: userId });

  if (playlists.length === 0) {
    throw new ApiError(404, "No playlists found for this user.");
  }
  res
    .status(200)
    .json(
      new ApiResponse(201, { playlists }, "user playlist get successfylly")
    );
});

// getPlaylistById
const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID format.");
  }
  // This populate method choose only needed fields and another fields remove it
  const playlistById = await Playlist.findById(playlistId).populate(
    "owner",
    "username email"
  );

  if (!playlistById) {
    throw new ApiError(404, "playList not found");
  }

  res
    .status(200)
    .json(new ApiResponse(201, { playlistById }, "get playList successfully"));
});

// addVideoToPlaylist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(400, "Invalid playlistId or videoId format.");
  }

  if (!playlistId || !videoId) {
    throw new ApiError(400, "playlistId and videoId are required.");
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found.");
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
    }

    if (playlist.videos.includes(videoId)) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            { playlist },
            "Video already exists in the playlist."
          )
        );
    }

    playlist.videos.push(videoId);
    await playlist.save();

    res
      .status(200)
      .json(new ApiResponse(200, { playlist }, "Video added successfully."));
  } catch (error) {
    throw new ApiError(
      500,
      "An error occurred while adding the video to the playlist."
    );
  }
});

//  removeVideoFromPlaylist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(playlistId) ||
    !mongoose.Types.ObjectId.isValid(videoId)
  ) {
    throw new ApiError(401, "playList and videoId formate is incorrect");
  }

  if (!playlistId || !videoId) {
    throw new ApiError(400, "playList and videoId are required");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found.");
  }

  const videoIndex = playlist.videos.indexOf(videoId);

  if (videoIndex === -1) {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "Video not found in the playlist"));
  }

  playlist.videos.splice(videoIndex, 1);

  await playlist.save();

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { playlist },
        "Video removed successfully from the playlist."
      )
    );
});

// deletePlaylist
const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "Invalid playlistId format.");
  }

  if (!playlistId) {
    throw new ApiError(400, "playlistId is required.");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found.");
    }

    await playlist.deleteOne();

    res
      .status(200)
      .json(new ApiResponse(200, {}, "Playlist deleted successfully."));
  } catch (error) {
    throw new ApiError(500, "An error occurred while deleting the playlist.");
  }
});

// updatePlaylist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiError(400, "The provided playlist ID format is incorrect.");
  }

  if (!name && !description) {
    throw new ApiError(400, "At least one of name or description is required.");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: { name, description } },
    { new: true, runValidators: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(404, "Playlist not found.");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedPlaylist },
        "Playlist updated successfully."
      )
    );
});

//.......... This is the export part..............//
export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
