import { BaseAgent } from "./baseAgent";
import type { AgentContext, AgentResponse } from "./agentTypes";
import { syncMedicationSupplementAgent } from "../medications/medicationSupplementAgent";

export class MedicationAgent extends BaseAgent {
  role = "medication_agent" as const;

  run(context: AgentContext, message: string): AgentResponse {
    const medication = syncMedicationSupplementAgent();
    const hasSchedules = medication.registry.length > 0;
    const reply = hasSchedules
      ? `I’m checking your medication and supplement plan. Today's adherence is ${medication.adherencePercent}% with ${medication.missedDoses.length} missed doses and ${medication.upcomingDoses.length} upcoming doses.`
      : "No medication, supplement, or vitamin schedules are currently recorded.";

    const recommendations = hasSchedules
      ? [
        this.createRecommendation(
          "Medication adherence",
          medication.missedDoses.length > 0
            ? "Review missed doses and update them as taken or skipped to keep your care plan accurate."
            : "Continue following your medication schedule and confirm doses after taking them.",
          this.role,
          medication.missedDoses.length > 0 ? "high" : "medium",
          "mother"
        ),
        this.createRecommendation(
          "Supplement schedule review",
          "Keep vitamins and supplements in the same schedule to avoid missed preventive care.",
          this.role,
          "medium",
          "mother"
        ),
      ]
      : [
      this.createRecommendation(
        "Create medication schedule",
        "Register medications, supplements, or vitamins with dosage times to activate reminders and adherence tracking.",
        this.role,
        "medium",
        "mother"
      ),
    ];

    return {
      reply,
      recommendations,
      routedAgents: [this.role],
      riskLevel: context.riskLevel,
      followUpQuestion: hasSchedules
        ? "Would you like me to summarize missed doses and the next due time?"
        : "Would you like help setting up your first medication schedule?",
    };
  }
}
