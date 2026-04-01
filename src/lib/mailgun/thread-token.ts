import { randomBytes } from "crypto";

/** URL-safe opaque token for reply+TOKEN@domain (hex only, no +/=). */
export function generateMailThreadToken(): string {
  return randomBytes(24).toString("hex");
}
