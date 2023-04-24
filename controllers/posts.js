import * as dotenv from "dotenv";
import { NFTStorage, File } from "nft.storage";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import { utoa } from "unicode-encode";
import fs from "fs";

import Post from "../models/posts.js";
import { ingestData, deleteVector } from "../utils/ingestData.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* GENERATE NFT METADATA (TODO: MAKE MODEL TRAIT DYNAMIC) */
export const mintImage = async (req, res) => {
  try {
    const { name, description, owner, image } = req.body;

    const nftstorage = new NFTStorage({
      token: process.env.NFT_STORAGE_API_KEY,
    });

    // Send request to store image
    const { ipnft } = await nftstorage.store({
      image: new File([image], "image", { type: "image/jpeg" }),
      name: name,
      description: description,
      owner: owner,
    });

    // Save the URL
    const uri = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;

    const response = await axios.get(`${uri}`);
    const metadata = response.data;
    // Define the NFT attributes
    // TODO make the models to be dynamic
    const attributes = [
      {
        trait_type: "model", // The attribute type/key
        value: "openjourney", // The attribute value
        display_type: "", // The display format
      },
      {
        trait_type: "utility", // The attribute type/key
        value: "generic", // The attribute value
        display_type: "", // The display format
      },
      {
        trait_type: "generatedOn", // The attribute type/key
        value: Date.now(), // The attribute value
        display_type: "date", // The display format
      },
      // No third attribute
      // An arbitrary number of attributes may be added for custom apps
    ];

    // Define the NFT properties
    const properties = {
      has_locked: false, // Is there locked content
      type: 2,
    };

    // Put it together
    const jsonMetadata = JSON.stringify({
      name: metadata.name,
      description: metadata.description,
      image: metadata.image,
      tokenURI: uri,
      attributes,
      properties,
    });

    const encodedData = utoa(jsonMetadata);

    res.status(200).json({ success: true, data: encodedData, uri });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Unable to generate Metadata" });
  }
};

export const fileSizeLimitErrorHandler = (err, req, res, next) => {
  if (err) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: err.message });
    }
    console.log(err);
  } else {
    next();
  }
};

// TODO ADD MIDDLEWARE TO ENSURE RATE LIMIT FOR UPLOADS
// Upload PDF file
export const uploadFile = async (req, res) => {
  try {
    const { path } = req.file;
    const { name, description, owner } = req.body;
    const cloudinarySavedFile = await cloudinary.uploader.upload(path, {
      folder: "magmel",
      resource_type: "auto",
    });

    const newPost = await Post.create({
      name,
      description,
      file: cloudinarySavedFile.url,
      owner,
      publicId: cloudinarySavedFile.public_id,
    });

    await ingestData(path, newPost._id.toString());

    fs.unlinkSync(path);

    res.status(200).json({ success: true, data: newPost });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Unable to upload file, please try again",
    });
  }
};

// GET USER FILES
export const getUserFiles = async (req, res) => {
  try {
    const { owner } = req.params;
    const posts = await Post.find({ owner });
    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message || "Something went wrong" });
  }
};

// DELETE A FILE
export const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.body;
    const post = await Post.findByIdAndDelete(fileId);
    if (!post) {
      return res.status(404).json({ message: "File is not on database" });
    }
    const deletedResult = await cloudinary.uploader.destroy(post.publicId);
    if (deletedResult?.result !== "ok") {
      return res.status(404).json({ message: "Post not deleted successfully" });
    }
    deleteVector(post._id.toString());
    res.status(200).json({ result: "ok" });
  } catch (err) {
    res.status(404).json({ message: err.message || "Something went wrong" });
  }
};
