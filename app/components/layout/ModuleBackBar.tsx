"use client";

import { ArrowLeft } from "lucide-react";

type ModuleBackBarProps = {
  title: string;
  onBack: () => void;
  subtitle?: string;
};

export default function ModuleBackBar({ title, onBack, subtitle }: ModuleBackBarProps) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-full border border-[#EFE4DC] bg-white px-3 py-2 text-sm font-medium text-[#6B2545] transition hover:bg-[#FFF3E9]"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </button>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold text-[#2B2118]">{title}</h2>
        {subtitle ? (
          <p className="text-xs text-[#8A7A6D]">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
