import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";

export class BabyAgent extends BaseAgent {
  role = "baby_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const ageText = context.babyAgeText ?? `${context.babyAgeMonths ?? 0} month(s)`;
    const reply = `I’m using your baby’s age (${ageText}) to guide growth, feeding, and vaccination support. ${message ? "I’ll connect your latest question to the baby care plan." : "I can assist with growth tracking, feeding, and vaccine reminders."}`;

    const recommendations = [
      this.createRecommendation(
        "Growth review",
        "Review growth trends and feeding cues for your baby.",
        this.role,
        "medium",
        "baby"
      ),
      this.createRecommendation(
        "Vaccination reminder",
        "Check whether any vaccines are due this week.",
        this.role,
        "medium",
        "baby"
      ),
    ];

    return {
      reply,
      recommendations,
      routedAgents: [this.role],
      riskLevel: context.riskLevel,
      followUpQuestion: "Would you like help with growth, feeding, or vaccines?",
    };
  }
}
