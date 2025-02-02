import { env } from "@/lib/env";
import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  type CipherGCMTypes,
  type Encoding,
} from "node:crypto";

const algo: CipherGCMTypes = "aes-256-gcm";
const inputEncoding: Encoding = "utf8";
const outputEncoding: Encoding = "hex";

const byteLength = 16;

const key = env.SERVER_SECRET;

const encrypt = (k: string, input: string): string => {
  const iv = randomBytes(byteLength);

  const cipher = createCipheriv(algo, key, iv);
  const text = JSON.stringify({
    [`${k}`]: input,
  });

  let result = cipher.update(text, inputEncoding, outputEncoding);
  result += cipher.final(outputEncoding);

  const authTag = cipher.getAuthTag();

  return (
    iv.toString(outputEncoding) + authTag.toString(outputEncoding) + result
  );
};

const decrypt = (k: string, secret: string): string => {
  const iv = secret.slice(0, 2 * byteLength);
  const authtag = secret.slice(2 * byteLength, 4 * byteLength);
  const encrypted = secret.slice(4 * byteLength);

  if (!iv || !encrypted) {
    throw new Error("Invalid secret.");
  }

  const decipher = createDecipheriv(algo, key, Buffer.from(iv, outputEncoding));
  decipher.setAuthTag(Buffer.from(authtag, outputEncoding));

  let result = decipher.update(encrypted, outputEncoding, inputEncoding);
  result += decipher.final(inputEncoding);

  return JSON.parse(result)[k];
};

export { encrypt, decrypt };
