import { Router } from "express";
import {
  LoginUser,
  LogoutUser,
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

router.route("/logout").post(verifyJWT, LogoutUser);

export default router;
