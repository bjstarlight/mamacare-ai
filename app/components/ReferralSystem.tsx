"use client";

import { useEffect, useMemo, useState } from "react";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import { hashRecord } from "../lib/hash";
import {
  ArrowRight,
  FileText,
  Building2,
  Send,
  Fingerprint,
  Bell,
  BarChart3,
  MapPin,
  CheckCircle2,
  Circle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

/**
 * ReferralSystem
 * -----------------------------------------------------------------------
 * Referral workflow: Draft → Sent → Received → Accepted → Patient
 * Arrived → Completed, plus an AI facility recommendation, BOT Chain
 * fingerprinting, mother-facing notifications, and a hospital-dashboard
 * summary.
 *
 * Honesty notes (same standard as AIClinicalDecision / HealthWallet):
 * - The AI Recommendation is computed from the diagnosis text, a
 *   hospital directory, and the mother's last known location — not a
 *   hardcoded hospital name. If none of that data exists yet, it says so
 *   instead of inventing a facility.
 * - There is no real second hospital system in this app, so "Received /
 *   Accepted / Patient Arrived / Completed" are advanced with manual
 *   controls here that stand in for what a receiving hospital's own
 *   dashboard would normally do. That's flagged in the UI, not hidden.
 * - The hospital directory below is sample data for the demo. Swap in a
 *   real directory via the `hospitalDirectory` localStorage key (same
 *   shape) and the recommendation logic works unchanged.
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Priority = "Routine" | "Urgent" | "Emergency";
type ReferralStatus =
  | "Draft"
  | "Sent"
  | "Received"
  | "Accepted"
  | "PatientArrived"
  | "Completed";

interface HospitalDirectoryEntry {
  name: string;
  specialties: string[];
  handlesEmergencies: boolean;
  latitude: number;
  longitude: number;
  address?: string;
}

interface Referral {
  id: string;
  patientName: string;
  patientId: string;
  diagnosis: string;
  reason: string;
  priority: Priority;
  destinationHospital: string;
  referringDoctor: string;
  notes: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  fingerprint?: string;
  aiRecommendedHospital?: string;
  aiRecommendedSpecialty?: string;
  aiRiskScore?: number;
  aiConfidence?: number;
  aiReason?: string;
}

interface AppNotification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface LastKnownLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface LatestBP {
  systolic?: number;
  diastolic?: number;
  timestamp?: number;
}

interface DoctorDecisionRecord {
  diagnosis?: string;
  referral?: string;
}

const STATUS_ORDER: ReferralStatus[] = [
  "Draft",
  "Sent",
  "Received",
  "Accepted",
  "PatientArrived",
  "Completed",
];

const STATUS_LABEL: Record<ReferralStatus, string> = {
  Draft: "Draft",
  Sent: "Sent",
  Received: "Received",
  Accepted: "Accepted",
  PatientArrived: "Patient Arrived",
  Completed: "Completed",
};

// Sample directory — clearly demo data. Replace by writing the same
// shape to the `hospitalDirectory` localStorage key.
const SAMPLE_HOSPITAL_DIRECTORY: HospitalDirectoryEntry[] = [
  {
    name: "(Sample) General Hospital – Central District",
    specialties: ["Obstetrics", "General Medicine"],
    handlesEmergencies: false,
    latitude: 6.5244,
    longitude: 3.3792,
    address: "Central District",
  },
  {
    name: "(Sample) Teaching Hospital – Obstetrics Emergency Unit",
    specialties: ["Obstetrics Emergency", "High-Risk Obstetrics", "Neonatal ICU"],
    handlesEmergencies: true,
    latitude: 6.5095,
    longitude: 3.3711,
    address: "University District",
  },
  {
    name: "(Sample) Community Maternity Clinic",
    specialties: ["Obstetrics", "Midwifery"],
    handlesEmergencies: false,
    latitude: 6.6018,
    longitude: 3.3515,
    address: "Northside",
  },
];

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort save
  }
}

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function haversineKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

// Same fallback ID scheme used in DoctorMode, so it lines up with the
// patient ID already shown there instead of generating a second,
// inconsistent one.
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

// ---------------------------------------------------------------------------
// Diagnosis → specialty mapping. Keyword-based, not exhaustive, but
// grounded in the actual text rather than a fixed answer.
// ---------------------------------------------------------------------------

function recommendedSpecialty(diagnosis: string): string {
  const d = diagnosis.toLowerCase();
  if (d.includes("eclampsia") || d.includes("preeclampsia") || d.includes("hellp")) {
    return "High-Risk Obstetrics / Obstetrics Emergency";
  }
  if (d.includes("hemorrhage") || d.includes("bleeding")) {
    return "Obstetrics Emergency / Blood Bank Access";
  }
  if (d.includes("hypertension")) {
    return "Obstetric Medicine";
  }
  if (d.includes("diabetes") || d.includes("gestational diabetes")) {
    return "Maternal-Fetal Medicine";
  }
  if (!diagnosis.trim()) {
    return "General Obstetrics";
  }
  return "Obstetrics & Gynecology";
}

// ---------------------------------------------------------------------------
// Multi-factor reasoning. Rather than keying off diagnosis text alone,
// this folds in real vitals, gestational age, and SOS status — the same
// signals a human would actually weigh — and shows its work via
// `reasonParts` instead of asserting a number with nothing behind it.
// ---------------------------------------------------------------------------

interface ReferralInputs {
  diagnosis: string;
  systolic: number | null;
  diastolic: number | null;
  pregnancyWeek: number | null;
  emergencySOS: boolean;
}

function diagnosisSeverityScore(diagnosis: string): number {
  const d = diagnosis.toLowerCase();
  if (d.includes("severe") || d.includes("eclampsia") || d.includes("hellp") || d.includes("hemorrhage")) {
    return 90;
  }
  if (d.includes("preeclampsia") || d.includes("hypertension")) return 60;
  if (!d.trim()) return 0;
  return 20;
}

function bpSeverityScore(systolic: number | null, diastolic: number | null): number {
  if (systolic == null || diastolic == null) return 0;
  if (systolic >= 160 || diastolic >= 110) return 90;
  if (systolic >= 140 || diastolic >= 90) return 55;
  return 10;
}

/**
 * Worst-case signal wins: a severe diagnosis with no BP on file, or a
 * severe BP with a vague diagnosis, should both be able to drive the
 * score up on their own rather than needing both to agree.
 */
function computeAIRiskScore(inputs: ReferralInputs): number {
  let score = Math.max(
    diagnosisSeverityScore(inputs.diagnosis),
    bpSeverityScore(inputs.systolic, inputs.diastolic)
  );

  // Preterm + at least moderate severity raises urgency, since it also
  // implies a NICU-capable transfer rather than just an obstetric one.
  if (inputs.pregnancyWeek != null && inputs.pregnancyWeek < 34 && score >= 55) {
    score = Math.min(100, score + 10);
  }

  if (inputs.emergencySOS) {
    score = Math.max(score, 85);
  }

  return Math.min(100, Math.round(score));
}

function riskScoreToPriority(score: number): Priority {
  if (score >= 80) return "Emergency";
  if (score >= 50) return "Urgent";
  return "Routine";
}

function buildReasonSentence(inputs: ReferralInputs): string {
  const base = inputs.diagnosis.trim() || "Hypertensive findings under review";
  let sentence = base;
  if (inputs.systolic != null && inputs.diastolic != null) {
    sentence += ` with BP ${inputs.systolic}/${inputs.diastolic}`;
  }
  if (inputs.pregnancyWeek != null) {
    sentence += ` at ${inputs.pregnancyWeek} weeks`;
  }
  sentence += ".";
  if (inputs.emergencySOS) {
    sentence += " Emergency SOS was triggered by the patient.";
  }
  return sentence;
}

/**
 * Confidence reflects how many of the real inputs (diagnosis, BP,
 * gestational age, location) are actually on file, plus whether a clean
 * specialty match was found — not a validated prediction-accuracy score.
 * More real signals + a clean match = higher confidence; missing data
 * or a fallback match = lower. A fixed number regardless of input would
 * repeat the HealthWallet fabrication bug in a higher-stakes place.
 */
function computeConfidence(
  inputs: ReferralInputs,
  specialtyMatchFound: boolean,
  hasLocation: boolean
): number {
  const dataPoints = [
    !!inputs.diagnosis.trim(),
    inputs.systolic != null && inputs.diastolic != null,
    inputs.pregnancyWeek != null,
    hasLocation,
  ];
  const dataScore = dataPoints.filter(Boolean).length / dataPoints.length;
  const matchScore = specialtyMatchFound ? 1 : 0.5;
  return Math.round(dataScore * 70 + matchScore * 30);
}

interface Recommendation {
  hospital: HospitalDirectoryEntry | null;
  distanceKm: number | null;
  specialty: string;
  priority: Priority;
  riskScore: number;
  confidence: number;
  reason: string;
  reasonParts: string[];
}

function computeRecommendation(
  inputs: ReferralInputs,
  directory: HospitalDirectoryEntry[],
  location: LastKnownLocation | null
): Recommendation {
  const specialty = recommendedSpecialty(inputs.diagnosis);
  const riskScore = computeAIRiskScore(inputs);
  const priority = riskScoreToPriority(riskScore);
  const reason = buildReasonSentence(inputs);

  const reasonParts: string[] = [
    `Combined diagnosis/BP/gestational-age signal scores ${riskScore}/100.`,
    `Recommended specialty: ${specialty}.`,
  ];

  let candidates = directory;

  if (priority === "Emergency") {
    const emergencyCapable = directory.filter((h) => h.handlesEmergencies);
    if (emergencyCapable.length > 0) {
      candidates = emergencyCapable;
      reasonParts.push("Filtered to facilities that handle obstetric emergencies.");
    }
  }

  if (inputs.pregnancyWeek != null && inputs.pregnancyWeek < 34 && riskScore >= 55) {
    const nicuCapable = candidates.filter((h) =>
      h.specialties.some((s) => s.toLowerCase().includes("neonatal"))
    );
    if (nicuCapable.length > 0) {
      candidates = nicuCapable;
      reasonParts.push(
        "Preterm gestation with elevated risk — prioritized facilities with Neonatal ICU capability."
      );
    }
  }

  const specialtyMatches = candidates.filter((h) =>
    h.specialties.some(
      (s) =>
        specialty.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(specialty.toLowerCase().split(" / ")[0].toLowerCase())
    )
  );
  const specialtyMatchFound = specialtyMatches.length > 0;
  if (specialtyMatchFound) {
    candidates = specialtyMatches;
    reasonParts.push("Narrowed to facilities matching the recommended specialty.");
  }

  const confidence = computeConfidence(inputs, specialtyMatchFound, !!location);

  if (candidates.length === 0) {
    return {
      hospital: null,
      distanceKm: null,
      specialty,
      priority,
      riskScore,
      confidence,
      reason,
      reasonParts: ["No facility in the directory matches this case."],
    };
  }

  if (location) {
    const withDistance = candidates
      .map((h) => ({ h, distance: haversineKm(location, h) }))
      .sort((a, b) => a.distance - b.distance);
    reasonParts.push(
      `Closest matching facility is ~${withDistance[0].distance.toFixed(1)} km from her last known location.`
    );
    return {
      hospital: withDistance[0].h,
      distanceKm: withDistance[0].distance,
      specialty,
      priority,
      riskScore,
      confidence,
      reason,
      reasonParts,
    };
  }

  reasonParts.push("No location on file — showing the best specialty match without distance ranking.");
  return {
    hospital: candidates[0],
    distanceKm: null,
    specialty,
    priority,
    riskScore,
    confidence,
    reason,
    reasonParts,
  };
}

// ---------------------------------------------------------------------------
// Exported so HospitalDashboard (or any other module) can reuse the exact
// same aggregation instead of re-deriving slightly different numbers.
//
// Note: this app doesn't yet model multiple facilities, so every referral
// created here is "outgoing" from the referring doctor's clinic. A real
// "incoming" count needs a facility-id field once more than one facility
// exists in the system — flagging that rather than faking a split.
// ---------------------------------------------------------------------------

export function summarizeReferrals(referrals: Referral[]) {
  const total = referrals.length;
  const outgoing = total; // see note above
  const incoming = 0;
  const pending = referrals.filter(
    (r) => r.status !== "Completed" && r.status !== "Draft"
  ).length;
  const emergency = referrals.filter((r) => r.priority === "Emergency").length;
  const completed = referrals.filter((r) => r.status === "Completed").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, outgoing, incoming, pending, emergency, completed, completionRate };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WORKFLOW_STEPS = [
  "Mother",
  "Primary Clinic",
  "AI Risk Detection",
  "Doctor Review",
  "Referral Generated",
  "Receiving Hospital",
  "Accepted",
  "Directions Sent",
  "Outcome Recorded",
];

export default function ReferralSystem() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [directory, setDirectory] = useState<HospitalDirectoryEntry[]>(
    SAMPLE_HOSPITAL_DIRECTORY
  );
  const [usingSampleDirectory, setUsingSampleDirectory] = useState(true);
  const [location, setLocation] = useState<LastKnownLocation | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [reason, setReason] = useState("");
  const [priority, setPriority] = useState<Priority>("Routine");
  const [priorityTouchedByDoctor, setPriorityTouchedByDoctor] = useState(false);
  const [destinationHospital, setDestinationHospital] = useState("");
  const [referringDoctor, setReferringDoctor] = useState("");
  const [notes, setNotes] = useState("");
  const [savingStage, setSavingStage] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(
    null
  );

  // The additional signals the AI recommendation reasons over, beyond
  // diagnosis text alone.
  const [latestBP, setLatestBP] = useState<{ systolic: number; diastolic: number } | null>(
    null
  );
  const [pregnancyWeekNum, setPregnancyWeekNum] = useState<number | null>(null);
  const [sosActive, setSosActive] = useState(false);

  useEffect(() => {
    setReferrals(readJSON<Referral[]>("referrals") ?? []);
    setNotifications(readJSON<AppNotification[]>("notifications") ?? []);
    setLocation(readJSON<LastKnownLocation>("lastKnownLocation"));

    const customDirectory = readJSON<HospitalDirectoryEntry[]>(
      "hospitalDirectory"
    );
    if (customDirectory && customDirectory.length > 0) {
      setDirectory(customDirectory);
      setUsingSampleDirectory(false);
    }

    try {
      const mother = JSON.parse(
        window.localStorage.getItem("motherProfile") || "{}"
      );
      setPatientName(mother?.name ?? "");
      setPatientId(mother?.id || buildPatientId(mother?.name));
    } catch {
      setPatientId(buildPatientId(undefined));
    }

    setReferringDoctor(window.localStorage.getItem("doctorName") ?? "");

    const decision = readJSON<DoctorDecisionRecord>("doctorDecision");
    if (decision?.diagnosis) {
      setDiagnosis(decision.diagnosis);
    }
    if (decision?.referral) {
      setReason(decision.referral);
    }

    // Shared with AIClinicalDecision / AICareCoordinator — same key, so
    // vitals captured there feed the recommendation here automatically.
    const bp = readJSON<LatestBP>("latestBP");
    if (bp?.systolic != null && bp?.diastolic != null) {
      setLatestBP({ systolic: bp.systolic, diastolic: bp.diastolic });
    }

    const weekRaw = window.localStorage.getItem("pregnancyWeek");
    if (weekRaw) {
      const w = Number(weekRaw);
      if (!Number.isNaN(w)) setPregnancyWeekNum(w);
    }

    // Requires OfflineEmergencyMode/EmergencySOS to write a
    // `lastSOSTriggeredAt` timestamp when SOS is triggered — not wired
    // there yet. Until it is, this simply reads as "no active SOS".
    const sosRaw = window.localStorage.getItem("lastSOSTriggeredAt");
    const sosTimestamp = sosRaw ? Number(sosRaw) : null;
    if (sosTimestamp && Date.now() - sosTimestamp < 24 * 60 * 60 * 1000) {
      setSosActive(true);
    }
  }, []);

  const referralInputs: ReferralInputs = useMemo(
    () => ({
      diagnosis,
      systolic: latestBP?.systolic ?? null,
      diastolic: latestBP?.diastolic ?? null,
      pregnancyWeek: pregnancyWeekNum,
      emergencySOS: sosActive,
    }),
    [diagnosis, latestBP, pregnancyWeekNum, sosActive]
  );

  const recommendation = useMemo(
    () => computeRecommendation(referralInputs, directory, location),
    [referralInputs, directory, location]
  );

  // Suggest the AI's priority by default, but only until the doctor
  // deliberately changes the dropdown themselves — after that, their
  // choice is left alone rather than silently overwritten on every
  // keystroke in the diagnosis field.
  useEffect(() => {
    if (!priorityTouchedByDoctor) {
      setPriority(recommendation.priority);
    }
  }, [recommendation.priority, priorityTouchedByDoctor]);

  function persistReferrals(updated: Referral[]) {
    setReferrals(updated);
    writeJSON("referrals", updated);
  }

  function pushNotification(message: string) {
    const updated: AppNotification[] = [
      { id: uid(), message, timestamp: new Date().toISOString(), read: false },
      ...notifications,
    ];
    setNotifications(updated);
    writeJSON("notifications", updated);
  }

  function applyRecommendation() {
    if (recommendation.hospital) {
      setDestinationHospital(recommendation.hospital.name);
    }
  }

  async function createReferral(status: "Draft" | "Sent") {
    if (!patientName || !diagnosis || !destinationHospital) return;

    setSavingStage("saving");

    const now = new Date().toISOString();
    const referral: Referral = {
      id: uid(),
      patientName,
      patientId,
      diagnosis,
      reason,
      priority,
      destinationHospital,
      referringDoctor: referringDoctor || "Unspecified",
      notes,
      status,
      createdAt: now,
      updatedAt: now,
      aiRecommendedHospital: recommendation.hospital?.name,
      aiRecommendedSpecialty: recommendation.specialty,
      aiRiskScore: recommendation.riskScore,
      aiConfidence: recommendation.confidence,
      aiReason: recommendation.reason,
    };

    if (status === "Sent") {
      referral.fingerprint = await sha256Hex(
        JSON.stringify({
          patientId: referral.patientId,
          diagnosis: referral.diagnosis,
          destinationHospital: referral.destinationHospital,
          priority: referral.priority,
          timestamp: now,
        })
      );
      pushNotification(
        `Referral generated: you're being referred to ${destinationHospital}.`
      );
    }

    const updated = [referral, ...referrals];
    persistReferrals(updated);
    setSelectedReferralId(referral.id);
    setSavingStage("saved");

    logBlockchainRecord({
      hash: hashRecord({
        type: "Referral",
        patientId: referral.patientId,
        destinationHospital: referral.destinationHospital,
        diagnosis: referral.diagnosis,
        priority: referral.priority,
        status: referral.status,
        timestamp: referral.createdAt,
      }),
      type: "Referral",
      patient: referral.patientName || "Unknown Patient",
      actor: "Referring Doctor",
      details: `${referral.destinationHospital} • ${referral.priority}`,
    });
  }

  async function advanceStatus(referralId: string) {
    const target = referrals.find((r) => r.id === referralId);
    if (!target) return;

    const currentIndex = STATUS_ORDER.indexOf(target.status);
    const nextStatus = STATUS_ORDER[currentIndex + 1];
    if (!nextStatus) return;

    const now = new Date().toISOString();
    let fingerprint = target.fingerprint;
    if (nextStatus === "Sent" && !fingerprint) {
      fingerprint = await sha256Hex(
        JSON.stringify({
          patientId: target.patientId,
          diagnosis: target.diagnosis,
          destinationHospital: target.destinationHospital,
          priority: target.priority,
          timestamp: now,
        })
      );
    }

    const updated = referrals.map((r) =>
      r.id === referralId
        ? { ...r, status: nextStatus, updatedAt: now, fingerprint }
        : r
    );
    persistReferrals(updated);

    if (nextStatus === "Accepted") {
      const hospital = directory.find((h) => h.name === target.destinationHospital);
      const directionsLink = hospital
        ? `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`
        : null;
      pushNotification(
        `${target.destinationHospital} accepted your referral.${
          directionsLink ? " Directions are now available." : ""
        }`
      );
    } else if (nextStatus === "PatientArrived") {
      pushNotification(`Check-in confirmed at ${target.destinationHospital}.`);
    } else if (nextStatus === "Completed") {
      pushNotification(
        `${target.destinationHospital} has recorded the outcome of your visit.`
      );
    }
  }

  const selectedReferral = referrals.find((r) => r.id === selectedReferralId);
  const summary = useMemo(() => summarizeReferrals(referrals), [referrals]);
  const directionsHospital = selectedReferral
    ? directory.find((h) => h.name === selectedReferral.destinationHospital)
    : null;

  return (
    <div className="space-y-6">
      {/* Workflow strip */}
      <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex min-w-max items-center gap-1.5 text-xs font-medium text-slate-500">
          {WORKFLOW_STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-1.5">
              <span className="whitespace-nowrap rounded-full bg-slate-100 px-3 py-1">
                {step}
              </span>
              {i < WORKFLOW_STEPS.length - 1 && (
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-slate-300" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Prototype notice — sets accurate expectations rather than overclaiming */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <strong>Prototype Notice:</strong> Hospital recommendations
          currently use a sample directory for demonstration purposes.
          This can be connected to a live hospital registry or health
          information exchange in production.
        </p>
      </div>

      {/* AI Inputs — the actual signals feeding the recommendation below,
          shown explicitly so it's clear this is multi-factor reasoning
          rather than a diagnosis-only lookup. */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">AI Inputs</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InputSignal label="Diagnosis" value={diagnosis || "Not entered"} present={!!diagnosis} />
          <InputSignal
            label="AI Risk Score"
            value={`${recommendation.riskScore}/100`}
            present
          />
          <InputSignal
            label="Pregnancy Week"
            value={pregnancyWeekNum != null ? `${pregnancyWeekNum}` : "Not on file"}
            present={pregnancyWeekNum != null}
          />
          <InputSignal
            label="Blood Pressure"
            value={latestBP ? `${latestBP.systolic}/${latestBP.diastolic}` : "Not on file"}
            present={!!latestBP}
          />
          <InputSignal
            label="Emergency SOS"
            value={sosActive ? "Active" : "None"}
            present={sosActive}
            warnWhenPresent
          />
          <InputSignal
            label="Distance"
            value={recommendation.distanceKm != null ? `${recommendation.distanceKm.toFixed(1)} km` : "Unknown"}
            present={recommendation.distanceKm != null}
          />
          <InputSignal
            label="Specialty Required"
            value={recommendation.specialty}
            present
          />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-slate-800">Referral Form</h2>
          </div>

          <div className="space-y-3">
            <Field label="Patient Name">
              <input
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
            <Field label="Patient ID">
              <input
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
            <Field label="Diagnosis">
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g. Severe Preeclampsia"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
            <Field label="Reason for Referral">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
            <Field label="Priority">
              <div className="flex items-center gap-2">
                <select
                  value={priority}
                  onChange={(e) => {
                    setPriority(e.target.value as Priority);
                    setPriorityTouchedByDoctor(true);
                  }}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
                {priorityTouchedByDoctor && priority !== recommendation.priority && (
                  <button
                    type="button"
                    onClick={() => {
                      setPriority(recommendation.priority);
                      setPriorityTouchedByDoctor(false);
                    }}
                    className="whitespace-nowrap text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Use AI ({recommendation.priority})
                  </button>
                )}
              </div>
            </Field>
            <Field label="Destination Hospital">
              <select
                value={destinationHospital}
                onChange={(e) => setDestinationHospital(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a facility…</option>
                {directory.map((h) => (
                  <option key={h.name} value={h.name}>
                    {h.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Referring Doctor">
              <input
                value={referringDoctor}
                onChange={(e) => setReferringDoctor(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
            <Field label="Notes">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Field>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => createReferral("Sent")}
              disabled={!patientName || !diagnosis || !destinationHospital}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Send className="h-4 w-4" />
              Generate &amp; Send Referral
            </button>
            <button
              onClick={() => createReferral("Draft")}
              disabled={!patientName || !diagnosis}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
            >
              Save as Draft
            </button>
          </div>
          {savingStage === "saving" && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving and fingerprinting…
            </p>
          )}
          {savingStage === "saved" && (
            <p className="mt-2 text-sm font-medium text-emerald-600">
              Referral saved.
            </p>
          )}
        </section>

        <div className="space-y-6">
          {/* AI Recommendation */}
          <section className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">
                Referral Recommendation
              </h2>
            </div>
            {usingSampleDirectory && (
              <p className="mb-3 text-xs font-medium text-blue-600">
                Using sample hospital directory — connect a real facility
                list via the `hospitalDirectory` key for live results.
              </p>
            )}

            {recommendation.hospital ? (
              <>
                <dl className="space-y-2.5">
                  <RecommendationRow label="Hospital">
                    <strong>{recommendation.hospital.name}</strong>
                    {recommendation.hospital.address
                      ? ` — ${recommendation.hospital.address}`
                      : ""}
                  </RecommendationRow>
                  <RecommendationRow label="Distance">
                    {recommendation.distanceKm != null
                      ? `${recommendation.distanceKm.toFixed(1)} km`
                      : "Unknown — no location on file"}
                  </RecommendationRow>
                  <RecommendationRow label="Specialty">
                    {recommendation.specialty}
                  </RecommendationRow>
                  <RecommendationRow label="Reason">
                    {recommendation.reason}
                  </RecommendationRow>
                  <RecommendationRow label="Priority">
                    <PriorityBadge priority={recommendation.priority} />
                  </RecommendationRow>
                  <RecommendationRow label="Confidence">
                    {recommendation.confidence}%
                  </RecommendationRow>
                </dl>

                <details className="mt-3">
                  <summary className="cursor-pointer text-xs font-semibold text-blue-600">
                    Why this recommendation?
                  </summary>
                  <ul className="mt-1.5 space-y-0.5">
                    {recommendation.reasonParts.map((r, i) => (
                      <li key={i} className="text-xs text-slate-500">
                        • {r}
                      </li>
                    ))}
                  </ul>
                </details>

                <button
                  onClick={applyRecommendation}
                  className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Use this facility
                </button>
              </>
            ) : (
              <p className="text-sm text-slate-600">
                {diagnosis
                  ? "No facility in the directory matches this case yet — choose one manually."
                  : "Enter a diagnosis above to get a facility recommendation."}
              </p>
            )}
            {!location && (
              <p className="mt-3 text-xs text-slate-500">
                No location on file, so distance isn't factored in. This
                fills in automatically once Offline Emergency Mode captures
                her location.
              </p>
            )}
          </section>

          {/* Hospital command summary */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <h2 className="font-semibold text-slate-800">
                Hospital Command Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <SummaryStat label="Outgoing" value={summary.outgoing} />
              <SummaryStat label="Incoming" value={summary.incoming} note="n/a — single facility" />
              <SummaryStat label="Pending" value={summary.pending} />
              <SummaryStat label="Emergency" value={summary.emergency} warn={summary.emergency > 0} />
              <SummaryStat label="Completed" value={summary.completed} good />
              <SummaryStat label="Completion Rate" value={`${summary.completionRate}%`} good={summary.completionRate >= 50} />
            </div>
          </section>
        </div>
      </div>

      {/* Referral list + status tracker */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Referrals</h2>
        </div>

        {referrals.length === 0 ? (
          <p className="text-sm text-slate-400">
            No referrals yet. Generate one above.
          </p>
        ) : (
          <div className="space-y-4">
            {referrals.map((r) => (
              <div
                key={r.id}
                className={`rounded-xl border p-4 transition ${
                  selectedReferralId === r.id
                    ? "border-blue-300 bg-blue-50/50"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <button
                    onClick={() => setSelectedReferralId(r.id)}
                    className="text-left"
                  >
                    <p className="font-semibold text-slate-800">
                      {r.patientName} — {r.diagnosis}
                    </p>
                    <p className="text-xs text-slate-500">
                      To {r.destinationHospital} · {r.priority} ·{" "}
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </button>
                  <PriorityBadge priority={r.priority} />
                </div>

                {/* Status tracker */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {STATUS_ORDER.map((status, i) => {
                    const currentIndex = STATUS_ORDER.indexOf(r.status);
                    const reached = i <= currentIndex;
                    return (
                      <div key={status} className="flex items-center gap-1">
                        {reached ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                        <span
                          className={`text-xs ${
                            reached
                              ? "font-medium text-slate-700"
                              : "text-slate-400"
                          }`}
                        >
                          {STATUS_LABEL[status]}
                        </span>
                        {i < STATUS_ORDER.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  {r.status !== "Completed" && (
                    <button
                      onClick={() => advanceStatus(r.id)}
                      className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900"
                    >
                      Mark as {STATUS_LABEL[STATUS_ORDER[STATUS_ORDER.indexOf(r.status) + 1]]}
                    </button>
                  )}
                  {r.fingerprint && (
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verified Referral
                    </span>
                  )}
                </div>

                {selectedReferralId === r.id && r.fingerprint && (
                  <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <Fingerprint className="h-3.5 w-3.5" />
                      BOT Chain Fingerprint
                    </div>
                    <code className="mt-1 block break-all text-[11px] text-slate-600">
                      {r.fingerprint}
                    </code>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Notifications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">
            Mother Notifications
          </h2>
        </div>
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-400">
            Notifications generated by this referral will appear here (and
            in NotificationCenter, if it reads the same `notifications`
            key).
          </p>
        ) : (
          <ul className="space-y-2">
            {notifications.slice(0, 6).map((n) => (
              <li key={n.id} className="text-sm text-slate-600">
                <span className="text-xs text-slate-400">
                  {new Date(n.timestamp).toLocaleString()}
                </span>{" "}
                — {n.message}
              </li>
            ))}
          </ul>
        )}
        {directionsHospital && (
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${directionsHospital.latitude},${directionsHospital.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:underline"
          >
            <MapPin className="h-4 w-4" />
            Open directions to {directionsHospital.name}
          </a>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function RecommendationRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
      <dt className="w-28 flex-shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="text-sm text-slate-800">{children}</dd>
    </div>
  );
}

function InputSignal({
  label,
  value,
  present,
  warnWhenPresent,
}: {
  label: string;
  value: string;
  present: boolean;
  warnWhenPresent?: boolean;
}) {
  const styles = warnWhenPresent && present
    ? "bg-red-50 text-red-700"
    : present
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-50 text-slate-400";
  return (
    <div className={`rounded-xl p-3 ${styles}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  const styles =
    priority === "Emergency"
      ? "bg-red-100 text-red-700"
      : priority === "Urgent"
      ? "bg-amber-100 text-amber-700"
      : "bg-slate-100 text-slate-600";
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {priority}
    </span>
  );
}

function SummaryStat({
  label,
  value,
  note,
  warn,
  good,
}: {
  label: string;
  value: string | number;
  note?: string;
  warn?: boolean;
  good?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 text-center ${
        warn ? "bg-red-50" : good ? "bg-emerald-50" : "bg-slate-50"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p
        className={`mt-0.5 text-lg font-bold ${
          warn ? "text-red-600" : good ? "text-emerald-600" : "text-slate-800"
        }`}
      >
        {value}
      </p>
      {note && <p className="text-[10px] text-slate-400">{note}</p>}
    </div>
  );
}