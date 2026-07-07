"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Activity, ShieldCheck, Sparkles } from "lucide-react";

type PredictionState = {
  systolic: string;
  diastolic: string;
  gestationalAge: string;
  previousPregnancies: string;
  previousCSections: string;
  bleeding: boolean;
  swelling: boolean;
  reducedFetalMovement: boolean;
  temperature: string;
  bloodSugar: string;
  hemoglobin: string;
  symptoms: string;
};

const initialState: PredictionState = {
  systolic: "",
  diastolic: "",
  gestationalAge: "",
  previousPregnancies: "",
  previousCSections: "",
  bleeding: false,
  swelling: false,
  reducedFetalMovement: false,
  temperature: "",
  bloodSugar: "",
  hemoglobin: "",
  symptoms: "headache, swelling",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function AIMaternalRiskPrediction() {
  const [form, setForm] = useState<PredictionState>(initialState);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedDraft = window.localStorage.getItem("aiMaternalRiskDraft");
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft) as Partial<PredictionState>;
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }

    const savedWeek = window.localStorage.getItem("pregnancyWeek");
    if (savedWeek) {
      setForm((prev) => ({ ...prev, gestationalAge: savedWeek }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("aiMaternalRiskDraft", JSON.stringify(form));
  }, [form]);

  const analysis = useMemo(() => {
    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    const week = Number(form.gestationalAge);
    const previousPregnancies = Number(form.previousPregnancies);
    const previousCSections = Number(form.previousCSections);
    const temperature = Number(form.temperature);
    const bloodSugar = Number(form.bloodSugar);
    const hemoglobin = Number(form.hemoglobin);
    const symptomList = form.symptoms
      .toLowerCase()
      .split(/[,;\n]/)
      .map((item) => item.trim())
      .filter(Boolean);

    let score = 18;

    if (!Number.isNaN(systolic) && !Number.isNaN(diastolic)) {
      if (systolic >= 140 || diastolic >= 90) {
        score += 28;
      } else if (systolic >= 130 || diastolic >= 80) {
        score += 12;
      }

      if (systolic >= 160 || diastolic >= 110) {
        score += 16;
      }
    }

    if (!Number.isNaN(week)) {
      if (week >= 34 && week <= 36) {
        score += 8;
      } else if (week >= 37) {
        score += 6;
      }
    }

    if (previousPregnancies > 2) score += 6;
    if (previousCSections > 0) score += 10;
    if (form.bleeding) score += 20;
    if (form.swelling) score += 12;
    if (form.reducedFetalMovement) score += 15;
    if (!Number.isNaN(temperature) && temperature > 38) score += 10;
    if (!Number.isNaN(bloodSugar) && bloodSugar > 140) score += 12;
    if (!Number.isNaN(hemoglobin) && hemoglobin < 10.5) score += 12;

    if (symptomList.some((entry) => ["headache", "blurred vision", "epigastric", "vision"].includes(entry))) {
      score += 10;
    }
    if (symptomList.some((entry) => ["vomiting", "dizziness", "shortness of breath"].includes(entry))) {
      score += 6;
    }

    const normalizedScore = clamp(score, 8, 95);
    const riskLevel = normalizedScore >= 75 ? "High" : normalizedScore >= 45 ? "Moderate" : "Low";

    const preeclampsia = clamp(
      30 + (form.swelling ? 18 : 0) + (form.bleeding ? 6 : 0) + (systolic >= 140 || diastolic >= 90 ? 24 : 0),
      20,
      92
    );
    const pretermLabour = clamp(
      20 + (form.bleeding ? 20 : 0) + (form.reducedFetalMovement ? 8 : 0) + (week < 34 ? 16 : 0),
      18,
      84
    );
    const gestationalDiabetes = clamp(
      18 + (bloodSugar > 140 ? 24 : 0) + (previousPregnancies > 2 ? 8 : 0),
      12,
      78
    );
    const anemia = clamp(20 + (hemoglobin < 10.5 ? 32 : 0), 14, 80);

    let recommendation = "Monitor closely and keep routine prenatal follow-up.";
    if (normalizedScore >= 80) {
      recommendation = "Refer to an obstetrician within 24 hours and consider urgent hospital assessment.";
    } else if (normalizedScore >= 60) {
      recommendation = "Book an urgent clinician review within 24 hours.";
    } else if (normalizedScore >= 35) {
      recommendation = "Continue monitoring and schedule a prompt antenatal review.";
    }

    return {
      score: normalizedScore,
      riskLevel,
      preeclampsia,
      pretermLabour,
      gestationalDiabetes,
      anemia,
      recommendation,
    };
  }, [form]);

  const updateField = (field: keyof PredictionState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section className="rounded-[2rem] border border-[#E9D7CE] bg-white p-6 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#6B2545]">AI Maternal Risk Prediction Center</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-[#2B2118]">Live maternal risk analysis</h2>
          <p className="mt-2 max-w-2xl text-sm text-[#8a7a6d]">
            This panel combines BP, gestational age, symptoms, history, and lab values to surface urgent care needs in a simple, explainable way.
          </p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Demonstration AI
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-4 rounded-3xl border border-[#F0E3DA] bg-[#FFF9F4] p-4 sm:p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Blood Pressure (systolic)</span>
              <input
                type="number"
                value={form.systolic}
                onChange={(event) => updateField("systolic", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="120"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Blood Pressure (diastolic)</span>
              <input
                type="number"
                value={form.diastolic}
                onChange={(event) => updateField("diastolic", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="80"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Gestational age (weeks)</span>
              <input
                type="number"
                value={form.gestationalAge}
                onChange={(event) => updateField("gestationalAge", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="32"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Previous pregnancies</span>
              <input
                type="number"
                value={form.previousPregnancies}
                onChange={(event) => updateField("previousPregnancies", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="2"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Previous C-sections</span>
              <input
                type="number"
                value={form.previousCSections}
                onChange={(event) => updateField("previousCSections", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="0"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Temperature (°C)</span>
              <input
                type="number"
                step="0.1"
                value={form.temperature}
                onChange={(event) => updateField("temperature", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="37.2"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Blood sugar (mg/dL)</span>
              <input
                type="number"
                value={form.bloodSugar}
                onChange={(event) => updateField("bloodSugar", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="95"
              />
            </label>
            <label className="text-sm text-[#4a3d33]">
              <span className="mb-1 block font-medium">Hemoglobin (g/dL)</span>
              <input
                type="number"
                step="0.1"
                value={form.hemoglobin}
                onChange={(event) => updateField("hemoglobin", event.target.value)}
                className="w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
                placeholder="11.2"
              />
            </label>
          </div>

          <label className="text-sm text-[#4a3d33]">
            <span className="mb-1 block font-medium">Symptoms and notes</span>
            <textarea
              value={form.symptoms}
              onChange={(event) => updateField("symptoms", event.target.value)}
              className="min-h-24 w-full rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 outline-none focus:border-[#6B2545]"
              placeholder="headache, dizziness, blurred vision"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["bleeding", "Bleeding"],
              ["swelling", "Swelling"],
              ["reducedFetalMovement", "Reduced fetal movement"],
            ].map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 rounded-xl border border-[#E9D7CE] bg-white px-3 py-2 text-sm text-[#4a3d33]">
                <input
                  type="checkbox"
                  checked={Boolean(form[field as keyof PredictionState])}
                  onChange={(event) => updateField(field as keyof PredictionState, event.target.checked)}
                  className="h-4 w-4 rounded border-[#E9D7CE] text-[#6B2545] focus:ring-[#6B2545]"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-[#E9D7CE] bg-slate-950 p-5 text-slate-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">AI Pregnancy Risk Score</p>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Overall Risk</p>
                <p className="mt-2 text-4xl font-semibold text-white">{analysis.score}%</p>
              </div>
              <div className={`rounded-full px-3 py-1 text-sm font-semibold ${analysis.riskLevel === "High" ? "bg-rose-500/15 text-rose-200" : analysis.riskLevel === "Moderate" ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200"}`}>
                {analysis.riskLevel}
              </div>
            </div>

            <div className="mt-4 h-2 rounded-full bg-slate-800">
              <div
                className={`h-2 rounded-full ${analysis.riskLevel === "High" ? "bg-rose-500" : analysis.riskLevel === "Moderate" ? "bg-amber-500" : "bg-emerald-500"}`}
                style={{ width: `${analysis.score}%` }}
              />
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
                <Activity className="h-4 w-4" />
                High probability of:
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>• Preeclampsia — {analysis.preeclampsia.toFixed(0)}%</li>
                <li>• Preterm labour — {analysis.pretermLabour.toFixed(0)}%</li>
                <li>• Gestational diabetes — {analysis.gestationalDiabetes.toFixed(0)}%</li>
                <li>• Anaemia — {analysis.anemia.toFixed(0)}%</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                <AlertTriangle className="h-4 w-4" />
                Recommendation
              </div>
              <p className="mt-2 text-sm text-amber-50">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
