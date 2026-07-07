import type { AppSection } from "../../config/productFlow";

export type AgentRole =
  | "care_coordinator"
  | "clinical_agent"
  | "pregnancy_agent"
  | "baby_agent"
  | "appointment_agent"
  | "medication_agent"
  | "vaccination_agent"
  | "emergency_agent";

export type AgentMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  agent?: AgentRole;
  createdAt: string;
};

export type AgentContext = {
  motherName?: string;
  babyName?: string;
  pregnancyWeek?: number;
  babyAgeMonths?: number;
  babyAgeText?: string;
  appointments: Array<{ title?: string; date?: string; type?: string }>;
  medications: Array<{ name?: string; schedule?: string }>;
  vaccinesDue: Array<{ name?: string; age?: string }>;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  activeSection?: AppSection;
  previousMessages: AgentMessage[];
  emergency?: boolean;
  careType?: string;
};

export type AgentRecommendation = {
  id: string;
  title: string;
  description: string;
  agent: AgentRole;
  section?: AppSection;
  priority: "low" | "medium" | "high";
};

export type AgentResponse = {
  reply: string;
  recommendations: AgentRecommendation[];
  routedAgents: AgentRole[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  followUpQuestion?: string;
};
