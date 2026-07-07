import { hashRecord } from "../hash.ts";
import { queueMilestoneCandidate } from "./milestoneStore.ts";
import type { MilestoneType } from "./types.ts";

export type ConsentEventType =
  | "care_plan_created"
  | "ai_agent_action"
  | "appointment_confirmed"
  | "vaccination_completed"
  | "milestone_recorded";

export type ConsentEventInput = {
  eventType: ConsentEventType;
  category?: string;
  patientRef: string;
  actor: string;
  consentGranted: boolean;
  metadata?: Record<string, unknown>;
  onChain?: boolean;
};

export type ConsentEventResult = {
  recordHash: string;
  stored: boolean;
  eventType: ConsentEventType;
};

function buildPayload(input: ConsentEventInput) {
  return {
    eventType: input.eventType,
    category: input.category ?? "CareEvent",
    patientRef: input.patientRef,
    actor: input.actor,
    consentGranted: input.consentGranted,
    metadata: input.metadata ?? {},
    timestamp: new Date().toISOString(),
  };
}

function mapConsentEventType(eventType: ConsentEventType): MilestoneType | null {
  switch (eventType) {
    case "care_plan_created":
      return "ai_care_plan_approval";
    case "appointment_confirmed":
      return "appointment_confirmation";
    case "vaccination_completed":
      return "vaccination_completion";
    case "milestone_recorded":
      return "health_achievement";
    default:
      return null;
  }
}

function buildTitle(eventType: ConsentEventType) {
  switch (eventType) {
    case "appointment_confirmed":
      return "Appointment confirmation ready for BOT Chain";
    case "vaccination_completed":
      return "Vaccination completion ready for BOT Chain";
    case "milestone_recorded":
      return "Health achievement ready for BOT Chain";
    case "care_plan_created":
      return "AI care plan generated";
    case "ai_agent_action":
      return "AI care action generated";
    default:
      return "Healthcare milestone";
  }
}

export async function recordConsentEvent(input: ConsentEventInput): Promise<ConsentEventResult> {
  if (!input.consentGranted) {
    return {
      recordHash: "",
      stored: false,
      eventType: input.eventType,
    };
  }

  const payload = buildPayload(input);
  const recordHash = hashRecord(payload);
  const milestoneType = mapConsentEventType(input.eventType);

  if (milestoneType) {
    queueMilestoneCandidate({
      type: milestoneType,
      category: input.category,
      title: buildTitle(input.eventType),
      summary: Object.entries(payload.metadata ?? {})
        .filter(([, value]) => typeof value === "string" || typeof value === "number" || typeof value === "boolean")
        .slice(0, 4)
        .map(([key, value]) => `${key}: ${String(value)}`)
        .join(" | "),
      patientRef: input.patientRef,
      actor: input.actor,
      metadata: payload.metadata,
      consentGranted: true,
      sourceId: `${input.eventType}:${input.patientRef}:${JSON.stringify(payload.metadata ?? {})}`,
      occurredAt: payload.timestamp,
    });
  }

  return {
    recordHash,
    stored: Boolean(milestoneType),
    eventType: input.eventType,
  };
}
