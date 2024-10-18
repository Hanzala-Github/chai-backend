import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  CreateVideo,
  DeleteVideo,
  GetSingleVideo,
  GetVideosWithPagination,
  togglePublishStatus,
  UpdateVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validationPagination } from "../middlewares/validation.middlewre.js";
import { LogRequest } from "../middlewares/Logging.middleware.js";
import { verifyOwnership } from "../middlewares/ownerShip.middleware.js";
const router = Router();

// ... route of CreateVideo
router.route("/create-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  CreateVideo
);

// ... route of GetVideosWithPagination
router
  .route("/paginate-videos")
  .get(verifyJWT, validationPagination, LogRequest, GetVideosWithPagination);

// ... route of GetSingleVideo
router
  .route("/single-video/:id")
  .get(verifyJWT, verifyOwnership, GetSingleVideo);

// ... route of updateVideo
router.route("/update-video/:id").put(
  verifyJWT,
  verifyOwnership,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  UpdateVideo
);

// ... route of DeleteVideo
router
  .route("/delete-video/:id")
  .delete(verifyJWT, verifyOwnership, DeleteVideo);

// ... route of togglePublishStatus
router
  .route("/toggle/publish/:videoId")
  .patch(verifyJWT, verifyOwnership, togglePublishStatus);

// Export the route
export default router;
