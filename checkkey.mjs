import dotenv from "dotenv";
import { Wallet } from "ethers";

dotenv.config();

console.log("BOT_PRIVATE_KEY exists:", !!process.env.BOT_PRIVATE_KEY);

console.log(
  "Length:",
  process.env.BOT_PRIVATE_KEY ? process.env.BOT_PRIVATE_KEY.length : "undefined"
);

try {
  const wallet = new Wallet(process.env.BOT_PRIVATE_KEY);
  console.log("Wallet Address:", wallet.address);
} catch (err) {
  console.error("ERROR:", err.message);
}