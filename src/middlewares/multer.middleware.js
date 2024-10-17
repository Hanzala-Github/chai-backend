// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// export const upload = multer({
//   storage,
// });

import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Create a storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination directory
    cb(null, "./public/temp"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    // Generate a unique filename using UUID and keep the original extension
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Set up the multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10, // Limit files to 10MB (adjust as needed)
  },
  fileFilter: (req, file, cb) => {
    // Accept only specific file types
    const filetypes = /mp4|mkv|avi|mov|jpg|jpeg|png/; // Add more as needed
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Error: File type not supported!")); // Reject the file
  },
});

export { upload };
