import express from "express";
import * as dotenv from "dotenv";

import { mintImage, sendImageToIPFS } from "../controllers/posts.js";

dotenv.config();

const router = express.Router();

router.route("/").post(sendImageToIPFS);

router.route("/mint/").post(mintImage);

export default router;
