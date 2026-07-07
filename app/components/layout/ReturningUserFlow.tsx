"use client";

import { ArrowRight } from "lucide-react";
import type { ReturningFlowItem } from "../../config/productFlow";

type ReturningUserFlowProps = {
  steps: ReturningFlowItem[];
  onNavigate: (section: ReturningFlowItem["section"]) => void;
};

export default function ReturningUserFlow({
  steps,
  onNavigate,
}: ReturningUserFlowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <button
          key={step.id}
          type="button"
          onClick={() => onNavigate(step.section)}
          className="inline-flex items-center gap-2 rounded-full border border-[#EFE4DC] bg-white px-3 py-2 text-xs font-medium text-[#5C4C40] transition hover:border-[#6B2545] hover:text-[#6B2545]"
        >
          <span className="font-semibold text-[#6B2545]">{index + 1}.</span>
          {step.label}
          <ArrowRight className="h-3 w-3 opacity-50" />
        </button>
      ))}
    </div>
  );
}
