import express from "express";
import * as dotenv from "dotenv";

import { getAboutStats } from "../controllers/stats.js";

dotenv.config();

const router = express.Router();

router.route("/about/").get(getAboutStats);

export default router;
