import { wallet, u } from "@cityofzion/neon-core";
import isValidToken from "../utils/isValidToken.js";
import User from "../models/users.js";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).send("Access Denied");
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    } else {
      return res
        .status(401)
        .send("Invalid Authorization Token Prefix.  'Bearer <TOKEN>'");
    }

    const authObject = isValidToken(token);

    if (!authObject) {
      return res.status(401).send("Invalid Authorization Token");
    }

    const message = authObject.salt + authObject.message;
    const parameterHexString = Buffer.from(message).toString("hex");
    const lengthHex = u.num2VarInt(parameterHexString.length / 2);
    const concatenatedString = lengthHex + parameterHexString;
    const messageHex = "010001f0" + concatenatedString + "0000";
    const verified = wallet.verify(
      messageHex,
      authObject.data,
      authObject.publicKey
    );

    if (!verified) {
      return res.status(403).send("Forbidden");
    }

    req.user = verified;
    next();
  } catch (err) {
    console.log(err);
    res.status(500).json(`${err.message || "Server error!!!"}`);
  }
};

export const getOrCreateUser = async (req, res, next) => {
  try {
    const owner = req.body.owner || req.params.owner;

    if (!owner || !wallet.isAddress(owner)) {
      return res.status(401).send("Invalid Request");
    }

    if (!!owner && wallet.isAddress(owner)) {
      const userExist = await User.exists({ address: owner });

      let savedUser;

      if (!!userExist) {
        savedUser = await User.findById(userExist._id);
      } else {
        const newUser = new User({
          address: owner,
        });
        savedUser = await newUser.save();
      }

      res.user = savedUser;
      next();
    }
  } catch (err) {
    res.status(500).json(`${err.message || "Server error!!!"}`);
  }
};
