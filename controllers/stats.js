import Post from "../models/posts.js";
import User from "../models/users.js";

// GET About page Stats
export const getAboutStats = async (req, res) => {
  try {
    const posts = await Post.countDocuments();
    const users = await User.countDocuments();
    res.status(200).json({ posts, users });
  } catch (err) {
    res.status(404).json({ message: err.message || "Something went wrong" });
  }
};
