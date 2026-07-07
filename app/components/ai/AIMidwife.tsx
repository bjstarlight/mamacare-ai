"use client";

import { useEffect, useState } from "react";
import { runAIAgent } from "./lib/AIAgent";
import type { AIResult } from "../../lib/AICoreEngine";

import ChatWindow from "./ChatWindow";
import RiskAssessment from "./RiskAssessment";
import PregnancyInsights from "./PregnancyInsights";
import EmergencyActions from "./EmergencyActions";
import AIProactiveCare from "./AIProactiveCare";

export default function AIMidwife() {
  const [aiResult, setAIResult] = useState<AIResult | null>(null);

  useEffect(() => {
    const run = runAIAgent();
    setAIResult(run.result);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F0E8]">
      <div className="bg-[#6B2545] p-6 text-white">
        <h1 className="text-3xl font-bold">AI Midwife</h1>
        <p className="mt-1 text-white/80">Your intelligent pregnancy companion</p>

        {aiResult ? (
          <div className="mt-5 rounded-xl bg-white/15 p-4">
            <div className="flex justify-between text-sm">
              <span>Risk</span>
              <span className="font-bold">{aiResult.risk}</span>
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>AI Confidence</span>
              <span className="font-bold">{aiResult.confidence}%</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/80">{aiResult.summary}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-3 lg:p-8">
        <div className="lg:col-span-2 space-y-6">
          <ChatWindow />
          <AIProactiveCare />
        </div>

        <div className="space-y-6">
          <RiskAssessment result={aiResult} />
          <PregnancyInsights />
          <EmergencyActions />

          {aiResult && aiResult.tasks.length > 0 ? (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-[#2B2118]">Agent tasks</h2>
              <ul className="space-y-2">
                {aiResult.tasks.map((task) => (
                  <li
                    key={task.id}
                    className="rounded-lg border border-[#EFE4DC] bg-[#FFF9F4] px-3 py-2 text-sm text-[#5C4C40]"
                  >
                    {task.title}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {aiResult && aiResult.recommendations.length > 0 ? (
            <div className="rounded-xl bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-lg font-bold text-[#2B2118]">AI Recommendations</h2>
              <ul className="space-y-2">
                {aiResult.recommendations.map((item) => (
                  <li key={item} className="text-sm text-[#5C4C40]">
                    • {item}
                  </li>
                ))}
              </ul>

              {aiResult.alerts.length > 0 ? (
                <>
                  <h2 className="mt-5 font-bold text-red-600">Alerts</h2>
                  <ul className="mt-2 space-y-2">
                    {aiResult.alerts.map((item) => (
                      <li key={item} className="text-sm text-red-600">
                        ⚠️ {item}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
