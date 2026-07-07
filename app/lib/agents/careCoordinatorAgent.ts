import { STORAGE_KEYS, readJSON, readString, writeJSON } from "../storage/storageService";
import type { AgentContext, AgentMessage, AgentRecommendation, AgentResponse, AgentRole } from "./agentTypes";
import { ClinicalAgent } from "./clinicalAgent";
import { PregnancyAgent } from "./pregnancyAgent";
import { BabyAgent } from "./babyAgent";
import { AppointmentAgent } from "./appointmentAgent";
import { MedicationAgent } from "./medicationAgent";
import { VaccinationAgent } from "./vaccinationAgent";
import { EmergencyAgent } from "./emergencyAgent";
import { recordConsentEvent } from "../blockchain/consentChain";

export type CareCoordinatorState = {
  userContext: AgentContext;
  history: AgentMessage[];
};

export class CareCoordinatorAgent {
  private readonly agents = [
    new ClinicalAgent(),
    new PregnancyAgent(),
    new BabyAgent(),
    new AppointmentAgent(),
    new MedicationAgent(),
    new VaccinationAgent(),
    new EmergencyAgent(),
  ];

  private buildContext(): AgentContext {
    const mother = readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {});
    const baby = readJSON<{ name?: string }>(STORAGE_KEYS.babyProfile, {});
    const appointments = readJSON<Array<{ title?: string; date?: string; type?: string }>>(
      STORAGE_KEYS.appointments,
      []
    );
    const medications = readJSON<Array<{ name?: string; schedule?: string }>>(
      STORAGE_KEYS.medications,
      []
    );
    const vaccinesDue = readJSON<Array<{ name?: string; age?: string }>>(
      STORAGE_KEYS.vaccinesDue,
      []
    );
    const previousMessages = readJSON<AgentMessage[]>(STORAGE_KEYS.aiMessages, []);
    const riskLevel = readString(STORAGE_KEYS.healthScore, "")
      ? (JSON.parse(readString(STORAGE_KEYS.healthScore, "{}"))?.risk ?? "LOW")
      : "LOW";

    return {
      motherName: mother.name,
      babyName: baby.name,
      pregnancyWeek: Number(readString(STORAGE_KEYS.pregnancyWeek, "0")) || undefined,
      babyAgeMonths: Number(readString(STORAGE_KEYS.babyAgeMonths, "0")) || undefined,
      babyAgeText: readString(STORAGE_KEYS.babyAgeText, ""),
      appointments,
      medications,
      vaccinesDue,
      riskLevel: riskLevel === "HIGH" || riskLevel === "MEDIUM" ? riskLevel : "LOW",
      activeSection: "ai",
      previousMessages: previousMessages.map((message) => ({
        ...message,
        role: message.role === "assistant" ? "assistant" : "user",
      })),
      emergency: readString(STORAGE_KEYS.EmergencyMode) === "true" || readString(STORAGE_KEYS.EmergencySOS) === "true",
      careType: readString(STORAGE_KEYS.careType, "both"),
    };
  }

  private persistHistory(history: AgentMessage[]) {
    writeJSON(STORAGE_KEYS.aiMessages, history);
  }

  public run(message: string): { response: AgentResponse; state: CareCoordinatorState } {
    const context = this.buildContext();
    const history: AgentMessage[] = [
      ...context.previousMessages,
      {
        id: crypto.randomUUID(),
        role: "user",
        text: message,
        createdAt: new Date().toISOString(),
      },
    ];

    const selectedAgents: AgentRole[] = [];
    const recommendations: AgentRecommendation[] = [];

    if (context.emergency) {
      selectedAgents.push("emergency_agent");
    }
    if (context.pregnancyWeek && context.pregnancyWeek > 0) {
      selectedAgents.push("pregnancy_agent");
    }
    if (context.babyAgeMonths || context.babyName) {
      selectedAgents.push("baby_agent");
    }
    if (context.appointments.length > 0) {
      selectedAgents.push("appointment_agent");
    }
    if (context.medications.length > 0) {
      selectedAgents.push("medication_agent");
    }
    if (context.vaccinesDue.length > 0) {
      selectedAgents.push("vaccination_agent");
    }
    selectedAgents.push("clinical_agent");

    const routedAgents = Array.from(new Set(selectedAgents));
    const agentResults = routedAgents.map((role) => {
      const agent = this.agents.find((candidate) => candidate.role === role);
      return agent?.run(context, message);
    }).filter(Boolean) as AgentResponse[];

    const mergedRecommendations = agentResults.flatMap((result) => result.recommendations);
    const mergedReply = [
      ...agentResults.map((result) => result.reply),
      context.motherName ? `I’m keeping your care context centered on ${context.motherName}.` : "I’m keeping your care context centered on your current profile.",
    ].join("\n\n");

    void recordConsentEvent({
      eventType: "ai_agent_action",
      category: "CareEvent",
      patientRef: context.babyName ? `baby:${context.babyName}` : `mother:${context.motherName ?? "unknown"}`,
      actor: "care-coordinator",
      consentGranted: true,
      metadata: { message, routedAgents, recommendations: mergedRecommendations.slice(0, 3).map((item) => item.title) },
    });

    const response: AgentResponse = {
      reply: mergedReply,
      recommendations: mergedRecommendations.slice(0, 6),
      routedAgents,
      riskLevel: context.riskLevel,
      followUpQuestion: agentResults[0]?.followUpQuestion ?? "How can I help with your care today?",
    };

    const nextHistory: AgentMessage[] = [
      ...history,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: response.reply,
        agent: "care_coordinator",
        createdAt: new Date().toISOString(),
      },
    ];

    this.persistHistory(nextHistory);

    return {
      response,
      state: {
        userContext: context,
        history: nextHistory,
      },
    };
  }
}
