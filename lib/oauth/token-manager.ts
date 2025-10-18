import 'server-only';
import crypto from "crypto";

const ENCRYPTION_KEY = Buffer.from(
  process.env.ENCRYPTION_KEY || "dev-secret-key-1234567890123456", // 32 chars
  "utf-8"
);
const IV_LENGTH = 16;

export class TokenManager {
  static encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  }

  static decrypt(encryptedText: string): string {
    const [ivHex, dataHex] = encryptedText.split(":");
    const iv = Buffer.from(ivHex, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(dataHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }
}
