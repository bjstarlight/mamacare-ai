"use client";

import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import type { WorkflowStep } from "../../config/productFlow";

type WorkflowStepperProps = {
  steps: WorkflowStep[];
  completedStepIds: string[];
  currentStepId: string | null;
  progressPercent: number;
  onStepClick?: (step: WorkflowStep) => void;
  title?: string;
  eyebrow?: string;
};

export default function WorkflowStepper({
  steps,
  completedStepIds,
  currentStepId,
  progressPercent,
  onStepClick,
  title = "Guided Workflow",
  eyebrow = "First visit",
}: WorkflowStepperProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B5533F]">
            {eyebrow}
          </p>
          <h3 className="text-lg font-semibold text-[#2B2118]">{title}</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-[#6B2545]">{progressPercent}%</p>
          <p className="text-xs text-[#8A7A6D]">complete</p>
        </div>
      </div>

      <div className="h-2 w-full rounded-full bg-[#EFE4DC]">
        <div
          className="h-2 rounded-full bg-[#6B2545] transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, index) => {
          const done = completedStepIds.includes(step.id);
          const current = step.id === currentStepId;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick?.(step)}
              className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${
                current
                  ? "border-[#6B2545] bg-[#FFF3E9] ring-1 ring-[#6B2545]/20"
                  : done
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-[#EFE4DC] bg-[#FFF9F4] hover:border-[#D4C4B8]"
              }`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? "bg-emerald-600 text-white"
                    : current
                      ? "bg-[#6B2545] text-white"
                      : "bg-[#EFE4DC] text-[#6B4F3D]"
                }`}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#4A3D33]">{step.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#8A7A6D]">
                  {step.description}
                </p>
                {current && onStepClick ? (
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#6B2545]">
                    Continue <ArrowRight className="h-3 w-3" />
                  </span>
                ) : null}
              </div>
              {!done && !current ? (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#D4C4B8]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
