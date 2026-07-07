import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";

export class VaccinationAgent extends BaseAgent {
  role = "vaccination_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const due = context.vaccinesDue.length;
    const reply = due > 0
      ? `You currently have ${due} vaccine(s) due. I can help you track them.`
      : "No vaccines are currently due based on the available context.";

    const recommendations = [
      this.createRecommendation(
        "Vaccination schedule",
        "Review due vaccines and prepare for the next visit.",
        this.role,
        due > 0 ? "high" : "medium",
        "baby"
      ),
    ];

    return {
      reply,
      recommendations,
      routedAgents: [this.role],
      riskLevel: context.riskLevel,
      followUpQuestion: "Would you like help reviewing your next vaccine?",
    };
  }
}
