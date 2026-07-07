import { hashRecord } from "../hash";
import { readJSON, readString, STORAGE_KEYS, subscribeStorage, writeJSON, writeString } from "../storage/storageService";
import type { BlockchainMilestone, BlockchainRecordResult, MilestoneCandidateInput, MilestoneStats, MilestoneType } from "./types";

export const MILESTONE_STORAGE_KEY = STORAGE_KEYS.botChainMilestones;

type LegacyBlockchainRecord = {
  id?: string;
  hash: string;
  type: string;
  patient: string;
  timestamp: string;
  status: string;
  actor?: string;
  details?: string;
  transactionHash?: string;
  source?: string;
};

function formatMilestoneLabel(type: MilestoneType) {
  switch (type) {
    case "appointment_confirmation":
      return "Appointment confirmation";
    case "vaccination_completion":
      return "Vaccination completion";
    case "ai_care_plan_approval":
      return "AI care plan approval";
    case "health_achievement":
      return "Health achievement";
    default:
      return "Healthcare milestone";
  }
}

function buildSourceKey(input: MilestoneCandidateInput) {
  return input.sourceId
    ?? `${input.type}:${input.patientRef}:${input.title}:${input.occurredAt ?? input.createdAt ?? ""}`;
}

function createMilestoneId(input: MilestoneCandidateInput) {
  return `milestone_${hashRecord({
    sourceId: buildSourceKey(input),
    createdAt: input.createdAt ?? new Date().toISOString(),
  }).slice(0, 24)}`;
}

function summarizeMetadata(metadata?: Record<string, unknown>) {
  if (!metadata) return "";

  return Object.entries(metadata)
    .filter(([, value]) => typeof value === "string" || typeof value === "number" || typeof value === "boolean")
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" | ");
}

function buildLegacyRecord(milestone: BlockchainMilestone): LegacyBlockchainRecord {
  return {
    id: milestone.id,
    hash: milestone.recordHash ?? "",
    type: milestone.title || formatMilestoneLabel(milestone.type),
    patient: milestone.patientRef,
    timestamp: new Date(milestone.updatedAt || milestone.createdAt).toLocaleString(),
    status: milestone.status === "confirmed" ? "Verified" : milestone.status === "failed" ? "Failed" : "Pending",
    actor: milestone.actor,
    details: milestone.summary || summarizeMetadata(milestone.metadata),
    transactionHash: milestone.transactionHash,
    source: "milestone",
  };
}

export function readMilestones(): BlockchainMilestone[] {
  return readJSON<BlockchainMilestone[]>(MILESTONE_STORAGE_KEY, []);
}

export function writeMilestones(milestones: BlockchainMilestone[]) {
  writeJSON(MILESTONE_STORAGE_KEY, milestones);
  syncLegacyBlockchainProjection(milestones);
}

export function syncLegacyBlockchainProjection(milestones = readMilestones()) {
  const existing = readJSON<LegacyBlockchainRecord[]>(STORAGE_KEYS.blockchainRecords, []);
  const sorted = [...milestones].sort(
    (left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime()
  );

  const milestoneRecords = sorted
    .filter((milestone) => milestone.status === "confirmed" && milestone.recordHash)
    .map(buildLegacyRecord);
  const nonMilestoneRecords = existing.filter((record) => record.source !== "milestone");
  const legacyRecords = [...milestoneRecords, ...nonMilestoneRecords];

  const latestConfirmed = sorted.find((milestone) => milestone.status === "confirmed");

  writeJSON(STORAGE_KEYS.blockchainRecords, legacyRecords);
  writeString(STORAGE_KEYS.protectedRecords, String(legacyRecords.length));
  writeString(
    STORAGE_KEYS.lastVerified,
    latestConfirmed ? new Date(latestConfirmed.updatedAt || latestConfirmed.createdAt).toLocaleString() : "Never"
  );
  writeString(STORAGE_KEYS.latestTransaction, latestConfirmed?.transactionHash ?? "");
}

export function queueMilestoneCandidate(input: MilestoneCandidateInput): BlockchainMilestone {
  const milestones = readMilestones();
  const sourceKey = buildSourceKey(input);
  const existing = milestones.find((milestone) => milestone.sourceId === sourceKey);

  if (existing) {
    return existing;
  }

  const now = input.createdAt ?? new Date().toISOString();
  const milestone: BlockchainMilestone = {
    id: createMilestoneId(input),
    sourceId: sourceKey,
    type: input.type,
    category: input.category ?? "CareEvent",
    title: input.title || formatMilestoneLabel(input.type),
    summary: input.summary ?? summarizeMetadata(input.metadata),
    patientRef: input.patientRef,
    actor: input.actor,
    metadata: input.metadata,
    status: "pending",
    consentGranted: input.consentGranted,
    createdAt: now,
    occurredAt: input.occurredAt ?? now,
    updatedAt: now,
  };

  writeMilestones([milestone, ...milestones]);
  return milestone;
}

export function getMilestoneById(id: string) {
  return readMilestones().find((milestone) => milestone.id === id) ?? null;
}

export function updateMilestone(id: string, updates: Partial<BlockchainMilestone>) {
  const milestones = readMilestones();
  const next = milestones.map((milestone) =>
    milestone.id === id
      ? {
          ...milestone,
          ...updates,
          updatedAt: updates.updatedAt ?? new Date().toISOString(),
        }
      : milestone
  );
  writeMilestones(next);
  return next.find((milestone) => milestone.id === id) ?? null;
}

export function applyMilestoneResult(id: string, result: BlockchainRecordResult) {
  return updateMilestone(id, {
    status: result.success ? "confirmed" : "failed",
    recordHash: result.recordHash,
    transactionHash: result.transactionHash,
    explorerUrl: result.explorerUrl,
    walletAddress: result.walletAddress,
    error: result.error,
  });
}

export function markMilestonePending(id: string) {
  return updateMilestone(id, {
    status: "submitting",
    error: undefined,
  });
}

export function readPendingMilestones() {
  return readMilestones().filter((milestone) => milestone.status === "pending" || milestone.status === "failed");
}

export function getMilestoneStats(milestones = readMilestones()): MilestoneStats {
  const confirmed = milestones.filter((milestone) => milestone.status === "confirmed");
  const latestConfirmed = confirmed[0]
    ?? [...confirmed].sort(
      (left, right) => new Date(right.updatedAt || right.createdAt).getTime() - new Date(left.updatedAt || left.createdAt).getTime()
    )[0];

  return {
    total: milestones.length,
    pending: milestones.filter((milestone) => milestone.status === "pending" || milestone.status === "failed").length,
    confirmed: confirmed.length,
    lastVerified: latestConfirmed ? new Date(latestConfirmed.updatedAt || latestConfirmed.createdAt).toLocaleString() : "Never",
    latestTransactionHash: latestConfirmed?.transactionHash ?? readString(STORAGE_KEYS.latestTransaction),
  };
}

export function subscribeMilestones(listener: (milestones: BlockchainMilestone[]) => void) {
  listener(readMilestones());

  return subscribeStorage((key) => {
    if (key === STORAGE_KEYS.blockchainRecords || key === STORAGE_KEYS.protectedRecords || key === MILESTONE_STORAGE_KEY) {
      listener(readMilestones());
    }
  });
}
