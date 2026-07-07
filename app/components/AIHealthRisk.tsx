"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { runAIAgent } from "../lib/ai/AIAgent";
import type { AIResult } from "../lib/AICoreEngine";

export default function AIHealthRisk() {
  const [agentResult, setAgentResult] = useState<AIResult | null>(null);
  const [geminiNote, setGeminiNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function analyzeRisk() {
    setLoading(true);
    try {
      const run = runAIAgent();
      setAgentResult(run.result);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Based on risk level ${run.result.risk}, alerts: ${run.result.alerts.join("; ") || "none"}, and recommendations: ${run.result.recommendations.join("; ") || "none"}, provide a brief clinical summary for the mother in 3 sentences.`,
          pregnancyWeek: run.context.pregnancyWeek,
          motherName: run.context.motherName,
        }),
      });
      const data = await res.json();
      setGeminiNote(data.reply ?? "");
    } catch {
      setGeminiNote("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <h2 className="text-xl font-bold text-red-700">AI Health Risk Assessment</h2>
      </div>

      <p className="mt-2 text-sm text-red-900/80">
        AI agent evaluates vitals, symptoms, profiles, and care gaps — then triggers
        alerts, referrals, and dashboard updates automatically.
      </p>

      <button
        type="button"
        onClick={analyzeRisk}
        disabled={loading}
        className="mt-5 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Analyzing…" : "Run AI risk analysis"}
      </button>

      {agentResult ? (
        <div className="mt-6 space-y-4 rounded-xl border border-red-100 bg-white p-5">
          <p className="text-sm font-semibold text-[#2B2118]">
            {agentResult.risk} risk · {agentResult.confidence}% confidence
          </p>
          <p className="text-sm text-[#5C4C40]">{agentResult.summary}</p>
          {agentResult.alerts.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-red-700">
              {agentResult.alerts.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          ) : null}
          {geminiNote ? (
            <p className="border-t border-[#EFE4DC] pt-4 text-sm leading-6 text-[#5C4C40] whitespace-pre-wrap">
              {geminiNote}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
