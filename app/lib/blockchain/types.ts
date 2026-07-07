export type BlockchainTxState = "idle" | "connecting" | "signing" | "pending" | "confirmed" | "error";

export type MilestoneType =
  | "appointment_confirmation"
  | "vaccination_completion"
  | "ai_care_plan_approval"
  | "health_achievement";

export type MilestoneStatus = "pending" | "submitting" | "confirmed" | "failed";

export type ConsentRecordPayload = {
  eventType: string;
  category?: string;
  patientRef: string;
  actor: string;
  consentGranted: boolean;
  metadata?: Record<string, unknown>;
};

export type BlockchainRecordResult = {
  success: boolean;
  recordHash?: string;
  transactionHash?: string;
  error?: string;
  state: BlockchainTxState;
  explorerUrl?: string;
  walletAddress?: string;
};

export type BlockchainMilestone = {
  id: string;
  sourceId: string;
  type: MilestoneType;
  category: string;
  title: string;
  summary: string;
  patientRef: string;
  actor: string;
  metadata?: Record<string, unknown>;
  status: MilestoneStatus;
  consentGranted: boolean;
  createdAt: string;
  occurredAt: string;
  updatedAt: string;
  recordHash?: string;
  transactionHash?: string;
  explorerUrl?: string;
  walletAddress?: string;
  error?: string;
};

export type MilestoneCandidateInput = {
  type: MilestoneType;
  category?: string;
  title?: string;
  summary?: string;
  patientRef: string;
  actor: string;
  metadata?: Record<string, unknown>;
  consentGranted: boolean;
  sourceId?: string;
  createdAt?: string;
  occurredAt?: string;
};

export type MilestoneAttestationPayload = {
  milestoneId: string;
  type: MilestoneType;
  category: string;
  actor: string;
  consentGranted: boolean;
  occurredAt: string;
  subjectFingerprint: string;
  summaryFingerprint: string;
};

export type WalletState = {
  walletAvailable: boolean;
  connected: boolean;
  address: string | null;
  chainId: number | null;
  chainIdHex: string | null;
  networkName: string;
  isCorrectNetwork: boolean;
};

export type ChainStatus = {
  connected: boolean;
  chainId: number;
  networkName: string;
  rpcUrl?: string;
  error?: string;
  contractConfigured: boolean;
};

export type MilestoneStats = {
  total: number;
  pending: number;
  confirmed: number;
  lastVerified: string;
  latestTransactionHash: string;
};
