"use client";

import { useEffect, useState } from "react";
import { Bot, RefreshCw, Sparkles } from "lucide-react";
import type { AgentRun } from "../../lib/ai/AIAgent";
import { runAIAgent } from "../../lib/ai/AIAgent";
import ModuleSection from "../layout/ModuleSection";

type AIAutomationFeedProps = {
  lastRun?: AgentRun | null;
  onRefresh?: () => void;
  autoRun?: boolean;
  onNavigate?: (section: string) => void;
};

const ACTION_COLORS: Record<string, string> = {
  notification: "bg-amber-50 border-amber-200",
  doctor_alert: "bg-slate-50 border-slate-200",
  emergency_referral: "bg-red-50 border-red-200",
  ambulance_dispatch: "bg-orange-50 border-orange-200",
  dashboard_update: "bg-emerald-50 border-emerald-200",
  health_score: "bg-emerald-50 border-emerald-200",
  task: "bg-violet-50 border-violet-200",
  navigate: "bg-blue-50 border-blue-200",
  ai_message: "bg-pink-50 border-pink-200",
};

export default function AIAutomationFeed({
  lastRun,
  onRefresh,
  autoRun = true,
  onNavigate,
}: AIAutomationFeedProps) {
  const [run, setRun] = useState<AgentRun | null>(lastRun ?? null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (lastRun) setRun(lastRun);
  }, [lastRun]);

  useEffect(() => {
    if (!autoRun) return;
    const timer = window.setTimeout(() => handleRefresh(), 500);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  function handleRefresh() {
    setRunning(true);
    try {
      const result = runAIAgent();
      setRun(result);
      onRefresh?.();
    } finally {
      setRunning(false);
    }
  }

  const result = run?.result;

  return (
    <ModuleSection
      title="AI Agent"
      eyebrow="Automation brain"
      description="Continuously monitors profiles, vitals, symptoms, vaccines, and emergencies — then acts across notifications, referrals, doctor alerts, and your dashboard."
      icon={Bot}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 text-sm text-[#5C4C40]">
          {result ? (
            <>
              <p>
                <span className="font-semibold text-[#2B2118]">Status: </span>
                <span
                  className={
                    result.risk === "HIGH"
                      ? "font-semibold text-red-600"
                      : result.risk === "MEDIUM"
                        ? "font-semibold text-amber-600"
                        : "font-semibold text-emerald-600"
                  }
                >
                  {result.risk} risk
                </span>
                {" · "}
                Health score{" "}
                <span className="font-semibold">{run?.snapshot.healthScore}</span>
              </p>
              <p className="text-xs leading-5 text-[#6B4F3D]">{result.summary}</p>
              {result.focusAreas.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.focusAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full bg-[#FFF3E9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6B2545]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            "Agent waiting for first analysis run…"
          )}
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={running}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#EFE4DC] bg-white px-3 py-2 text-xs font-semibold text-[#6B2545] transition hover:bg-[#FFF3E9] disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${running ? "animate-spin" : ""}`} />
          Run agent
        </button>
      </div>

      {run?.snapshot.growthPrediction ? (
        <p className="mt-3 rounded-xl bg-[#FFF9F4] p-3 text-xs leading-5 text-[#5C4C40]">
          <span className="font-semibold text-[#2B2118]">Growth: </span>
          {run.snapshot.growthPrediction}
        </p>
      ) : null}

      {result && result.tasks.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-[#8A7A6D]">
            <Sparkles className="h-3.5 w-3.5" />
            Agent tasks
          </p>
          <ul className="space-y-2">
            {result.tasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => onNavigate?.(task.section)}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs transition hover:opacity-90 ${
                    task.urgent
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-[#EFE4DC] bg-white text-[#4A3D33]"
                  }`}
                >
                  <span>{task.title}</span>
                  <span className="text-[10px] font-semibold uppercase opacity-60">
                    {task.section}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {run && run.executedActions.filter((a) => a.executed).length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8A7A6D]">
            Actions taken
          </p>
          <ul className="space-y-2">
            {run.executedActions
              .filter((a) => a.executed)
              .map((action, i) => (
                <li
                  key={`${action.type}-${i}`}
                  className={`rounded-lg border px-3 py-2 text-xs ${
                    ACTION_COLORS[action.type] ?? "bg-white border-[#EFE4DC]"
                  }`}
                >
                  <span className="font-semibold text-[#2B2118]">{action.label}</span>
                  <span className="text-[#5C4C40]"> — {action.detail}</span>
                </li>
              ))}
          </ul>
        </div>
      ) : null}
    </ModuleSection>
  );
}
