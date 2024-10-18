import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    Credential: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// routes import
import userRouter from "./routes/user.routes.js";

// user routes
app.use("/api/v1/users", userRouter);
// video routes
import videoRouter from "./routes/video.routes.js";
app.use("/api/v1/videos", videoRouter);

// comment route
import commentRouter from "./routes/comment.routes.js";
app.use("/api/v1/comments", commentRouter);
export { app };
