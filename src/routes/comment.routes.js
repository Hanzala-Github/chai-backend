import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controller.js";

const router = Router();

// All routes use JWT verification
router.use(verifyJWT);

// Get comments for a specific video and add a new comment
router.route("/:videoId/comments").get(getVideoComments).post(addComment);

// Update or delete a specific comment by its ID
router.route("/comments/:commentId").delete(deleteComment).patch(updateComment);

export default router;
