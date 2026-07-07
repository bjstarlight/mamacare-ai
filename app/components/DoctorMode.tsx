"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  User,
  Activity,
  Stethoscope,
  Pill,
  FlaskConical,
  FileOutput,
  ShieldCheck,
  Heart,
  Droplet,
  Baby as BabyIcon,
  CalendarDays,
  Lock,
  Share2,
} from "lucide-react";

// ── Existing MamaCare components ──────────────────────────────────
// These are assumed to already exist in ./components based on the
// redesign brief. If any of them take specific props in your actual
// implementation, pass them through here — right now only the ones
// with an established signature (PregnancyTimelineCard) receive props.
import PatientSummary from "./PatientSummary";
import AIClinicalSummary from "./AIClinicalSummary";
import ClinicalRiskFlags from "./ClinicalRiskFlags";
import ClinicalTimeline from "./ClinicalTimeline";
import PregnancyTimelineCard from "./PregnancyTimelineCard";
import VitalSigns from "./VitalSigns";
import SOAPNotes from "./SOAPNotes";
import MedicationInteractionChecker from "./MedicationInteractionChecker";
import ClinicalSummary from "./ClinicalSummary";
import ShareWithDoctor from "./ShareWithDoctor";
import ExportPDF from "./Exportpdf";
import AIClinicalDecisionSupport from "./AIClinicalDecisionSupport";
import AIObstetricAssistant from "./AIObstetricAssistant";
import EmergencyMode from "./EmergencyMode";
import HospitalDashboard from "./HospitalDashboard";
import OfflineEmergencyMode from "./OfflineEmergencyMode";
import AIClinicalDecision from "./AIClinicalDecision";
import RealtimeMonitoringDashboard from "./RealtimeMonitoringDashboard";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import { hashRecord } from "../lib/hash";
import HospitalPopulationDashboard from "./HospitalPopulationDashboard";

type MotherProfile = {
  name?: string;
  bloodGroup?: string;
  aiRisk?: string;
  bp?: string;
  id?: string;
  [key: string]: unknown;
};

type BabyProfile = {
  name?: string;
  status?: string;
  [key: string]: unknown;
};

type Prescription = {
  date: string;
  diagnosis: string;
  prescription: string;
};

const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: Building2 },
  { id: "patient", label: "Patient", icon: User },
  { id: "timeline", label: "Timeline", icon: Activity },
  { id: "consultation", label: "Consultation", icon: Stethoscope },
  { id: "monitoring", label: "Monitoring", icon: Activity },
  { id: "medications", label: "Medications", icon: Pill },
  { id: "labs", label: "Labs", icon: FlaskConical },
  { id: "offline", label: "Offline Emergency", icon: ShieldCheck },
  { id: "export", label: "Export", icon: FileOutput },
  {id: "population",label: "Population",icon: Activity},

] as const;

type ModuleId =
  | "dashboard"
  | "patient"
  | "timeline"
  | "consultation"
  | "monitoring"
  | "AICareCoordinator"
  | "medications"
  | "labs"
  | "offline"
  | "export"
  | "population";

function buildPatientId(name: string | undefined): string {
  const base = name && name.trim().length > 0 ? name.trim() : "MAMACARE";
  let hash = 0;
  for (let i = 0; i < base.length; i++) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6);
  return `MC-${code}`;
}

function parseJson<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function DoctorMode() {
  const [activeModule, setActiveModule] = useState<ModuleId>("patient");

  const [mother] = useState<MotherProfile>(() =>
    typeof window === "undefined"
      ? {}
      : parseJson<MotherProfile>(localStorage.getItem("motherProfile") || "{}", {})
  );
  const [baby] = useState<BabyProfile>(() =>
    typeof window === "undefined"
      ? {}
      : parseJson<BabyProfile>(localStorage.getItem("babyProfile") || "{}", {})
  );
  const [pregnancyWeek] = useState<string>(() =>
    typeof window === "undefined" ? "-" : localStorage.getItem("pregnancyWeek") || "-"
  );
  const [protectedRecords, setProtectedRecords] = useState<number>(() =>
    typeof window === "undefined"
      ? 0
      : Number(localStorage.getItem("protectedRecords")) || 0
  );
  const [lastVerified, setLastVerified] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "Never";
    }
    return localStorage.getItem("lastVerified") || "Never";
  });
  const [nextAppointment] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "No upcoming appointment";
    }
    const raw = localStorage.getItem("appointments");
    if (!raw) return "No upcoming appointment";
    try {
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      if (list.length > 0 && list[0]) {
        const dateLabel = list[0].date || "Date TBD";
        const doctorLabel = list[0].doctor ? ` with ${list[0].doctor}` : "";
        return `${dateLabel}${doctorLabel}`;
      }
    } catch {
      // Ignore invalid appointments
    }
    return "No upcoming appointment";
  });
  const [patientId] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "MC-000000";
    }
    const motherData = parseJson<MotherProfile>(localStorage.getItem("motherProfile") || "{}", {});
    return motherData.id || buildPatientId(motherData.name);
  });

  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [prescriptionHistory, setPrescriptionHistory] = useState<Prescription[]>(() =>
    typeof window === "undefined"
      ? []
      : parseJson<Prescription[]>(localStorage.getItem("prescriptionHistory") || "[]", [])
  );
  const [saveStatus, setSaveStatus] = useState("");

  function persistConsultation(verify: boolean) {
    const entry: Prescription = {
      date: new Date().toLocaleString(),
      diagnosis,
      prescription,
    };

    const updatedHistory = [entry, ...prescriptionHistory];
    setPrescriptionHistory(updatedHistory);
    localStorage.setItem("prescriptionHistory", JSON.stringify(updatedHistory));
    localStorage.setItem(
      "doctorConsultation",
      JSON.stringify({ diagnosis, notes, prescription, followUpDate })
    );

    logBlockchainRecord({
      hash: hashRecord({
        type: "Clinical Consultation",
        patient: mother.name || "Unknown Patient",
        diagnosis,
        prescription,
        verified: verify,
        timestamp: new Date().toISOString(),
      }),
      type: "Clinical Consultation",
      patient: mother.name || "Unknown Patient",
      actor: "Doctor",
      details: diagnosis || "Clinical consultation recorded",
    });

    if (verify) {
      setSaveStatus("Consultation saved locally. Sensitive clinical details remain off-chain.");
    } else {
      setSaveStatus("Consultation saved.");
    }
  }

  function handleGenerateReport() {
    persistConsultation(false);
    window.print();
  }

  const riskLevel = mother.aiRisk || "Not Assessed";

  const snapshot = [
    { icon: Heart, label: "BP", value: mother.bp || "—" },
    { icon: Droplet, label: "Blood Group", value: mother.bloodGroup || "-" },
    { icon: Activity, label: "Pregnancy", value: `${pregnancyWeek} Weeks` },
    { icon: BabyIcon, label: "Baby", value: baby.status || "Healthy" },
    { icon: CalendarDays, label: "Next Visit", value: nextAppointment },
    { icon: Lock, label: "Records", value: `${protectedRecords} Protected` },
  ];

  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900">
      <div className="flex flex-col lg:flex-row">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="lg:w-56 shrink-0 bg-slate-900 text-slate-200">
          <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
            <Building2 className="h-5 w-5 text-blue-400" />
            <span className="font-semibold text-white text-sm tracking-wide">
              Clinical Portal
            </span>
          </div>

          <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible">
            {MODULES.map((mod) => {
              const Icon = mod.icon;
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium whitespace-nowrap border-l-2 transition-colors ${
                    isActive
                      ? "border-blue-400 bg-white/5 text-white"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {mod.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Main panel ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Header banner */}
          <header className="bg-white border-b border-slate-200 px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                <h1 className="font-semibold text-slate-800">
                  MamaCare Clinical Portal
                </h1>
              </div>

              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                BOT Verified
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Patient</p>
                <p className="font-semibold text-slate-800">{mother.name || "Unknown"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Patient ID</p>
                <p className="font-mono font-semibold text-slate-800">{patientId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Pregnancy Week</p>
                <p className="font-semibold text-slate-800">{pregnancyWeek}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">AI Risk Score</p>
                <p className="font-semibold text-slate-800">{riskLevel}</p>
              </div>
            </div>
          </header>

          <main className="p-6 space-y-6">

            {activeModule === "dashboard" && (
  <HospitalDashboard />
)}

            {/* ── Patient module ───────────────────────────── */}
            {activeModule === "patient" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {snapshot.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm"
                    >
                      <card.icon className="h-4 w-4 text-blue-600 mb-2" />
                      <p className="text-xs text-slate-400">{card.label}</p>
                      <p className="font-semibold text-slate-800 text-sm mt-0.5">
                        {card.value}
                      </p>
                    </div>
                  ))}
                </div>

                <EmergencyMode /> 
                <PatientSummary />
                <AIClinicalDecisionSupport />
                <AIObstetricAssistant />
                <AIClinicalDecision />
              </div>
            )}

            {activeModule === "offline" && (
              <div className="space-y-6">
                <OfflineEmergencyMode />
              </div>
            )}

            {/* ── Timeline module ──────────────────────────── */}
            {activeModule === "timeline" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <AIClinicalSummary />
                  <ClinicalRiskFlags />
                </div>
                <div className="space-y-6">
                  <PregnancyTimelineCard
                    pregnancyWeek={pregnancyWeek}
                    openTimeline={() => setActiveModule("timeline")}
                  />
                  <ClinicalTimeline pregnancyWeek={""} />
                </div>
              </div>
            )}

            {/* ── Consultation module ──────────────────────── */}
            {activeModule === "consultation" && (
              <div className="space-y-6">
                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-blue-600" />
                      Doctor Workspace
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Diagnosis
                      </label>
                      <input
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        placeholder="e.g. Gestational hypertension"
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Clinical Notes
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={4}
                        placeholder="Observations, patient history, examination findings..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Prescription
                      </label>
                      <textarea
                        value={prescription}
                        onChange={(e) => setPrescription(e.target.value)}
                        rows={3}
                        placeholder="Medication, dosage, frequency..."
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="mt-1 w-full sm:w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={() => persistConsultation(false)}
                      className="rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => persistConsultation(true)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
                    >
                      Save &amp; Verify
                    </button>
                    <button
                      onClick={handleGenerateReport}
                      className="rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-semibold px-5 py-2.5 transition-colors"
                    >
                      Generate Report
                    </button>
                  </div>

                  {saveStatus && (
                    <p className="mt-3 text-sm text-emerald-600 font-medium">
                      {saveStatus}
                    </p>
                  )}
                </div>

                <SOAPNotes />
              </div>
            )}

            {/* ── Monitoring module ───────────────────────── */}
            {activeModule === "monitoring" && (
              <RealtimeMonitoringDashboard />
            )}

            {/* ── Medications module ───────────────────────── */}
            {activeModule === "medications" && (
              <div className="grid lg:grid-cols-2 gap-6">
                <MedicationInteractionChecker />

                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
                  <h2 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                    <Pill className="h-4 w-4 text-blue-600" />
                    Prescription History
                  </h2>

                  {prescriptionHistory.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      No prescriptions recorded yet. Entries saved from the
                      Consultation module will appear here.
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100">
                      {prescriptionHistory.map((entry, index) => (
                        <li key={index} className="py-3 text-sm">
                          <p className="text-xs text-slate-400">{entry.date}</p>
                          <p className="font-semibold text-slate-800 mt-0.5">
                            {entry.diagnosis || "No diagnosis recorded"}
                          </p>
                          <p className="text-slate-600 mt-0.5">
                            {entry.prescription || "No prescription recorded"}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* ── Labs module ──────────────────────────────── */}
            {activeModule === "labs" && (
              <div className="space-y-6">
                <VitalSigns />
              </div>
            )}

            {/* ── Export module ────────────────────────────── */}
            {activeModule === "export" && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    onClick={handleGenerateReport}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white py-6 shadow-sm transition-colors"
                  >
                    <FileOutput className="h-5 w-5" />
                    <span className="font-semibold text-sm">Generate Medical Pass</span>
                  </button>

                  <button
                    onClick={() => setActiveModule("export")}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-900 text-white py-6 shadow-sm transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                    <span className="font-semibold text-sm">Share with Doctor</span>
                  </button>

                  <button
                    onClick={() => persistConsultation(true)}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white py-6 shadow-sm transition-colors"
                  >
                    <ShieldCheck className="h-5 w-5" />
                    <span className="font-semibold text-sm">Verify on BOT Chain</span>
                  </button>
                </div>

                <ClinicalSummary />
                <ShareWithDoctor />
                <ExportPDF />
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}