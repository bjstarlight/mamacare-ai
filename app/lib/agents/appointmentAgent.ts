import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";

export class AppointmentAgent extends BaseAgent {
  role = "appointment_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const reply = `I’m reviewing your current care calendar. ${context.appointments.length > 0 ? "You have scheduled appointments to prepare for." : "No upcoming appointments are currently recorded."}`;

    const recommendations = [
      this.createRecommendation(
        "Appointment planning",
        "Prepare for upcoming visits and confirm any required documents.",
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
      followUpQuestion: "Would you like me to help organize your next appointment?",
    };
  }
}
