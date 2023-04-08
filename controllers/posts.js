import * as dotenv from "dotenv";
import { NFTStorage, File } from "nft.storage";
import axios from "axios";
import { utoa } from "unicode-encode";

dotenv.config();

/* SEND IMAGE TO IPFS */
export const sendImageToIPFS = async (req, res) => {
  try {
    const { name, prompt, owner, imageData, photo } = req.body;

    const nftstorage = new NFTStorage({
      token: process.env.NFT_STORAGE_API_KEY,
    });

    // Send request to store image
    const { ipnft, url } = await nftstorage.store({
      image: new File([photo], "image", { type: "image/jpeg" }),
      name: name,
      description: prompt,
      owner: owner,
    });

    // Save the URL
    const uri = `https://ipfs.io/ipfs/${ipnft}/metadata.json`;

    res.status(200).json({ success: true, data: uri });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Unable to Mint image to ipfs" });
  }
};

/* GENERATE NFT METADATA (TODO: MAKE MODEL TRAIT DYNAMIC) */
export const mintImage = async (req, res) => {
  try {
    const { uri } = req.body;

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

    res.status(200).json({ success: true, data: encodedData });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Unable to generate Metadata" });
  }
};
