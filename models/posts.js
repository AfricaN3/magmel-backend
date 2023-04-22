import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    file: { type: String, required: true },
    owner: { type: String, required: true },
    publicId: { type: String, required: true },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
