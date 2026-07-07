import { ethers } from "ethers";
import { MedicalRecordABI } from "./MedicalRecordABI";

const RPC_URL = process.env.NEXT_PUBLIC_BOT_RPC;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MEDICAL_RECORD_CONTRACT;

if (!RPC_URL) {
  throw new Error("NEXT_PUBLIC_BOT_RPC is missing");
}

if (!CONTRACT_ADDRESS) {
  throw new Error("NEXT_PUBLIC_MEDICAL_RECORD_CONTRACT is missing");
}

// Read provider
export const provider = new ethers.JsonRpcProvider(RPC_URL);

// Read-only contract
export const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  MedicalRecordABI,
  provider
);

// Create a signer from a private key
export function getSignerContract() {
  const privateKey = process.env.BOT_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("BOT_PRIVATE_KEY is missing");
  }

  const wallet = new ethers.Wallet(privateKey, provider);

  return new ethers.Contract(
    CONTRACT_ADDRESS!,
    MedicalRecordABI,
    wallet
  );
}