import { ethers } from "ethers";
import { MedicalRecordABI } from "../MedicalRecordABI";
import { hashRecord } from "../hash";
import { getBotChainConfig } from "./config";
import type {
  BlockchainMilestone,
  BlockchainRecordResult,
  ChainStatus,
  ConsentRecordPayload,
  MilestoneAttestationPayload,
  WalletState,
} from "./types";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

function getConfig() {
  return getBotChainConfig();
}

function getProvider() {
  const config = getConfig();
  if (!config.rpcUrl) {
    throw new Error("BOT Chain RPC URL is not configured.");
  }
  return new ethers.JsonRpcProvider(config.rpcUrl);
}

function getContract(runner: ethers.ContractRunner) {
  const config = getConfig();
  if (!config.contractAddress || config.contractAddress === ZERO_ADDRESS) {
    throw new Error("BOT Chain contract address is not configured.");
  }

  return new ethers.Contract(config.contractAddress, MedicalRecordABI, runner);
}

function getEthereumProvider() {
  if (typeof window === "undefined") return null;

  return (window as Window & typeof globalThis & { ethereum?: ethers.Eip1193Provider }).ethereum ?? null;
}

function mapWalletError(error: unknown) {
  if (typeof error === "object" && error && "code" in error) {
    const walletError = error as { code?: number; message?: string };
    if (walletError.code === 4001) return "Wallet request was rejected.";
    if (walletError.code === 4902) return "BOT Chain is not added to this wallet yet.";
  }

  if (error instanceof Error) return error.message;
  return "Unable to complete the BOT Chain request.";
}

function abbreviateAddress(address: string | null) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getExplorerTransactionUrl(transactionHash?: string | null) {
  const config = getConfig();
  return config.explorerUrl && transactionHash
    ? `${config.explorerUrl.replace(/\/$/, "")}/tx/${transactionHash}`
    : undefined;
}

export function getExplorerAddressUrl(address?: string | null) {
  const config = getConfig();
  return config.explorerUrl && address
    ? `${config.explorerUrl.replace(/\/$/, "")}/address/${address}`
    : undefined;
}

export function getExplorerRecordUrl(recordHash?: string | null) {
  const config = getConfig();
  return config.explorerUrl && recordHash
    ? `${config.explorerUrl.replace(/\/$/, "")}/search?q=${encodeURIComponent(recordHash)}`
    : undefined;
}

export async function getWalletState(): Promise<WalletState> {
  const config = getConfig();
  const ethereum = getEthereumProvider();

  if (!ethereum) {
    return {
      walletAvailable: false,
      connected: false,
      address: null,
      chainId: null,
      chainIdHex: null,
      networkName: config.networkName,
      isCorrectNetwork: false,
    };
  }

  const browserProvider = new ethers.BrowserProvider(ethereum);
  const accounts = await browserProvider.send("eth_accounts", []);
  const network = await browserProvider.getNetwork();
  const chainId = Number(network.chainId);

  return {
    walletAvailable: true,
    connected: accounts.length > 0,
    address: accounts[0] ?? null,
    chainId,
    chainIdHex: `0x${chainId.toString(16)}`,
    networkName: config.networkName,
    isCorrectNetwork: chainId === config.chainId,
  };
}

export async function connectWallet() {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    throw new Error("No wallet provider is available. Install MetaMask or a compatible EVM wallet.");
  }

  const browserProvider = new ethers.BrowserProvider(ethereum);
  await browserProvider.send("eth_requestAccounts", []);
  return getWalletState();
}

export async function switchToBotChain() {
  const ethereum = getEthereumProvider();
  const config = getConfig();

  if (!ethereum) {
    throw new Error("No wallet provider is available.");
  }

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: config.chainIdHex }],
    });
  } catch (error) {
    const walletError = error as { code?: number };
    if (walletError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: config.chainIdHex,
          chainName: config.networkName,
          rpcUrls: config.rpcUrl ? [config.rpcUrl] : [],
          nativeCurrency: config.nativeCurrency,
          blockExplorerUrls: config.explorerUrl ? [config.explorerUrl] : undefined,
        }],
      });
    } else {
      throw error;
    }
  }

  return getWalletState();
}

export async function getChainStatus(): Promise<ChainStatus> {
  const config = getConfig();
  if (!config.rpcUrl) {
    return {
      connected: false,
      chainId: config.chainId,
      networkName: config.networkName,
      contractConfigured: config.isConfigured,
      error: "NEXT_PUBLIC_BOT_RPC is not configured.",
    };
  }

  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    return {
      connected: true,
      chainId: Number(network.chainId),
      networkName: config.networkName,
      rpcUrl: config.rpcUrl,
      contractConfigured: config.isConfigured,
    };
  } catch (error) {
    return {
      connected: false,
      chainId: config.chainId,
      networkName: config.networkName,
      rpcUrl: config.rpcUrl,
      contractConfigured: config.isConfigured,
      error: error instanceof Error ? error.message : "Unable to reach BOT Chain",
    };
  }
}

export async function readTotalRecords() {
  const config = getConfig();
  if (!config.isConfigured) return 0;
  const contract = getContract(getProvider());
  return Number(await contract.totalRecords());
}

export async function verifyRecord(recordHash: string) {
  const contract = getContract(getProvider());
  return Boolean(await contract.verifyRecord(recordHash));
}

export async function getRecordId(recordHash: string) {
  const contract = getContract(getProvider());
  return Number(await contract.getRecordId(recordHash));
}

export async function getRecord(id: number) {
  const contract = getContract(getProvider());
  return contract.getRecord(id);
}

export function buildMilestoneAttestation(milestone: BlockchainMilestone): MilestoneAttestationPayload {
  return {
    milestoneId: milestone.id,
    type: milestone.type,
    category: milestone.category,
    actor: milestone.actor,
    consentGranted: milestone.consentGranted,
    occurredAt: milestone.occurredAt,
    subjectFingerprint: hashRecord({
      patientRef: milestone.patientRef,
      actor: milestone.actor,
    }),
    summaryFingerprint: hashRecord({
      title: milestone.title,
      summary: milestone.summary,
      metadata: milestone.metadata ?? {},
    }),
  };
}

export async function writeMilestoneRecord(milestone: BlockchainMilestone): Promise<BlockchainRecordResult> {
  if (!milestone.consentGranted) {
    return { success: false, state: "idle", error: "Consent was not granted." };
  }

  try {
    const wallet = await getWalletState();
    if (!wallet.walletAvailable) {
      return { success: false, state: "error", error: "No wallet provider is available." };
    }
    if (!wallet.connected) {
      return { success: false, state: "error", error: "Connect your wallet before recording a milestone." };
    }
    if (!wallet.isCorrectNetwork) {
      return { success: false, state: "error", error: "Switch your wallet to BOT Chain before continuing." };
    }

    const browserProvider = new ethers.BrowserProvider(getEthereumProvider()!);
    const signer = await browserProvider.getSigner();
    const contract = getContract(signer);
    const attestation = buildMilestoneAttestation(milestone);
    const recordHash = hashRecord(attestation);
    const tx = await contract.addRecord(recordHash, milestone.category);
    const receipt = await tx.wait();

    return {
      success: true,
      state: "confirmed",
      recordHash,
      transactionHash: receipt?.hash ?? tx.hash,
      explorerUrl: getExplorerTransactionUrl(receipt?.hash ?? tx.hash),
      walletAddress: wallet.address ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      state: "error",
      error: mapWalletError(error),
    };
  }
}

export async function writeConsentRecord(payload: ConsentRecordPayload): Promise<BlockchainRecordResult> {
  const recordHash = hashRecord(payload);
  return writeHashedRecord(recordHash, payload.category ?? "CareEvent");
}

export async function writeHashedRecord(recordHash: string, category: string): Promise<BlockchainRecordResult> {
  try {
    const wallet = await getWalletState();
    if (!wallet.walletAvailable) {
      return { success: false, state: "error", recordHash, error: "No wallet provider is available." };
    }
    if (!wallet.connected) {
      return { success: false, state: "error", recordHash, error: "Connect your wallet before recording." };
    }
    if (!wallet.isCorrectNetwork) {
      return { success: false, state: "error", recordHash, error: "Switch your wallet to BOT Chain before continuing." };
    }

    const browserProvider = new ethers.BrowserProvider(getEthereumProvider()!);
    const signer = await browserProvider.getSigner();
    const contract = getContract(signer);
    const tx = await contract.addRecord(recordHash, category);
    const receipt = await tx.wait();

    return {
      success: true,
      state: "confirmed",
      recordHash,
      transactionHash: receipt?.hash ?? tx.hash,
      explorerUrl: getExplorerTransactionUrl(receipt?.hash ?? tx.hash),
      walletAddress: wallet.address ?? undefined,
    };
  } catch (error) {
    return {
      success: false,
      state: "error",
      recordHash,
      error: mapWalletError(error),
    };
  }
}

export { abbreviateAddress };
