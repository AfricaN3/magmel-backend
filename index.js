import express from "express";
import helmet from "helmet";
import * as dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";

import postRoutes from "./routes/postRoutes.js";
import openAiRoutes from "./routes/openAiRoutes.js";
import { verifyToken } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors());

app.use("/api/v1/post", verifyToken, postRoutes);
app.use("/api/v1/ai", verifyToken, openAiRoutes);

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Hello from Magpie Melanges!",
  });
});

const startServer = async () => {
  try {
    app.listen(8080, () => console.log("Server started on port 8080"));
  } catch (error) {
    console.log(error);
  }
};

startServer();
