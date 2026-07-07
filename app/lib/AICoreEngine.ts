import { readJSON, readString, STORAGE_KEYS } from "./storage/storageService";
import type { AppSection } from "../config/productFlow";

export interface AIContext {
  motherName?: string;
  babyName?: string;
  careType?: string;
  pregnancyWeek?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  temperature?: number;
  symptoms?: string[];
  dangerSigns?: string[];
  emergency?: boolean;
  babyAgeMonths?: number;
  babyWeight?: number;
  vaccinesDue?: number;
  appointmentsCount?: number;
  medicationsCount?: number;
  hasMotherProfile?: boolean;
  hasBabyProfile?: boolean;
  missedAppointments?: boolean;
}

export type AgentActionType =
  | "notification"
  | "doctor_alert"
  | "emergency_referral"
  | "ambulance_dispatch"
  | "dashboard_update"
  | "health_score"
  | "task"
  | "navigate"
  | "ai_message";

export type AgentAction = {
  type: AgentActionType;
  label: string;
  detail: string;
  targetSection?: AppSection;
  priority: "low" | "medium" | "high";
};

export type AgentTask = {
  id: string;
  title: string;
  section: AppSection;
  urgent: boolean;
};

export interface AIResult {
  risk: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
  recommendations: string[];
  alerts: string[];
  agentActions: AgentAction[];
  focusAreas: string[];
  summary: string;
  tasks: AgentTask[];
}

const DANGER_SYMPTOMS = [
  "bleeding",
  "convulsion",
  "convulsions",
  "seizure",
  "not breathing",
  "difficulty breathing",
  "unconscious",
  "heavy bleeding",
  "severe bleeding",
  "blue lips",
  "cannot wake",
  "reduced fetal movement",
  "severe headache",
  "vision changes",
];

function normalizeSymptoms(symptoms: string[] = []): string[] {
  return symptoms.map((s) => s.toLowerCase().trim()).filter(Boolean);
}

function hasSymptom(symptoms: string[], keywords: string[]) {
  return symptoms.some((s) => keywords.some((k) => s.includes(k)));
}

function addAction(
  actions: AgentAction[],
  action: AgentAction
) {
  actions.push(action);
}

function addTask(tasks: AgentTask[], task: AgentTask) {
  if (!tasks.some((t) => t.id === task.id)) tasks.push(task);
}

export function runAICore(context: AIContext): AIResult {
  let score = 0;
  const alerts: string[] = [];
  const recommendations: string[] = [];
  const agentActions: AgentAction[] = [];
  const focusAreas: string[] = [];
  const tasks: AgentTask[] = [];

  const symptoms = normalizeSymptoms(context.symptoms);
  const dangerSigns = normalizeSymptoms(context.dangerSigns ?? []);

  // ── Profile completeness ──────────────────────────────────────────
  if (!context.hasMotherProfile) {
    recommendations.push("Complete your mother profile for personalized care.");
    addTask(tasks, {
      id: "mother-profile",
      title: "Create mother profile",
      section: "mother",
      urgent: false,
    });
    addAction(agentActions, {
      type: "navigate",
      label: "Profile setup",
      detail: "Mother profile incomplete",
      targetSection: "mother",
      priority: "low",
    });
    focusAreas.push("onboarding");
  }

  if (!context.hasBabyProfile && context.careType !== "pregnancy") {
    recommendations.push("Add your baby profile to track growth and vaccines.");
    addTask(tasks, {
      id: "baby-profile",
      title: "Create baby profile",
      section: "baby",
      urgent: false,
    });
    focusAreas.push("baby");
  }

  // ── Blood pressure / preeclampsia ───────────────────────────────────
  if (context.bpSystolic && context.bpSystolic >= 140) {
    score += 35;
    alerts.push("High blood pressure detected — possible hypertension.");
    focusAreas.push("pregnancy");
    addAction(agentActions, {
      type: "doctor_alert",
      label: "BP alert",
      detail: `Systolic ${context.bpSystolic} mmHg`,
      targetSection: "doctor",
      priority: "high",
    });
  }

  if (context.bpDiastolic && context.bpDiastolic >= 90) {
    score += 25;
    if (!alerts.some((a) => a.includes("blood pressure"))) {
      alerts.push("Elevated diastolic blood pressure.");
    }
  }

  if (
    context.bpSystolic &&
    context.bpSystolic >= 140 &&
    hasSymptom(symptoms, ["headache", "swelling", "vision"])
  ) {
    score += 20;
    alerts.push("Possible preeclampsia — urgent review needed.");
    addAction(agentActions, {
      type: "emergency_referral",
      label: "Preeclampsia risk",
      detail: "High BP with neurological symptoms",
      targetSection: "emergency",
      priority: "high",
    });
  }

  // ── Emergency & danger signs ──────────────────────────────────────
  if (context.emergency) {
    score += 60;
    alerts.push("Emergency mode active.");
    focusAreas.push("emergency");
    addAction(agentActions, {
      type: "ambulance_dispatch",
      label: "Emergency dispatch",
      detail: "Emergency mode triggered",
      targetSection: "emergency",
      priority: "high",
    });
  }

  const allDanger = [...symptoms, ...dangerSigns];
  if (hasSymptom(allDanger, DANGER_SYMPTOMS)) {
    score += 50;
    alerts.push("Danger sign detected — seek urgent care.");
    focusAreas.push("emergency");
    addAction(agentActions, {
      type: "emergency_referral",
      label: "Danger sign referral",
      detail: allDanger.filter((s) =>
        DANGER_SYMPTOMS.some((d) => s.includes(d))
      ).join(", "),
      targetSection: "emergency",
      priority: "high",
    });
    addAction(agentActions, {
      type: "ai_message",
      label: "Emergency guidance",
      detail: "AI midwife issued urgent care message",
      targetSection: "ai",
      priority: "high",
    });
  }

  if (hasSymptom(symptoms, ["bleeding"])) {
    score += 40;
    if (!alerts.some((a) => a.includes("bleeding"))) {
      alerts.push("Bleeding reported — possible obstetric emergency.");
    }
  }

  // ── Fever & infection ─────────────────────────────────────────────
  if (context.temperature && context.temperature >= 38.5) {
    score += 20;
    alerts.push(`Fever detected (${context.temperature}°C).`);
    recommendations.push("Monitor temperature and ensure adequate fluids.");
    focusAreas.push("symptoms");
    addAction(agentActions, {
      type: "notification",
      label: "Fever alert",
      detail: `Temperature ${context.temperature}°C`,
      targetSection: "ai",
      priority: "medium",
    });
  }

  if (hasSymptom(symptoms, ["fever", "convulsion", "difficulty breathing"])) {
    score += 15;
    focusAreas.push("symptoms");
    addTask(tasks, {
      id: "symptom-review",
      title: "Review symptom assessment",
      section: "ai",
      urgent: hasSymptom(symptoms, ["convulsion", "difficulty breathing"]),
    });
  }

  // ── Pregnancy milestones ────────────────────────────────────────────
  if (context.pregnancyWeek && context.pregnancyWeek > 0) {
    focusAreas.push("pregnancy");

    if (context.pregnancyWeek >= 28 && context.pregnancyWeek <= 32) {
      recommendations.push("Third trimester — monitor fetal movement daily.");
    }
    if (context.pregnancyWeek > 36) {
      recommendations.push("Prepare your delivery plan and hospital bag.");
      addTask(tasks, {
        id: "delivery-prep",
        title: "Prepare delivery plan",
        section: "pregnancy",
        urgent: false,
      });
    }
    if (context.pregnancyWeek >= 20 && !context.appointmentsCount) {
      recommendations.push("Schedule your next antenatal appointment.");
      addTask(tasks, {
        id: "anc-appointment",
        title: "Book antenatal visit",
        section: "appointments",
        urgent: false,
      });
    }
  }

  // ── Baby care ───────────────────────────────────────────────────────
  if (context.babyWeight && context.babyWeight > 0 && context.babyWeight < 2.5) {
    score += 15;
    recommendations.push("Baby weight below 2.5 kg — monitor growth closely.");
    focusAreas.push("baby");
    addAction(agentActions, {
      type: "doctor_alert",
      label: "Low birth weight",
      detail: `Weight ${context.babyWeight} kg`,
      targetSection: "baby",
      priority: "medium",
    });
  }

  if (context.vaccinesDue && context.vaccinesDue > 0) {
    recommendations.push(`${context.vaccinesDue} vaccine(s) due — schedule soon.`);
    focusAreas.push("vaccines");
    addTask(tasks, {
      id: "vaccines-due",
      title: "Complete due vaccinations",
      section: "baby",
      urgent: false,
    });
    addAction(agentActions, {
      type: "notification",
      label: "Vaccine reminder",
      detail: `${context.vaccinesDue} vaccine(s) due`,
      targetSection: "baby",
      priority: "medium",
    });
  }

  if (context.babyAgeMonths && context.babyAgeMonths >= 6) {
    recommendations.push("Introduce complementary feeding alongside breastfeeding.");
    focusAreas.push("feeding");
  }

  // ── Medication & appointments ───────────────────────────────────────
  if (context.medicationsCount && context.medicationsCount > 0) {
    focusAreas.push("medication");
    addTask(tasks, {
      id: "medication-today",
      title: "Take prescribed medication",
      section: "baby",
      urgent: false,
    });
  }

  if (context.missedAppointments) {
    score += 10;
    recommendations.push("You have a missed appointment — reschedule soon.");
    addAction(agentActions, {
      type: "notification",
      label: "Missed appointment",
      detail: "Reschedule clinic visit",
      targetSection: "appointments",
      priority: "medium",
    });
  }

  // ── Risk classification ─────────────────────────────────────────────
  let risk: "LOW" | "MEDIUM" | "HIGH";
  if (score >= 70) risk = "HIGH";
  else if (score >= 35) risk = "MEDIUM";
  else risk = "LOW";

  // Always plan dashboard + health score updates
  addAction(agentActions, {
    type: "dashboard_update",
    label: "Dashboard refresh",
    detail: "Update care snapshot and metrics",
    targetSection: "dashboard",
    priority: "low",
  });
  addAction(agentActions, {
    type: "health_score",
    label: "Health score",
    detail: `Compute score for ${risk} risk`,
    targetSection: "dashboard",
    priority: "low",
  });

  if (risk !== "LOW") {
    addAction(agentActions, {
      type: "doctor_alert",
      label: "Clinical alert",
      detail: `Risk level: ${risk}`,
      targetSection: "doctor",
      priority: risk === "HIGH" ? "high" : "medium",
    });
  }

  if (recommendations.length > 0) {
    addAction(agentActions, {
      type: "notification",
      label: "Care recommendations",
      detail: `${recommendations.length} recommendation(s)`,
      targetSection: "ai",
      priority: "low",
    });
  }

  const summary =
    risk === "HIGH"
      ? `High-risk care state detected. ${alerts[0] ?? "Immediate review recommended."}`
      : risk === "MEDIUM"
        ? `Moderate risk. ${recommendations[0] ?? "Continue monitoring and complete care tasks."}`
        : `Stable care state. ${recommendations[0] ?? "Keep up with appointments and daily care."}`;

  return {
    risk,
    confidence: Math.min(99, 70 + Math.floor(score / 3)),
    alerts,
    recommendations,
    agentActions,
    focusAreas: [...new Set(focusAreas)],
    summary,
    tasks,
  };
}

/** Build full context from centralized storage */
export function buildAIContext(): AIContext {
  const mother = readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {});
  const baby = readJSON<{ name?: string }>(STORAGE_KEYS.babyProfile, {});
  const latestBP = readJSON<{ systolic?: number; diastolic?: number }>(
    STORAGE_KEYS.latestBP,
    {}
  );
  const symptoms = readJSON<string[]>(STORAGE_KEYS.currentSymptoms, []);
  const dangerSigns = readJSON<string[]>(STORAGE_KEYS.emergency, []);
  const pregnancyWeek = Number(readString(STORAGE_KEYS.pregnancyWeek, "0"));
  const babyWeight = Number(readString(STORAGE_KEYS.babyWeight, "0"));
  const babyAgeMonths = Number(readString(STORAGE_KEYS.babyAgeMonths, "0"));
  const vaccinesDue = readJSON<unknown[]>(STORAGE_KEYS.vaccinesDue, []).length;
  const appointments = readJSON<{ date: string }[]>(STORAGE_KEYS.appointments, []);
  const medications = readJSON<unknown[]>(STORAGE_KEYS.medications, []);
  const emergency =
    readString(STORAGE_KEYS.EmergencyMode) === "true" ||
    readString(STORAGE_KEYS.EmergencySOS) === "true";

  const vitals = readJSON<{ temperature?: number }>(STORAGE_KEYS.vitalSigns, {});

  const now = Date.now();
  const missedAppointments = appointments.some((a) => {
    const d = new Date(a.date).getTime();
    return !Number.isNaN(d) && d < now;
  });

  return {
    motherName: mother.name,
    babyName: baby.name,
    careType: readString(STORAGE_KEYS.careType),
    pregnancyWeek: pregnancyWeek || undefined,
    bpSystolic: latestBP.systolic,
    bpDiastolic: latestBP.diastolic,
    temperature: vitals.temperature,
    symptoms,
    dangerSigns,
    emergency,
    babyAgeMonths: babyAgeMonths || undefined,
    babyWeight: babyWeight || undefined,
    vaccinesDue,
    appointmentsCount: appointments.length,
    medicationsCount: medications.length,
    hasMotherProfile: Boolean(mother.name),
    hasBabyProfile: Boolean(baby.name),
    missedAppointments,
  };
}
