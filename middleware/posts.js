import { wallet } from "@cityofzion/neon-core";

import isValidToken from "../utils/isValidToken.js";

export const isPostOwner = async (req, res, next) => {
  try {
    const owner = req.body.owner || req.params.owner;
    if (!owner) {
      return res.status(401).send("Invalid Request");
    }
    let token = req.header("Authorization");
    token = token.slice(7, token.length).trimLeft();
    const authObject = isValidToken(token);

    if (
      wallet.getScriptHashFromPublicKey(authObject.publicKey) ===
      wallet.getScriptHashFromAddress(owner)
    ) {
      req.isPostOwner = true;
      next();
    } else {
      return res.status(403).send("Forbidden");
    }
  } catch (err) {
    res.status(500).json(`${err.message || "Server error!!!"}`);
  }
};
