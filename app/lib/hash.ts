import CryptoJS from "crypto-js";

export function hashRecord(data: unknown): string {
  const hash = CryptoJS.SHA256(JSON.stringify(data));
  return hash.toString();
}