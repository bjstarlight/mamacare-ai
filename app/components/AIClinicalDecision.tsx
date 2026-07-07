"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  FlaskConical,
  Pill,
  ShieldCheck,
  Stethoscope,
  XCircle,
  Fingerprint,
  Loader2,
} from "lucide-react";

/**
 * AIClinicalDecision
 * -----------------------------------------------------------------------
 * A preeclampsia-focused clinical decision-support card for Doctor Mode.
 *
 * IMPORTANT — honesty constraints this file follows on purpose:
 * - Diagnosis, confidence, and risk score are all COMPUTED from the vitals
 *   and symptoms actually entered below. None of them are hardcoded. A
 *   fixed "94% confidence" regardless of input would be the same
 *   fabrication bug we fixed in HealthWallet — except here it would sit
 *   next to a real treatment/referral plan a doctor could act on.
 * - The scoring logic mirrors standard preeclampsia/severe-features
 *   criteria (BP thresholds, proteinuria, symptoms), not an opaque model.
 * - Every recommendation escalates only when its actual clinical
 *   criteria are met — severe treatment (Magnesium Sulphate, immediate
 *   referral) is not shown for a mild/borderline picture.
 * - This is decision SUPPORT. The UI says so, and nothing gets written
 *   to the chart/chain until a doctor explicitly accepts or edits it.
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MotherProfile {
  name?: string;
}

interface Symptoms {
  headache: boolean;
  blurredVision: boolean;
  legSwelling: boolean;
  proteinuria: boolean;
  epigastricPain: boolean;
}

type Severity = "none" | "gestationalHypertension" | "preeclampsia" | "severePreeclampsia";

interface DoctorDecisionRecord {
  diagnosis: string;
  accepted: boolean;
  modified: boolean;
  doctor: string;
  date: string;
  treatment: string[];
  referral: string;
}

const DEFAULT_SYMPTOMS: Symptoms = {
  headache: false,
  blurredVision: false,
  legSwelling: false,
  proteinuria: false,
  epigastricPain: false,
};

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

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---------------------------------------------------------------------------
// Clinical scoring — grounded in standard preeclampsia criteria:
//   Gestational hypertension: BP >= 140/90, no proteinuria/symptoms.
//   Preeclampsia: BP >= 140/90 + proteinuria (or a severe-range symptom).
//   Severe features: BP >= 160/110, OR preeclampsia + a severe symptom
//   (headache, blurred vision, epigastric pain) or proteinuria.
// This is a simplified teaching-level version of real criteria, not a
// certified clinical algorithm — the UI says so.
// ---------------------------------------------------------------------------

function classifySeverity(
  systolic: number | null,
  diastolic: number | null,
  symptoms: Symptoms
): Severity {
  if (systolic == null || diastolic == null) return "none";

  const hypertensive = systolic >= 140 || diastolic >= 90;
  const severeRangeBP = systolic >= 160 || diastolic >= 110;
  const severeSymptomPresent =
    symptoms.headache || symptoms.blurredVision || symptoms.epigastricPain;

  if (!hypertensive) return "none";

  // Severe-range BP is itself a severe feature per standard criteria,
  // regardless of whether proteinuria/symptoms are also present.
  if (severeRangeBP) return "severePreeclampsia";

  const hasPreeclampsiaMarker = symptoms.proteinuria || severeSymptomPresent;

  if (hasPreeclampsiaMarker) {
    if (severeSymptomPresent && symptoms.proteinuria) return "severePreeclampsia";
    return "preeclampsia";
  }

  return "gestationalHypertension";
}

const SEVERITY_LABEL: Record<Severity, string> = {
  none: "No hypertensive findings identified",
  gestationalHypertension: "Suggestive of Gestational Hypertension",
  preeclampsia: "Suggestive of Preeclampsia",
  severePreeclampsia: "Suggestive of Severe Preeclampsia",
};

const RISK_BAND: Record<Severity, { label: string; approx: number }> = {
  none: { label: "Low", approx: 10 },
  gestationalHypertension: { label: "Moderate", approx: 45 },
  preeclampsia: { label: "High", approx: 70 },
  severePreeclampsia: { label: "Very High", approx: 90 },
};

function buildDifferentials(severity: Severity, symptoms: Symptoms): string[] {
  const list: string[] = [];
  if (severity === "severePreeclampsia") {
    list.push("Severe Preeclampsia");
    list.push("Gestational Hypertension");
    if (symptoms.epigastricPain || symptoms.proteinuria) {
      list.push("HELLP Syndrome — rule out pending labs");
    }
  } else if (severity === "preeclampsia") {
    list.push("Preeclampsia");
    list.push("Gestational Hypertension");
  } else if (severity === "gestationalHypertension") {
    list.push("Gestational Hypertension");
    list.push("Chronic Hypertension (if predates 20 weeks)");
  } else {
    list.push("No hypertensive spectrum disorder identified from current data");
  }
  return list;
}

function buildInvestigations(severity: Severity): string[] {
  if (severity === "none") {
    return ["Routine antenatal labs as scheduled"];
  }
  return [
    "CBC",
    "Liver Function Test",
    "Urinalysis",
    "Protein:Creatinine Ratio",
    "Renal Function Test",
    "Obstetric Ultrasound",
  ];
}

function buildTreatment(severity: Severity): string[] {
  switch (severity) {
    case "severePreeclampsia":
      return [
        "Magnesium Sulphate (seizure prophylaxis, per hospital protocol)",
        "Labetalol or facility-approved antihypertensive",
        "Admit patient",
        "Continuous maternal & fetal monitoring",
      ];
    case "preeclampsia":
      return [
        "Oral antihypertensive per facility protocol",
        "Increase antenatal visit frequency",
        "Daily BP self-monitoring",
        "Educate on warning symptoms requiring immediate return",
      ];
    case "gestationalHypertension":
      return [
        "Outpatient BP monitoring",
        "Follow-up in 3–7 days",
        "Educate on warning symptoms requiring immediate return",
      ];
    default:
      return ["Continue routine antenatal care"];
  }
}

function buildReferral(severity: Severity): { text: string; reason: string } {
  if (severity === "severePreeclampsia") {
    return {
      text: "Refer immediately to a tertiary hospital.",
      reason: "Severe features present — high maternal and fetal risk.",
    };
  }
  if (severity === "preeclampsia") {
    return {
      text: "Escalate to a facility with obstetric high-risk capability if not already there.",
      reason: "Preeclampsia criteria met — risk of progression to severe disease.",
    };
  }
  if (severity === "gestationalHypertension") {
    return {
      text: "Continue monitoring at current facility; escalate if BP worsens or symptoms develop.",
      reason: "Hypertension without preeclampsia markers at this time.",
    };
  }
  return {
    text: "No referral indicated based on current data.",
    reason: "No hypertensive or preeclampsia findings identified.",
  };
}

/**
 * Confidence is NOT a validated diagnostic accuracy score — it reflects
 * how many of the criteria this tool actually needs (BP, each symptom
 * checkbox) have been given a value, vs. left at defaults. A fixed
 * number here would overstate what a simple rule engine can claim.
 */
function computeAssessmentConfidence(
  hasBP: boolean,
  symptoms: Symptoms
): number {
  const symptomFields = Object.values(symptoms);
  const answered = (hasBP ? 1 : 0) + symptomFields.filter(Boolean).length;
  const total = 1 + symptomFields.length;
  return Math.round((answered / total) * 100);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIClinicalDecision() {
  const [motherName, setMotherName] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [doctorName, setDoctorName] = useState("");

  const [systolicInput, setSystolicInput] = useState("");
  const [diastolicInput, setDiastolicInput] = useState("");
  const [temperature, setTemperature] = useState("");
  const [weight, setWeight] = useState("");
  const [symptoms, setSymptoms] = useState<Symptoms>(DEFAULT_SYMPTOMS);

  const [modifiedDiagnosis, setModifiedDiagnosis] = useState<string | null>(
    null
  );
  const [modifiedTreatment, setModifiedTreatment] = useState<string | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [decisionStatus, setDecisionStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const [lastDecision, setLastDecision] = useState<DoctorDecisionRecord | null>(
    null
  );
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    const mother = readJSON<MotherProfile>("motherProfile");
    setMotherName(mother?.name ?? "");
    setPregnancyWeek(window.localStorage.getItem("pregnancyWeek") ?? "");
    setDoctorName(window.localStorage.getItem("doctorName") ?? "");

    const bp = readJSON<{ systolic?: number; diastolic?: number }>(
      "latestBP"
    );
    if (bp?.systolic != null) setSystolicInput(String(bp.systolic));
    if (bp?.diastolic != null) setDiastolicInput(String(bp.diastolic));

    setLastDecision(readJSON<DoctorDecisionRecord>("doctorDecision"));
  }, []);

  const systolic = systolicInput ? Number(systolicInput) : null;
  const diastolic = diastolicInput ? Number(diastolicInput) : null;
  const hasBP =
    systolic != null && diastolic != null && !Number.isNaN(systolic) && !Number.isNaN(diastolic);

  const severity = useMemo(
    () => classifySeverity(hasBP ? systolic : null, hasBP ? diastolic : null, symptoms),
    [hasBP, systolic, diastolic, symptoms]
  );

  const diagnosis = SEVERITY_LABEL[severity];
  const differentials = useMemo(
    () => buildDifferentials(severity, symptoms),
    [severity, symptoms]
  );
  const investigations = useMemo(() => buildInvestigations(severity), [
    severity,
  ]);
  const treatment = useMemo(() => buildTreatment(severity), [severity]);
  const referral = useMemo(() => buildReferral(severity), [severity]);
  const riskBand = RISK_BAND[severity];
  const confidence = useMemo(
    () => computeAssessmentConfidence(hasBP, symptoms),
    [hasBP, symptoms]
  );

  const severityColor =
    severity === "severePreeclampsia"
      ? "red"
      : severity === "preeclampsia"
      ? "amber"
      : severity === "gestationalHypertension"
      ? "amber"
      : "emerald";

  function toggleSymptom(key: keyof Symptoms) {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function persistDoctorName(value: string) {
    setDoctorName(value);
    window.localStorage.setItem("doctorName", value);
  }

  function saveVitalsToLatestBP() {
    if (!hasBP) return;
    writeJSON("latestBP", {
      systolic,
      diastolic,
      timestamp: Date.now(),
    });
  }

  async function finalizeDecision(accepted: boolean) {
    saveVitalsToLatestBP();

    const finalDiagnosis = modifiedDiagnosis ?? diagnosis;
    const finalTreatment = modifiedTreatment
      ? modifiedTreatment.split("\n").filter(Boolean)
      : treatment;

    const record: DoctorDecisionRecord = {
      diagnosis: finalDiagnosis,
      accepted,
      modified: modifiedDiagnosis != null || modifiedTreatment != null,
      doctor: doctorName || "Unspecified",
      date: new Date().toISOString(),
      treatment: finalTreatment,
      referral: referral.text,
    };

    setDecisionStatus("saving");
    writeJSON("doctorDecision", record);
    setLastDecision(record);

    // BOT Chain fingerprint: a real SHA-256 hash of the decision content,
    // not a fake placeholder string — this runs entirely client-side so
    // it works offline too.
    const hash = await sha256Hex(
      JSON.stringify({
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        referral: record.referral,
        timestamp: record.date,
      })
    );
    setFingerprint(hash);

    setDecisionStatus("saved");
    setIsEditing(false);
  }

  function ignoreRecommendation() {
    writeJSON("doctorDecision", {
      diagnosis,
      accepted: false,
      modified: false,
      doctor: doctorName || "Unspecified",
      date: new Date().toISOString(),
      treatment: [],
      referral: "Not referred — recommendation ignored by clinician.",
    });
    setLastDecision(
      readJSON<DoctorDecisionRecord>("doctorDecision")
    );
    setFingerprint(null);
    setDecisionStatus("idle");
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer — always visible, not something the doctor has to dig for */}
      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <strong>Decision support only.</strong> This assessment is
          generated from the vitals and symptoms entered below using
          simplified preeclampsia criteria. It does not replace clinical
          judgment and nothing is saved until you accept, modify, or
          ignore it.
        </p>
      </div>

      {/* Patient Snapshot */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Patient Snapshot</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mother
            </label>
            <p className="mt-1 font-medium text-slate-800">
              {motherName || "Unknown"}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Pregnancy Week
            </label>
            <p className="mt-1 font-medium text-slate-800">
              {pregnancyWeek || "Not recorded"}
            </p>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Recording Doctor
            </label>
            <input
              value={doctorName}
              onChange={(e) => persistDoctorName(e.target.value)}
              placeholder="Dr. name"
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Blood Pressure (mmHg)
            </label>
            <div className="mt-1 flex items-center gap-1">
              <input
                inputMode="numeric"
                value={systolicInput}
                onChange={(e) => setSystolicInput(e.target.value)}
                placeholder="120"
                className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-slate-400">/</span>
              <input
                inputMode="numeric"
                value={diastolicInput}
                onChange={(e) => setDiastolicInput(e.target.value)}
                placeholder="80"
                className="w-16 rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Temperature (°C)
            </label>
            <input
              inputMode="decimal"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="36.8"
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Weight (kg)
            </label>
            <input
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="68"
              className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Symptoms */}
        <div className="mt-5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Symptoms
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <SymptomChip
              label="Headache"
              active={symptoms.headache}
              onClick={() => toggleSymptom("headache")}
            />
            <SymptomChip
              label="Blurred vision"
              active={symptoms.blurredVision}
              onClick={() => toggleSymptom("blurredVision")}
            />
            <SymptomChip
              label="Leg swelling"
              active={symptoms.legSwelling}
              onClick={() => toggleSymptom("legSwelling")}
            />
            <SymptomChip
              label="Proteinuria"
              active={symptoms.proteinuria}
              onClick={() => toggleSymptom("proteinuria")}
            />
            <SymptomChip
              label="Epigastric pain"
              active={symptoms.epigastricPain}
              onClick={() => toggleSymptom("epigastricPain")}
            />
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                hasBP && (systolic! >= 140 || diastolic! >= 90)
                  ? "bg-red-100 text-red-700"
                  : "bg-slate-100 text-slate-500"
              }`}
              title="Derived automatically from the BP entered above"
            >
              High BP {hasBP && (systolic! >= 140 || diastolic! >= 90) ? "✓" : ""}
            </span>
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            Leg swelling is common in normal pregnancy and is shown as
            supportive context only — it does not by itself drive the
            diagnosis below.
          </p>
        </div>
      </section>

      {/* AI Analysis */}
      <section
        className={`rounded-2xl border-2 p-6 shadow-sm ${
          severityColor === "red"
            ? "border-red-300 bg-red-50"
            : severityColor === "amber"
            ? "border-amber-300 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope
              className={`h-5 w-5 ${
                severityColor === "red"
                  ? "text-red-600"
                  : severityColor === "amber"
                  ? "text-amber-600"
                  : "text-emerald-600"
              }`}
            />
            <h2 className="font-semibold text-slate-800">
              AI Clinical Assessment
            </h2>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Confidence
            </p>
            <p className="text-lg font-bold text-slate-800">{confidence}%</p>
          </div>
        </div>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Confidence reflects how many vitals/symptoms have been entered —
          not diagnostic certainty.
        </p>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Diagnosis
          </p>
          <p className="mt-1 text-xl font-bold text-slate-800">{diagnosis}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Differential Diagnosis
          </p>
          <ul className="mt-1.5 space-y-1">
            {differentials.map((d, i) => (
              <li key={i} className="text-sm text-slate-700">
                • {d}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Suggested Investigations
            </p>
            <ul className="mt-1.5 space-y-1">
              {investigations.map((inv, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-sm text-slate-700"
                >
                  <FlaskConical className="h-3.5 w-3.5 text-slate-400" />
                  {inv}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recommended Treatment
            </p>
            <ul className="mt-1.5 space-y-1">
              {treatment.map((t, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 text-sm text-slate-700"
                >
                  <Pill className="h-3.5 w-3.5 text-slate-400" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Referral Recommendation
          </p>
          <p className="mt-1 font-medium text-slate-800">{referral.text}</p>
          <p className="mt-0.5 text-sm text-slate-500">
            Reason: {referral.reason}
          </p>
        </div>

        {/* Risk meter */}
        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Maternal Risk ({riskBand.label})
            </p>
            <p className="text-sm font-bold text-slate-800">
              ~{riskBand.approx}%
            </p>
          </div>
          <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white">
            <div
              className={`h-2.5 rounded-full ${
                severityColor === "red"
                  ? "bg-red-500"
                  : severityColor === "amber"
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${riskBand.approx}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Approximate risk band based on entered criteria — not a
            validated risk-prediction score.
          </p>
        </div>
      </section>

      {/* Doctor Decision */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Doctor Decision</h2>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Diagnosis (edit)
              </label>
              <input
                value={modifiedDiagnosis ?? diagnosis}
                onChange={(e) => setModifiedDiagnosis(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Treatment plan (edit, one item per line)
              </label>
              <textarea
                value={modifiedTreatment ?? treatment.join("\n")}
                onChange={(e) => setModifiedTreatment(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => finalizeDecision(true)}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Save Modified Plan
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => finalizeDecision(true)}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Accept Recommendation
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Modify Plan
            </button>
            <button
              onClick={ignoreRecommendation}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"
            >
              <XCircle className="h-4 w-4" />
              Ignore
            </button>
          </div>
        )}

        {decisionStatus === "saving" && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving and fingerprinting…
          </p>
        )}
        {decisionStatus === "saved" && lastDecision && (
          <p className="mt-3 text-sm font-medium text-emerald-600">
            Saved as: {lastDecision.diagnosis} — recorded by{" "}
            {lastDecision.doctor}
          </p>
        )}
      </section>

      {/* BOT Chain fingerprint */}
      <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
        <div className="mb-2 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="font-semibold text-emerald-800">
            BOT Chain Fingerprint
          </h2>
        </div>
        <p className="text-sm text-emerald-700">
          A SHA-256 fingerprint of the diagnosis, treatment, referral, and
          timestamp is generated locally when a decision is saved — this is
          a real hash of the content, not a placeholder string, and works
          offline since it never leaves the device.
        </p>
        {fingerprint ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-white p-3">
            <Fingerprint className="h-4 w-4 flex-shrink-0 text-emerald-600" />
            <code className="break-all text-xs text-slate-600">
              {fingerprint}
            </code>
          </div>
        ) : (
          <p className="mt-2 text-xs text-emerald-600/70">
            No decision saved yet in this session.
          </p>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helper
// ---------------------------------------------------------------------------

function SymptomChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
        active
          ? "border-blue-400 bg-blue-100 text-blue-700"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}