import express from "express";
import * as dotenv from "dotenv";

import {
  generateImage,
  generatePrompt,
  summarizePrompt,
} from "../controllers/openAi.js";

dotenv.config();

const router = express.Router();

router.route("/").get((req, res) => {
  res.status(200).json({ message: "Hello from Magpie Melanges AI route!" });
});

router.route("/").post(generateImage);

router.route("/prompt/").post(generatePrompt);

router.route("/prompt/summarize/").post(summarizePrompt);

export default router;
