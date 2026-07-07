"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { runAIAgent } from "../lib/ai/AIAgent";
import { writeJSON, STORAGE_KEYS } from "../lib/storage/storageService";
import type { AIResult } from "../lib/AICoreEngine";

export default function SymptomChecker() {
  const [symptom, setSymptom] = useState("");
  const [age, setAge] = useState("");
  const [temperature, setTemperature] = useState("");
  const [duration, setDuration] = useState("");
  const [drinking, setDrinking] = useState("");
  const [rash, setRash] = useState("");
  const [convulsions, setConvulsions] = useState("");
  const [result, setResult] = useState<AIResult | null>(null);
  const [ranAt, setRanAt] = useState("");

  function assessChild() {
    const symptoms = [symptom, rash, convulsions].filter(Boolean);

    writeJSON(STORAGE_KEYS.currentSymptoms, symptoms);

    if (temperature) {
      const vitals = { temperature: Number(temperature) };
      writeJSON(STORAGE_KEYS.vitalSigns, vitals);
    }

    const run = runAIAgent();
    setResult(run.result);
    setRanAt(new Date().toLocaleTimeString());
  }

  return (
    <div className="rounded-xl border border-[#EFE4DC] bg-[#EAF0FB] p-5">
      <h2 className="text-xl font-bold text-[#35406B]">Child Symptom Checker</h2>
      <p className="mt-2 text-sm text-[#5C4C40]">
        AI agent analyzes symptoms and triggers alerts, tasks, and referrals automatically.
      </p>

      <select
        value={symptom}
        onChange={(e) => setSymptom(e.target.value)}
        className="mt-4 w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
      >
        <option value="">Select a symptom</option>
        <option>Fever</option>
        <option>Cough</option>
        <option>Diarrhea</option>
        <option>Vomiting</option>
        <option>Difficulty Breathing</option>
        <option>Convulsions</option>
        <option>bleeding</option>
      </select>

      {symptom === "Fever" && (
        <div className="mt-5 space-y-4">
          <input
            type="text"
            placeholder="Child's age (e.g. 8 months)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
          />
          <input
            type="number"
            placeholder="Temperature (°C)"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
          />
          <input
            type="text"
            placeholder="Duration (e.g. 2 days)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
          />
          <input
            type="text"
            placeholder="Drinking/feeding normally? (yes/no)"
            value={drinking}
            onChange={(e) => setDrinking(e.target.value)}
            className="w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
          />
        </div>
      )}

      {(symptom === "Diarrhea" || symptom === "Vomiting") && (
        <input
          type="text"
          placeholder="Rash present? (yes/no)"
          value={rash}
          onChange={(e) => setRash(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
        />
      )}

      {symptom === "Convulsions" && (
        <input
          type="text"
          placeholder="Describe convulsion"
          value={convulsions}
          onChange={(e) => setConvulsions(e.target.value)}
          className="mt-4 w-full rounded-lg border border-[#EFE4DC] bg-white p-3 text-sm"
        />
      )}

      <button
        type="button"
        onClick={assessChild}
        className="mt-5 w-full rounded-xl bg-[#35406B] py-3 text-sm font-semibold text-white transition hover:bg-[#2a3359]"
      >
        Run AI assessment
      </button>

      {result ? (
        <div
          className={`mt-5 rounded-xl border p-4 ${
            result.risk === "HIGH"
              ? "border-red-200 bg-red-50"
              : result.risk === "MEDIUM"
                ? "border-amber-200 bg-amber-50"
                : "border-emerald-200 bg-emerald-50"
          }`}
        >
          <div className="flex items-center gap-2">
            {result.risk === "LOW" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            )}
            <p className="font-semibold text-[#2B2118]">
              {result.risk} risk · {result.confidence}% confidence
            </p>
          </div>
          <p className="mt-2 text-sm text-[#5C4C40]">{result.summary}</p>
          {result.alerts.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-red-800">
              {result.alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : null}
          {result.recommendations.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-[#5C4C40]">
              {result.recommendations.map((r) => (
                <li key={r}>→ {r}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-3 text-[10px] text-[#8A7A6D]">
            Agent ran at {ranAt} · {result.agentActions.length} actions planned
          </p>
        </div>
      ) : null}
    </div>
  );
}
