"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Scale,
  Ruler,
  Brain,
  Hand,
  Calendar,
  Bot,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ShieldCheck,
  Info,
} from "lucide-react";

/**
 * GrowthTracker
 * -----------------------------------------------------------------------
 * WHO-Child-Growth-Standards-informed growth checker: weight, length,
 * head circumference, and MUAC, all assessed for the child's actual age
 * (and, where it matters, sex) instead of one fixed threshold applied
 * to every age.
 *
 * Honesty notes:
 * - Head-circumference-for-age uses real WHO LMS checkpoint values
 *   (L=1 for this indicator, so Z = (X/M − 1) / S) with linear
 *   interpolation between checkpoints. This is a genuine z-score against
 *   published WHO parameters, not a fabricated number — but it's still
 *   an interpolated approximation between checkpoints, not the exact
 *   daily WHO calculation. For a clinical percentile, use an official
 *   WHO/CDC growth chart tool or a pediatrician.
 * - Weight-for-age and length-for-age use a simpler "% deviation from
 *   the WHO median for this age and sex" band, because reliable SD data
 *   for every age wasn't available to verify — a coarser, clearly
 *   labeled check beats a precise-looking number I can't stand behind.
 * - MUAC uses the standard WHO/UNICEF community screening cutoffs
 *   (11.5cm / 12.5cm), which are simple, fixed, and well established —
 *   these don't vary by age within the 6–59 month band they're
 *   validated for.
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Sex = "male" | "female";
type Status = "concern" | "monitor" | "normal" | "unknown";

interface MetricResult {
  status: Status;
  label: string;
  detail: string;
}

interface GrowthRecord {
  date: string;
  ageMonths: number;
  sex: Sex | null;
  weight: number;
  height: number;
  headCircumference: number;
  muac: number | null;
  weightResult: MetricResult;
  heightResult: MetricResult;
  headResult: MetricResult;
  muacResult: MetricResult | null;
  overall: MetricResult;
}

interface BabyProfile {
  gender?: string;
  estimatedGender?: string;
}

// ---------------------------------------------------------------------------
// WHO reference checkpoints (months → value), boys/girls.
// Sourced from WHO Child Growth Standards published tables and
// cross-checked medians; see file header for what's verified vs.
// interpolated. Values between checkpoints are linearly interpolated.
// ---------------------------------------------------------------------------

const AGE_CHECKPOINTS = [0, 6, 12, 18, 24, 36, 48, 60]; // months

const WEIGHT_MEDIAN_KG = {
  male: [3.3, 7.9, 9.6, 10.9, 12.2, 14.3, 16.3, 18.3],
  female: [3.2, 7.3, 8.9, 10.2, 11.5, 13.9, 16.1, 18.2],
};

const LENGTH_MEDIAN_CM = {
  male: [49.9, 67.6, 75.7, 82.3, 87.1, 96.1, 103.3, 109.2],
  female: [49.1, 65.7, 74.0, 80.7, 85.7, 95.1, 102.7, 108.4],
};

// Head circumference: M = median cm, S = WHO coefficient of variation.
// L = 1 for this indicator, so Z = (X / M − 1) / S.
// Verified anchors (from WHO's own LMS tables): 6/18/24/25/30/48mo boys;
// 24/25mo girls. Others are smooth interpolation consistent with those
// anchors and widely corroborated secondary medians — see file header.
const HEAD_CIRCUMFERENCE_M_CM = {
  male: [34.5, 43.3, 46.1, 47.4, 48.25, 49.5, 50.2, 50.9],
  female: [33.9, 42.2, 45.0, 46.2, 47.18, 48.4, 49.0, 49.6],
};

const HEAD_CIRCUMFERENCE_S = {
  male: [0.032, 0.0282, 0.0283, 0.028, 0.0282, 0.0287, 0.0291, 0.0295],
  female: [0.033, 0.0295, 0.0296, 0.0294, 0.02957, 0.0298, 0.0299, 0.03],
};

// WHO/UNICEF MUAC screening cutoffs — validated for ages 6–59 months.
const MUAC_SEVERE_CM = 11.5;
const MUAC_MODERATE_CM = 12.5;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function interpolate(ageMonths: number, series: number[]): number {
  const clamped = Math.max(
    AGE_CHECKPOINTS[0],
    Math.min(ageMonths, AGE_CHECKPOINTS[AGE_CHECKPOINTS.length - 1])
  );
  for (let i = 0; i < AGE_CHECKPOINTS.length - 1; i++) {
    const a = AGE_CHECKPOINTS[i];
    const b = AGE_CHECKPOINTS[i + 1];
    if (clamped >= a && clamped <= b) {
      const t = (clamped - a) / (b - a);
      return series[i] + t * (series[i + 1] - series[i]);
    }
  }
  return series[series.length - 1];
}

function computeAgeInMonths(dobIso: string): number {
  const dob = new Date(dobIso);
  const now = new Date();
  const days = (now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24);
  return Math.max(0, days / 30.4375);
}

function classifyByDeviation(
  value: number,
  median: number,
  metricLabel: string
): MetricResult {
  const deviationPct = ((value - median) / median) * 100;
  if (deviationPct <= -15) {
    return {
      status: "concern",
      label: `Below expected ${metricLabel} for age`,
      detail: `${Math.abs(deviationPct).toFixed(0)}% below the WHO median (${median.toFixed(1)}) for this age/sex.`,
    };
  }
  if (deviationPct <= -7) {
    return {
      status: "monitor",
      label: `Slightly below expected ${metricLabel}`,
      detail: `${Math.abs(deviationPct).toFixed(0)}% below the WHO median (${median.toFixed(1)}) for this age/sex.`,
    };
  }
  if (deviationPct >= 20) {
    return {
      status: "concern",
      label: `Above expected ${metricLabel} for age`,
      detail: `${deviationPct.toFixed(0)}% above the WHO median (${median.toFixed(1)}) for this age/sex.`,
    };
  }
  if (deviationPct >= 10) {
    return {
      status: "monitor",
      label: `Slightly above expected ${metricLabel}`,
      detail: `${deviationPct.toFixed(0)}% above the WHO median (${median.toFixed(1)}) for this age/sex.`,
    };
  }
  return {
    status: "normal",
    label: `Within expected ${metricLabel} range`,
    detail: `Close to the WHO median (${median.toFixed(1)}) for this age/sex.`,
  };
}

function classifyHeadCircumference(
  value: number,
  ageMonths: number,
  sex: Sex
): MetricResult {
  const m = interpolate(ageMonths, HEAD_CIRCUMFERENCE_M_CM[sex]);
  const s = interpolate(ageMonths, HEAD_CIRCUMFERENCE_S[sex]);
  const z = (value / m - 1) / s;

  if (z <= -2) {
    return {
      status: "concern",
      label: "Below WHO head-circumference range (possible microcephaly)",
      detail: `Z ≈ ${z.toFixed(2)} against a WHO median of ${m.toFixed(1)} cm for this age/sex — below the −2 SD screening threshold.`,
    };
  }
  if (z >= 2) {
    return {
      status: "concern",
      label: "Above WHO head-circumference range (possible macrocephaly)",
      detail: `Z ≈ ${z.toFixed(2)} against a WHO median of ${m.toFixed(1)} cm for this age/sex — above the +2 SD screening threshold.`,
    };
  }
  if (Math.abs(z) >= 1) {
    return {
      status: "monitor",
      label: "At the edge of the typical WHO range",
      detail: `Z ≈ ${z.toFixed(2)} against a WHO median of ${m.toFixed(1)} cm for this age/sex. Worth tracking the trend.`,
    };
  }
  return {
    status: "normal",
    label: "Within typical WHO range",
    detail: `Z ≈ ${z.toFixed(2)} against a WHO median of ${m.toFixed(1)} cm for this age/sex.`,
  };
}

function classifyMUAC(value: number, ageMonths: number): MetricResult | null {
  if (ageMonths < 6 || ageMonths > 59) {
    return null;
  }
  if (value < MUAC_SEVERE_CM) {
    return {
      status: "concern",
      label: "Severe Acute Malnutrition (SAM) range",
      detail: `MUAC ${value.toFixed(1)} cm is below the WHO ${MUAC_SEVERE_CM} cm severe-wasting cutoff — urgent referral for treatment.`,
    };
  }
  if (value < MUAC_MODERATE_CM) {
    return {
      status: "monitor",
      label: "Moderate Acute Malnutrition (MAM) range",
      detail: `MUAC ${value.toFixed(1)} cm is between the WHO ${MUAC_SEVERE_CM}–${MUAC_MODERATE_CM} cm moderate-wasting band — nutritional support and follow-up recommended.`,
    };
  }
  return {
    status: "normal",
    label: "No acute malnutrition detected by MUAC",
    detail: `MUAC ${value.toFixed(1)} cm is at or above the WHO ${MUAC_MODERATE_CM} cm cutoff for this screening.`,
  };
}

const SEVERITY_RANK: Record<Status, number> = {
  concern: 3,
  monitor: 2,
  normal: 1,
  unknown: 0,
};

function combineOverall(results: (MetricResult | null)[]): MetricResult {
  const present = results.filter((r): r is MetricResult => r !== null);
  if (present.length === 0) {
    return { status: "unknown", label: "Not enough data", detail: "" };
  }
  const worst = present.reduce((a, b) =>
    SEVERITY_RANK[b.status] > SEVERITY_RANK[a.status] ? b : a
  );
  const concernCount = present.filter((r) => r.status === "concern").length;
  const monitorCount = present.filter((r) => r.status === "monitor").length;

  if (worst.status === "concern") {
    return {
      status: "concern",
      label: `${concernCount} measurement${concernCount > 1 ? "s" : ""} outside the expected WHO range`,
      detail: "Recommend pediatric review.",
    };
  }
  if (worst.status === "monitor") {
    return {
      status: "monitor",
      label: `${monitorCount} measurement${monitorCount > 1 ? "s" : ""} at the edge of the expected range`,
      detail: "Worth monitoring at the next visit.",
    };
  }
  return {
    status: "normal",
    label: "All measurements within expected WHO ranges",
    detail: "",
  };
}

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function normalizeSex(raw?: string): Sex | null {
  if (!raw) return null;
  const v = raw.toLowerCase();
  if (v.startsWith("m") || v === "boy") return "male";
  if (v.startsWith("f") || v === "girl") return "female";
  return null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GrowthTracker() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");
  const [muac, setMuac] = useState("");
  const [ageMonthsInput, setAgeMonthsInput] = useState("");
  const [sex, setSex] = useState<Sex | null>(null);
  const [dobAutofilled, setDobAutofilled] = useState(false);

  const [records, setRecords] = useState<GrowthRecord[]>([]);

  useEffect(() => {
    const saved = readJSON<GrowthRecord[]>("babyGrowth") ?? [];
    setRecords(saved);

    const dob = window.localStorage.getItem("babyDOB");
    if (dob) {
      setAgeMonthsInput(computeAgeInMonths(dob).toFixed(1));
      setDobAutofilled(true);
    }

    const profile = readJSON<BabyProfile>("babyProfile");
    const normalized = normalizeSex(profile?.gender ?? profile?.estimatedGender);
    if (normalized) setSex(normalized);
  }, []);

  const ageMonths = ageMonthsInput ? Number(ageMonthsInput) : null;
  const canAssess =
    ageMonths != null && !Number.isNaN(ageMonths) && sex != null;

  const preview = useMemo(() => {
    if (!canAssess || ageMonths == null || !sex) return null;
    const w = Number(weight);
    const h = Number(height);
    const hc = Number(head);
    const m = muac ? Number(muac) : null;

    const weightResult = weight
      ? classifyByDeviation(w, interpolate(ageMonths, WEIGHT_MEDIAN_KG[sex]), "weight")
      : null;
    const heightResult = height
      ? classifyByDeviation(h, interpolate(ageMonths, LENGTH_MEDIAN_CM[sex]), "length/height")
      : null;
    const headResult = head ? classifyHeadCircumference(hc, ageMonths, sex) : null;
    const muacResult = m != null ? classifyMUAC(m, ageMonths) : null;

    return { weightResult, heightResult, headResult, muacResult };
  }, [canAssess, ageMonths, sex, weight, height, head, muac]);

  function saveGrowth() {
    if (!canAssess || ageMonths == null || !sex) return;

    const w = Number(weight);
    const h = Number(height);
    const hc = Number(head);
    const m = muac ? Number(muac) : null;

    const weightResult = classifyByDeviation(
      w,
      interpolate(ageMonths, WEIGHT_MEDIAN_KG[sex]),
      "weight"
    );
    const heightResult = classifyByDeviation(
      h,
      interpolate(ageMonths, LENGTH_MEDIAN_CM[sex]),
      "length/height"
    );
    const headResult = classifyHeadCircumference(hc, ageMonths, sex);
    const muacResult = m != null ? classifyMUAC(m, ageMonths) : null;
    const overall = combineOverall([weightResult, heightResult, headResult, muacResult]);

    const record: GrowthRecord = {
      date: new Date().toLocaleDateString(),
      ageMonths,
      sex,
      weight: w,
      height: h,
      headCircumference: hc,
      muac: m,
      weightResult,
      heightResult,
      headResult,
      muacResult,
      overall,
    };

    const updated = [...records, record];
    window.localStorage.setItem("babyGrowth", JSON.stringify(updated));
    window.localStorage.setItem("latestGrowthAnalysis", JSON.stringify(overall));

    const logs = readJSON<Record<string, unknown>[]>("blockchainLogs") ?? [];
    logs.push({
      id: crypto.randomUUID(),
      type: "BABY_GROWTH_UPDATED",
      ageMonths,
      sex,
      weight: w,
      height: h,
      headCircumference: hc,
      muac: m,
      overall,
      timestamp: new Date().toISOString(),
    });
    window.localStorage.setItem("blockchainLogs", JSON.stringify(logs));

    setRecords(updated);
    setWeight("");
    setHeight("");
    setHead("");
    setMuac("");
  }

  return (
    <div className="rounded-xl border border-[#EFE4DC] bg-white p-5">
      <div className="flex items-center gap-2">
        <Bot className="h-5 w-5 text-[#6B2545]" />
        <h2 className="text-xl font-bold text-[#2B2118]">
          AI Growth Checker
        </h2>
      </div>
      <p className="mt-1 text-xs text-[#8a7a6d]">
        Assessed against WHO Child Growth Standards for this child's age
        and sex — not a fixed threshold applied to every age.
      </p>

      {/* Age + sex — required for any of this to mean anything */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            <Calendar className="h-3.5 w-3.5" />
            Age (months)
          </label>
          <input
            className="mt-1 w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="e.g. 9"
            value={ageMonthsInput}
            onChange={(e) => {
              setAgeMonthsInput(e.target.value);
              setDobAutofilled(false);
            }}
          />
          {dobAutofilled && (
            <p className="mt-1 text-[11px] text-[#a89887]">
              Auto-filled from the baby's date of birth.
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            Sex
          </label>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => setSex("male")}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium ${
                sex === "male"
                  ? "border-[#B5533F] bg-[#FFF3E9] text-[#6B2545]"
                  : "border-[#EFE4DC] text-[#8a7a6d] hover:bg-[#FFF9F4]"
              }`}
            >
              Boy
            </button>
            <button
              onClick={() => setSex("female")}
              className={`flex-1 rounded-lg border p-3 text-sm font-medium ${
                sex === "female"
                  ? "border-[#B5533F] bg-[#FFF3E9] text-[#6B2545]"
                  : "border-[#EFE4DC] text-[#8a7a6d] hover:bg-[#FFF9F4]"
              }`}
            >
              Girl
            </button>
          </div>
        </div>
      </div>
      {!canAssess && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-700">
          <Info className="h-3.5 w-3.5" />
          Enter age and sex to get a WHO-referenced assessment — growth
          can't be judged without knowing how old the child is.
        </p>
      )}

      {/* Measurements */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MeasurementField
          icon={Scale}
          label="Weight (kg)"
          value={weight}
          onChange={setWeight}
          result={preview?.weightResult}
        />
        <MeasurementField
          icon={Ruler}
          label="Length/Height (cm)"
          value={height}
          onChange={setHeight}
          result={preview?.heightResult}
        />
        <MeasurementField
          icon={Brain}
          label="Head Circumference (cm)"
          value={head}
          onChange={setHead}
          result={preview?.headResult}
        />
        <MeasurementField
          icon={Hand}
          label="MUAC (cm) — optional, ages 6–59mo"
          value={muac}
          onChange={setMuac}
          result={preview?.muacResult}
        />
      </div>

      <button
        onClick={saveGrowth}
        disabled={!canAssess || !weight || !height || !head}
        className="mt-4 rounded-lg bg-[#6B2545] px-5 py-3 text-white hover:bg-[#7A2E52] disabled:cursor-not-allowed disabled:bg-[#EFE4DC] disabled:text-[#a89887]"
      >
        Save Growth Record
      </button>

      {/* Growth history */}
      <div className="mt-6">
        <h3 className="font-bold text-[#2B2118]">Growth History</h3>
        {records.length === 0 && (
          <p className="mt-2 text-sm text-[#a89887]">
            No growth records saved yet.
          </p>
        )}
        <div className="space-y-3">
          {records
            .slice()
            .reverse()
            .map((record, index) => (
              <div
                key={index}
                className="rounded-lg border border-[#EFE4DC] p-3"
              >
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-sm text-[#8a7a6d]">
                    <Calendar className="h-3.5 w-3.5" />
                    {record.date} · {record.ageMonths.toFixed(1)} months
                    {record.sex ? ` · ${record.sex === "male" ? "Boy" : "Girl"}` : ""}
                  </p>
                  <StatusBadge result={record.overall} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-[#2B2118] sm:grid-cols-4">
                  <p>{record.weight} kg</p>
                  <p>{record.height} cm</p>
                  <p>{record.headCircumference} cm HC</p>
                  <p>{record.muac != null ? `${record.muac} cm MUAC` : "MUAC —"}</p>
                </div>
                <p className="mt-1 text-xs text-[#8a7a6d]">
                  {record.overall.label}
                </p>
              </div>
            ))}
        </div>
      </div>

      <p className="mt-5 flex items-start gap-1.5 text-[11px] text-[#a89887]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        This assessment interpolates between published WHO checkpoint
        values and is meant to flag patterns worth a closer look — it
        isn't a diagnosis and doesn't replace a pediatrician or an
        official WHO/CDC growth chart tool.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function MeasurementField({
  icon: Icon,
  label,
  value,
  onChange,
  result,
}: {
  icon: typeof Scale;
  label: string;
  value: string;
  onChange: (v: string) => void;
  result?: MetricResult | null;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </label>
      <input
        className="mt-1 w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {result && (
        <p
          className={`mt-1 text-xs ${
            result.status === "concern"
              ? "text-red-600"
              : result.status === "monitor"
              ? "text-amber-700"
              : "text-emerald-700"
          }`}
        >
          {result.label}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ result }: { result: MetricResult }) {
  const styles =
    result.status === "concern"
      ? "bg-red-100 text-red-700"
      : result.status === "monitor"
      ? "bg-amber-100 text-amber-700"
      : result.status === "normal"
      ? "bg-emerald-100 text-emerald-700"
      : "bg-[#EFE4DC] text-[#8a7a6d]";
  const Icon =
    result.status === "concern"
      ? AlertTriangle
      : result.status === "monitor"
      ? AlertCircle
      : CheckCircle2;
  return (
    <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      <Icon className="h-3.5 w-3.5" />
      {result.status === "concern"
        ? "Review"
        : result.status === "monitor"
        ? "Monitor"
        : result.status === "normal"
        ? "Normal"
        : "Unknown"}
    </span>
  );
}
