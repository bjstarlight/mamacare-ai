import type { LucideIcon } from "lucide-react";

export interface HospitalMetrics {
  mothersRegistered: number;
  highRiskPregnancies: number;
  activeEmergencySos: number;
  incomingReferrals: number;
  doctorsOnline: number;
  blockchainVerifiedRecords: number;
}

export interface ChainStatus {
  network: string;
  blocksVerifiedToday: number;
  medicalRecordsProtected: number;
  averageVerificationTime: string;
}

export interface EmergencyCase {
  id: string;
  patientName: string;
  gestationalAge: string;
  summary: string;
  priority: "Critical" | "High" | "Medium";
  distanceKm: string;
  status: string;
}

export interface RiskPatient {
  id: string;
  name: string;
  riskLevel: "Critical" | "High" | "Medium";
  weeks: number;
  status: string;
}

export interface ReferralItem {
  id: string;
  mother: string;
  hospital: string;
  diagnosis: string;
  priority: "Routine" | "Urgent" | "Emergency";
  status: string;
}

export interface PatientRecord {
  id: string;
  name: string;
  phone: string;
  qrCode: string;
  weeks: number;
  condition: string;
  summary: string;
  status: string;
}

export interface DoctorActivityEntry {
  id: string;
  name: string;
  lastConsultation: string;
  patientsToday: number;
  verifiedRecords: number;
}

export interface CapacityItem {
  id: string;
  label: string;
  value: string;
  tone: "success" | "warning" | "neutral";
}

export interface KPIItem {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: "success" | "warning" | "critical" | "neutral";
}

export interface BlockchainEvent {
  id: string;
  time: string;
  description: string;
  status: string;
}
