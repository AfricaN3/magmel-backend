import express from "express";
import * as dotenv from "dotenv";

import { chatWithFile } from "../controllers/chat.js";
import { isPostOwner, hasMagmel } from "../middleware/posts.js";

dotenv.config();

const router = express.Router();

router.route("/:fileId").post(isPostOwner, hasMagmel, chatWithFile);

export default router;
