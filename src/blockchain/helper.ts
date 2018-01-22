import * as crypto from "crypto";
import { Block } from "./block";

export function blockHash(block: Block): string {
    return crypto.createHash("sha256")
      .update(JSON.stringify(block))
      .digest("hex");
}

export function hash(str: string): string {
    return crypto.createHash("sha256")
      .update(str)
      .digest("hex");
}
