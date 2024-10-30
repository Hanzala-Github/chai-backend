import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  const dbStatus = checkDatabaseConnection();

  res.status(200).json({
    status: "Ok",
    message: "Server is up and running",
    dependencies: {
      database: dbStatus ? "Connected" : "Disconnected",
    },
    timestamp: new Date().toISOString(),
  });
});

const checkDatabaseConnection = () => {
  return mongoose.connection.readyState === 1;
};

export { healthcheck };
