import Neon from "@cityofzion/neon-js";
import { rpc, sc } from "@cityofzion/neon-core";

import {
  rpcAddress,
  networkMagic,
  magmelContractAddress,
} from "./constants.js";

export const rpcClient = new rpc.RPCClient(rpcAddress);

export const magmelContract = new Neon.experimental.SmartContract(
  Neon.u.HexString.fromHex(magmelContractAddress),
  {
    networkMagic: networkMagic,
    rpcAddress: rpcAddress,
  }
);

export function toInvocationArgument(type, value) {
  const arg = { type, value };

  switch (type) {
    case "Any":
      arg.value = null;
      break;
    case "Boolean":
      // Does basic checks to convert value into a boolean. Value field will be a boolean.
      let _value = value;
      if (typeof _value === "string") {
        _value = _value === "true" || _value === "1";
      }
      arg.value = sc.ContractParam.boolean(_value).toJson().value;
      break;
    case "Integer":
      // A value that can be parsed to a BigInteger. Numbers or numeric strings are accepted.
      arg.value = sc.ContractParam.integer(value).toJson().value;
      break;
    case "ByteArray":
      // A string or HexString.
      arg.value = sc.ContractParam.byteArray(value).toJson().value;
      break;
    case "String":
      // UTF8 string.
      arg.value = sc.ContractParam.string(value).toJson().value;
      break;
    case "Hash160":
      // A 40 character (20 bytes) hexstring. Automatically converts an address to scripthash if provided.
      arg.value = sc.ContractParam.hash160(value).toJson().value;
      break;
    case "Hash256":
      // A 64 character (32 bytes) hexstring.
      arg.value = sc.ContractParam.hash256(value).toJson().value;
      break;
    case "PublicKey":
      // A public key (both encoding formats accepted)
      arg.value = sc.ContractParam.publicKey(value).toJson().value;
      break;
    case "Signature":
      // TODO: NOT SUPPORTED
      break;
    case "Array":
      // Pass an array as JSON [{type: 'String': value: 'blabla'}]
      arg.value = sc.ContractParam.fromJson(value).toJson().value;
      break;
    case "Map":
      // TODO: NOT SUPPORTED
      break;
    case "InteropInterface":
      // TODO: NOT SUPPORTED
      break;
    case "Void":
      // Value field will be set to null.
      arg.value = null;
      break;
    default:
      arg.value = sc.ContractParam.byteArray(value).toJson().value;
  }

  return arg;
}
