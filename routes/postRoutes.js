import express from "express";
import * as dotenv from "dotenv";

import {
  mintImage,
  uploadFile,
  getUserFiles,
  deleteFile,
  fileSizeLimitErrorHandler,
} from "../controllers/posts.js";
import { getOrCreateUser } from "../middleware/auth.js";
import { isPostOwner, hasMagmel } from "../middleware/posts.js";
import upload from "../middleware/multer.js";

dotenv.config();

const router = express.Router();

router.route("/").post(mintImage);
router
  .route("/upload/")
  .post(
    upload.single("file"),
    fileSizeLimitErrorHandler,
    getOrCreateUser,
    hasMagmel,
    uploadFile
  );
router.route("/file/delete/").post(isPostOwner, hasMagmel, deleteFile);
router
  .route("/files/:owner/")
  .get(getOrCreateUser, isPostOwner, hasMagmel, getUserFiles);

export default router;
