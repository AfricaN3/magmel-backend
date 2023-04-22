import express from "express";
import * as dotenv from "dotenv";

import { chatWithFile } from "../controllers/chat.js";
import { isPostOwner } from "../middleware/posts.js";

dotenv.config();

const router = express.Router();

router.route("/:fileId").post(isPostOwner, chatWithFile);

export default router;
