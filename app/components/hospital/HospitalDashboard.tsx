"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Activity, ShieldCheck, Stethoscope, TrendingUp, Users } from "lucide-react";
import { logBlockchainRecord } from "../../lib/blockchainLogger";
import { hashRecord } from "../../lib/hash";
import DashboardHeader from "./DashboardHeader.tsx";
import KPICards from "./KPICards.tsx";
import EmergencyPanel from "./EmergencyPanel.tsx";
import RiskQueue from "./RiskQueue.tsx";
import ReferralCenter from "./ReferralCenter.tsx";
import PatientMonitor from "./PatientMonitor.tsx";
import DoctorActivity from "./DoctorActivity.tsx";
import HospitalStatistics from "./HospitalStatistics.tsx";
import BlockchainActivity from "./BlockchainActivity.tsx";
import HospitalCapacity from "./HospitalCapacity.tsx";
import AIHospitalInsights from "./AIHospitalInsights.tsx";
import type {
  BlockchainEvent,
  CapacityItem,
  ChainStatus,
  DoctorActivityEntry,
  EmergencyCase,
  HospitalMetrics,
  PatientRecord,
  ReferralItem,
  RiskPatient,
} from "./types";

const defaultMetrics: HospitalMetrics = {
  mothersRegistered: 1284,
  highRiskPregnancies: 83,
  activeEmergencySos: 3,
  incomingReferrals: 12,
  doctorsOnline: 18,
  blockchainVerifiedRecords: 2436,
};

const defaultChainStatus: ChainStatus = {
  network: "Connected",
  blocksVerifiedToday: 186,
  medicalRecordsProtected: 2436,
  averageVerificationTime: "0.8s",
};

const defaultEmergencies: EmergencyCase[] = [
  {
    id: "emg-1",
    patientName: "Mary Johnson",
    gestationalAge: "36 weeks",
    summary: "Severe bleeding and hypertension",
    priority: "Critical",
    distanceKm: "8 km",
    status: "Ambulance dispatched",
  },
];

const defaultRiskPatients: RiskPatient[] = [
  { id: "risk-1", name: "Grace", riskLevel: "Critical", weeks: 37, status: "Immediate" },
  { id: "risk-2", name: "Ruth", riskLevel: "High", weeks: 34, status: "Review" },
  { id: "risk-3", name: "Nadia", riskLevel: "Medium", weeks: 29, status: "Observe" },
];

const defaultReferrals: ReferralItem[] = [
  {
    id: "ref-1",
    mother: "Amina Yusuf",
    hospital: "North Valley Clinic",
    diagnosis: "Preeclampsia",
    priority: "Urgent",
    status: "Pending",
  },
  {
    id: "ref-2",
    mother: "Lina Okafor",
    hospital: "Maternity Wing B",
    diagnosis: "Gestational diabetes",
    priority: "Routine",
    status: "Pending",
  },
];

const defaultPatients: PatientRecord[] = [
  {
    id: "MC-7A1F2D",
    name: "Amina Yusuf",
    phone: "+234 801 123 4567",
    qrCode: "QR-1042",
    weeks: 34,
    condition: "High-risk gestational hypertension",
    summary: "Needs frequent BP checks and specialist review.",
    status: "Stable",
  },
  {
    id: "MC-3B2C9A",
    name: "Lina Okafor",
    phone: "+234 702 654 3201",
    qrCode: "QR-1043",
    weeks: 28,
    condition: "Gestational diabetes",
    summary: "Nutrition plan and glucose monitoring in place.",
    status: "Monitoring",
  },
  {
    id: "MC-8D4E7F",
    name: "Diana Mensah",
    phone: "+234 903 112 9988",
    qrCode: "QR-1044",
    weeks: 38,
    condition: "Postpartum recovery",
    summary: "Discharge planning and home care follow-up scheduled.",
    status: "Recovery",
  },
];

const defaultDoctors: DoctorActivityEntry[] = [
  { id: "doc-1", name: "Dr. James Adebayo", lastConsultation: "5 mins ago", patientsToday: 18, verifiedRecords: 18 },
  { id: "doc-2", name: "Dr. Nneka Okafor", lastConsultation: "12 mins ago", patientsToday: 11, verifiedRecords: 24 },
];

const defaultCapacity: CapacityItem[] = [
  { id: "lab", label: "Lab", value: "Online", tone: "success" },
  { id: "beds", label: "Maternity Beds", value: "18 / 30", tone: "warning" },
  { id: "nicu", label: "NICU", value: "5 / 8", tone: "warning" },
  { id: "blood", label: "Blood Bank", value: "Available", tone: "success" },
  { id: "theatre", label: "Operating Theatre", value: "Available", tone: "success" },
];

const defaultBlockchainEvents: BlockchainEvent[] = [
  { id: "bc-1", time: "09:42", description: "Clinical summary verified", status: "Verified" },
  { id: "bc-2", time: "09:50", description: "Referral verified", status: "Verified" },
  { id: "bc-3", time: "10:01", description: "Prescription verified", status: "Verified" },
  { id: "bc-4", time: "10:10", description: "Emergency event recorded", status: "Recorded" },
];

function readMetricsFromStorage(): HospitalMetrics | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("hospitalDashboardMetrics");
    return raw ? (JSON.parse(raw) as HospitalMetrics) : null;
  } catch {
    return null;
  }
}

export default function HospitalDashboard() {
  const [metrics, setMetrics] = useState<HospitalMetrics>(defaultMetrics);
  const [chainStatus, setChainStatus] = useState<ChainStatus>(defaultChainStatus);
  const [emergencies, setEmergencies] = useState<EmergencyCase[]>(defaultEmergencies);
  const [riskPatients, setRiskPatients] = useState<RiskPatient[]>(defaultRiskPatients);
  const [referrals, setReferrals] = useState<ReferralItem[]>(defaultReferrals);
  const [patients] = useState<PatientRecord[]>(defaultPatients);
  const [doctors] = useState<DoctorActivityEntry[]>(defaultDoctors);
  const [capacity] = useState<CapacityItem[]>(defaultCapacity);
  const [blockchainEvents] = useState<BlockchainEvent[]>(defaultBlockchainEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord>(defaultPatients[0]);

  useEffect(() => {
    const storedMetrics = readMetricsFromStorage();
    if (storedMetrics) {
      setMetrics(storedMetrics);
    }

    const storedEmergencyFlag = window.localStorage.getItem("hospitalEmergencyFlag");
    if (storedEmergencyFlag === "true") {
      setEmergencies(defaultEmergencies);
    }

    const storedChainStatus = window.localStorage.getItem("hospitalChainStatus");
    if (storedChainStatus) {
      try {
        setChainStatus(JSON.parse(storedChainStatus) as ChainStatus);
      } catch {
        setChainStatus(defaultChainStatus);
      }
    }
  }, []);

  const filteredPatients = useMemo(() => {
    const query = searchTerm.toLowerCase();
    if (!query.trim()) {
      return patients;
    }

    return patients.filter((patient) =>
      [patient.name, patient.id, patient.phone, patient.qrCode]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [patients, searchTerm]);

  useEffect(() => {
    if (!filteredPatients.some((patient) => patient.id === selectedPatient.id)) {
      setSelectedPatient(filteredPatients[0] ?? defaultPatients[0]);
    }
  }, [filteredPatients, selectedPatient.id]);

  const handleReferralAction = (id: string, action: "accept" | "reject") => {
    const target = referrals.find((referral) => referral.id === id);
    if (!target) return;

    const nextStatus = action === "accept" ? "Accepted" : "Rejected";

    setReferrals((current) =>
      current.map((referral) =>
        referral.id === id
          ? {
              ...referral,
              status: nextStatus,
            }
          : referral
      )
    );

    logBlockchainRecord({
      hash: hashRecord({
        type: "Hospital Referral Action",
        referralId: target.id,
        action,
        mother: target.mother,
        diagnosis: target.diagnosis,
        timestamp: new Date().toISOString(),
      }),
      type: "Hospital Referral Action",
      patient: target.mother,
      actor: "Hospital",
      details: `${action === "accept" ? "Accepted" : "Rejected"} referral for ${target.diagnosis}`,
    });
  };

  const urgentReviewCount = riskPatients.filter((patient) => patient.riskLevel === "Critical" || patient.riskLevel === "High").length;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardHeader hospitalName="Central Maternal Hospital" chainStatus={chainStatus} />
        <KPICards metrics={metrics} chainStatus={chainStatus} />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <EmergencyPanel emergencies={emergencies} />
          <AIHospitalInsights metrics={metrics} urgentReviewCount={urgentReviewCount} emergencyCount={emergencies.length} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <RiskQueue patients={riskPatients} />
          <ReferralCenter referrals={referrals} onReferralAction={handleReferralAction} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <PatientMonitor
            patients={filteredPatients}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedPatient={selectedPatient}
            onSelectPatient={setSelectedPatient}
          />
          <DoctorActivity doctors={doctors} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <HospitalStatistics />
          <div className="grid gap-6">
            <BlockchainActivity events={blockchainEvents} />
            <HospitalCapacity capacity={capacity} />
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">BOT Chain Explorer</p>
            <h3 className="mt-1 text-xl font-semibold text-white">Population-scale intelligence and lifecycle timelines</h3>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-cyan-300">Mother journey</p>
              <p className="mt-2 text-sm text-slate-400">Registered → ANC → referrals → delivery → vaccination.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm font-semibold text-cyan-300">Population signals</p>
              <p className="mt-2 text-sm text-slate-400">Hypertension clusters, anemia trends, overloaded facilities, and resource alerts.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Operational Notes</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Prepared for live hospital roll-out</h3>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
              <Activity className="h-4 w-4" />
              Demo metrics are stored locally and ready for API-backed integration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
