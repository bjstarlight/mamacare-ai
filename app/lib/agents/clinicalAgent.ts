import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";

export class ClinicalAgent extends BaseAgent {
  role = "clinical_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const lowRisk = context.riskLevel === "LOW";
    const reply = lowRisk
      ? `I’m reviewing your current clinical picture. ${message ? "I’ll focus on your recent concerns and any symptoms you shared." : "I can help monitor symptoms, vitals, and care follow-up."}`
      : `I’m flagging a ${context.riskLevel.toLowerCase()} clinical status and prioritizing safety-based guidance.`;

    const recommendations = [
      this.createRecommendation(
        "Clinical summary",
        "Review your current health indicators and any new symptoms.",
        this.role,
        "medium",
        "ai"
      ),
      this.createRecommendation(
        "Urgent escalation",
        "Escalate to a clinician or emergency pathway if symptoms worsen.",
        this.role,
        context.riskLevel === "HIGH" ? "high" : "medium",
        context.riskLevel === "HIGH" ? "emergency" : "doctor"
      ),
    ];

    return {
      reply,
      recommendations,
      routedAgents: [this.role],
      riskLevel: context.riskLevel,
      followUpQuestion: "Would you like a concise clinical summary or a care escalation plan?",
    };
  }
}
