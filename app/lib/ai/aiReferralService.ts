import type { AIResult } from "../AICoreEngine";
import { appendToArray, readJSON, STORAGE_KEYS, writeString } from "../storage/storageService";

export type HospitalReferral = {
  id: string;
  patient: string;
  priority: "High" | "Medium" | "Low";
  reason: string;
  status: string;
  createdAt: string;
};

export type DispatchEntry = {
  id: string;
  patient: string;
  priority: string;
  status: string;
  createdAt: string;
};

export function triggerEmergencyMode() {
  writeString(STORAGE_KEYS.EmergencyMode, "true");
}

export function createHospitalReferral(
  reason: string,
  patient = "Current Mother"
): HospitalReferral {
  const referral: HospitalReferral = {
    id: crypto.randomUUID(),
    patient,
    priority: "High",
    reason,
    status: "Pending",
    createdAt: new Date().toISOString(),
  };

  appendToArray(STORAGE_KEYS.hospitalReferrals, referral);
  return referral;
}

export function queueAmbulanceDispatch(
  patient = "Current Mother"
): DispatchEntry {
  const entry: DispatchEntry = {
    id: crypto.randomUUID(),
    patient,
    priority: "Emergency",
    status: "Waiting",
    createdAt: new Date().toISOString(),
  };

  appendToArray(STORAGE_KEYS.dispatchQueue, entry);
  return entry;
}

export function handleHighRiskReferrals(result: AIResult) {
  if (result.risk !== "HIGH") return null;

  triggerEmergencyMode();

  const reason = result.alerts.join(", ") || "High-risk condition detected";
  const referral = createHospitalReferral(reason);
  const dispatch = queueAmbulanceDispatch();

  return { referral, dispatch };
}

export function getHospitalReferrals(): HospitalReferral[] {
  return readJSON(STORAGE_KEYS.hospitalReferrals, []);
}

export function getDispatchQueue(): DispatchEntry[] {
  return readJSON(STORAGE_KEYS.dispatchQueue, []);
}
