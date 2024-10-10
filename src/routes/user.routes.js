import { Router } from "express";
import {
  LoginUser,
  LogoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();
// ....register route
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// ...Login route
router.route("/login").post(LoginUser);

// ...LogOut route
// secure routes
router.route("/logout").post(verifyJWT, LogoutUser);
router.route("/refresh-token").post(refreshAccessToken);

export default router;
