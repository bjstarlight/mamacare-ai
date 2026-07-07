import type { AIResult } from "../AICoreEngine";
import { appendToArray, readJSON, STORAGE_KEYS, writeJSON } from "../storage/storageService";

export type DoctorAlert = {
  id: string;
  patient: string;
  risk: string;
  summary: string;
  createdAt: string;
  acknowledged?: boolean;
};

export type DashboardSnapshot = {
  healthScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  growthPrediction?: string;
  lastUpdated: string;
  activeAlerts: number;
  pendingReferrals: number;
  pendingTasks: number;
};

export function pushDoctorAlert(result: AIResult, patientName = "Current Mother") {
  if (result.risk === "LOW") return null;

  const alert: DoctorAlert = {
    id: crypto.randomUUID(),
    patient: patientName,
    risk: result.risk,
    summary: result.alerts.join(", ") || `Risk level: ${result.risk}`,
    createdAt: new Date().toISOString(),
  };

  appendToArray(STORAGE_KEYS.doctorAlerts, alert);
  return alert;
}

export function pushAIMessage(text: string) {
  appendToArray(STORAGE_KEYS.aiMessages, {
    id: crypto.randomUUID(),
    role: "assistant",
    text,
    createdAt: new Date().toISOString(),
  });
}

export function computeHealthScore(result: AIResult): number {
  const base = 100;
  const penalty =
    result.risk === "HIGH" ? 35 : result.risk === "MEDIUM" ? 18 : 5;
  return Math.max(40, base - penalty - result.alerts.length * 5);
}

export function predictGrowth(babyAgeMonths: number, babyWeight: number): string {
  if (babyAgeMonths <= 0 && babyWeight <= 0) {
    return "Add baby profile and weight to enable growth prediction.";
  }
  if (babyWeight > 0 && babyWeight < 2.5) {
    return "Below expected weight — monitor closely and schedule a clinic visit.";
  }
  if (babyAgeMonths >= 6) {
    return "On track for complementary feeding introduction.";
  }
  return "Growth trajectory appears within expected range for current age.";
}

export function updateDashboardSnapshot(
  result: AIResult,
  extras?: { babyAgeMonths?: number; babyWeight?: number; pendingTasks?: number }
): DashboardSnapshot {
  const referrals = readJSON<unknown[]>(STORAGE_KEYS.hospitalReferrals, []);
  const healthScore = computeHealthScore(result);

  const snapshot: DashboardSnapshot = {
    healthScore,
    riskLevel: result.risk,
    growthPrediction: predictGrowth(
      extras?.babyAgeMonths ?? 0,
      extras?.babyWeight ?? 0
    ),
    lastUpdated: new Date().toISOString(),
    activeAlerts: result.alerts.length,
    pendingReferrals: referrals.length,
    pendingTasks: extras?.pendingTasks ?? 0,
  };

  writeJSON(STORAGE_KEYS.dashboardSnapshot, snapshot);
  writeJSON(STORAGE_KEYS.healthScore, { score: healthScore, updatedAt: snapshot.lastUpdated });

  return snapshot;
}

export function getDashboardSnapshot(): DashboardSnapshot | null {
  return readJSON<DashboardSnapshot | null>(STORAGE_KEYS.dashboardSnapshot, null);
}

export function getDoctorAlerts(): DoctorAlert[] {
  return readJSON(STORAGE_KEYS.doctorAlerts, []);
}
