import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";

export class EmergencyAgent extends BaseAgent {
  role = "emergency_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const reply = context.emergency
      ? "Emergency guidance is active. Please prioritize immediate safety and contact emergency support if symptoms worsen."
      : "I’m monitoring for urgent symptoms. If you notice danger signs, I can guide you to urgent escalation.";

    const recommendations = [
      this.createRecommendation(
        "Emergency pathway",
        "Open the emergency workflow and contact support if urgent symptoms appear.",
        this.role,
        "high",
        "emergency"
      ),
    ];

    return {
      reply,
      recommendations,
      routedAgents: [this.role],
      riskLevel: context.riskLevel,
      followUpQuestion: "Would you like the emergency workflow opened now?",
    };
  }
}
