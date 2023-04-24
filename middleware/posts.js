import { wallet } from "@cityofzion/neon-core";

import isValidToken from "../utils/isValidToken.js";
import { magmelContract, toInvocationArgument } from "../utils/contract.js";

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

export const hasMagmel = async (req, res, next) => {
  try {
    const owner = req.body.owner || req.params.owner;
    if (!owner) {
      return res.status(401).send("Invalid Request");
    }

    const ownerBalanceResult = await magmelContract.testInvoke("balanceOf", [
      toInvocationArgument("Hash160", owner),
    ]);

    let count = ownerBalanceResult.stack[0].value;
    if (parseInt(count) < 1) {
      return res
        .status(402)
        .send(
          "You have no MAGMEL, To upload documents and train the AI, you must first mint an NFT."
        );
    }

    req.hasMagmel = true;
    next();
  } catch (err) {
    res.status(500).json(`${err.message || "Server error!!!"}`);
  }
};
