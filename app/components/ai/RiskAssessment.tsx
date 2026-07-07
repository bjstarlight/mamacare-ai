"use client";

import type { AIResult } from "../../lib/AICoreEngine";

type RiskAssessmentProps = {
  result?: AIResult | null;
};

export default function RiskAssessment({ result }: RiskAssessmentProps) {
  const risk = result?.risk ?? "LOW";
  const confidence = result?.confidence ?? 0;

  const width =
    risk === "HIGH" ? "85%" : risk === "MEDIUM" ? "55%" : "25%";
  const barColor =
    risk === "HIGH"
      ? "bg-red-600"
      : risk === "MEDIUM"
        ? "bg-amber-500"
        : "bg-emerald-600";
  const textColor =
    risk === "HIGH"
      ? "text-red-700"
      : risk === "MEDIUM"
        ? "text-amber-700"
        : "text-emerald-700";

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-bold text-[#2B2118]">Pregnancy Risk</h2>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-[#6B4F3D]">Current risk</p>
          <div className="mt-2 h-3 w-full rounded-full bg-[#EFE4DC]">
            <div
              className={`h-3 rounded-full transition-all ${barColor}`}
              style={{ width }}
            />
          </div>
        </div>
        <p className={`font-semibold ${textColor}`}>{risk} risk</p>
        {confidence > 0 ? (
          <p className="text-xs text-[#8A7A6D]">AI confidence: {confidence}%</p>
        ) : null}
        {result?.summary ? (
          <p className="text-xs leading-5 text-[#5C4C40]">{result.summary}</p>
        ) : null}
      </div>
    </div>
  );
}
