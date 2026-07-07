"use client";

import { HeartPulse } from "lucide-react";

type PregnancyTrackerProps = {
  pregnancyWeek: string;
  setPregnancyWeek: (week: string) => void;
  checkPregnancyWeek: () => void;
  weekAdvice: string;
};

export default function PregnancyTracker({
  pregnancyWeek,
  setPregnancyWeek,
  checkPregnancyWeek,
  weekAdvice,
}: PregnancyTrackerProps) {
  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-[#FBEAE3] p-6">
      <div className="flex items-center gap-2">
        <HeartPulse className="h-6 w-6 text-[#B5533F]" />
        <h2 className="text-xl font-bold text-[#B5533F]">
          Pregnancy Week Tracker
        </h2>
      </div>

      <p className="mt-2 text-[#4a3d33]">
        Enter your pregnancy week to receive guidance.
      </p>

      <input
        type="number"
        min={1}
        max={40}
        placeholder="Example: 28"
        value={pregnancyWeek}
        onChange={(e) => setPregnancyWeek(e.target.value)}
        className="mt-4 w-full rounded-xl border border-[#E0D5CC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]"
      />

      <button
        onClick={checkPregnancyWeek}
        className="mt-4 rounded-xl bg-[#B5533F] hover:bg-[#9C4535] px-6 py-3 text-white font-semibold transition-colors"
      >
        Get Weekly Advice
      </button>

      {weekAdvice && (
        <div className="mt-6 rounded-xl border border-[#EFE4DC] bg-white p-4 shadow-sm">
          <h3 className="font-bold text-[#B5533F]">
            Your Pregnancy Advice
          </h3>

          <p className="mt-3 whitespace-pre-wrap text-[#2B2118]">
            {weekAdvice}
          </p>
        </div>
      )}
    </div>
  );
}