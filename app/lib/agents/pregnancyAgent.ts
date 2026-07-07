import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";

export class PregnancyAgent extends BaseAgent {
  role = "pregnancy_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const week = context.pregnancyWeek ?? 0;
    const stage = week >= 28 ? "third trimester" : week >= 13 ? "second trimester" : "first trimester";

    const reply = `Your pregnancy context is in the ${stage}. ${message ? "I’m tailoring this guidance to your recent question and current stage." : "I can help with weekly milestones, fetal movement, and prenatal care."}`;

    const recommendations = [
      this.createRecommendation(
        "Weekly pregnancy guidance",
        `Review prenatal care guidance for week ${week || "unknown"}.`,
        this.role,
        "medium",
        "pregnancy"
      ),
      this.createRecommendation(
        "Antenatal follow-up",
        "Schedule or confirm your next antenatal visit if it is due.",
        this.role,
        "medium",
        "appointments"
      ),
    ];

    return {
      reply,
      recommendations,
      routedAgents: [this.role],
      riskLevel: context.riskLevel,
      followUpQuestion: "Would you like pregnancy-specific advice or a reminder of upcoming milestones?",
    };
  }
}
