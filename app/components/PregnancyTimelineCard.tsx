"use client";

import { Milestone } from "lucide-react";

type Props = {
  pregnancyWeek: string;
  openTimeline?: () => void;
};

const TOTAL_WEEKS = 40;

const TRIMESTERS = [
  { label: "First Trimester", range: "Weeks 1–12", start: 0, length: 12, color: "#F3B091" },
  { label: "Second Trimester", range: "Weeks 13–27", start: 12, length: 15, color: "#E2725B" },
  { label: "Third Trimester", range: "Weeks 28–40", start: 27, length: 13, color: "#B5533F" },
];

export default function PregnancyTimeline({ pregnancyWeek }: Props) {
  const rawWeek = Number(pregnancyWeek) || 0;
  const currentWeek = Math.max(0, Math.min(rawWeek, TOTAL_WEEKS));
  const hasWeek = currentWeek > 0;
  const overallPercent = (currentWeek / TOTAL_WEEKS) * 100;

  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Milestone className="h-5 w-5 text-[#B5533F]" />
          <h2 className="text-xl font-bold text-[#6B2545]">
            Pregnancy Journey
          </h2>
        </div>
        {hasWeek && (
          <span className="rounded-full bg-[#FFF3E9] px-3 py-1 text-sm font-semibold text-[#6B2545]">
            Week {currentWeek} of {TOTAL_WEEKS}
          </span>
        )}
      </div>

      {!hasWeek ? (
        <p className="mt-4 text-sm text-[#8a7a6d]">
          Enter your pregnancy week in your profile to see your journey
          mapped out here.
        </p>
      ) : (
        <>
          {/* Overall progress, same visual language as the hero ribbon */}
          <div className="relative mt-5 h-2.5 w-full rounded-full bg-[#EFE4DC]">
            <div
              className="h-2.5 rounded-full bg-linear-to-r from-[#E2725B] to-[#F3B091]"
              style={{ width: `${overallPercent}%` }}
            />
            <div
              className="absolute -top-1.5 h-5 w-5 rounded-full bg-white shadow-md ring-2 ring-[#E2725B]"
              style={{ left: `calc(${overallPercent}% - 10px)` }}
            />
          </div>

          {/* Trimester breakdown */}
          <div className="mt-6 space-y-4">
            {TRIMESTERS.map((tri) => {
              const weeksIntoThisTrimester = Math.max(
                0,
                Math.min(currentWeek - tri.start, tri.length)
              );
              const percent = (weeksIntoThisTrimester / tri.length) * 100;
              const isActive =
                currentWeek > tri.start && currentWeek <= tri.start + tri.length;
              const isComplete = currentWeek > tri.start + tri.length;

              return (
                <div key={tri.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`font-medium ${
                        isActive ? "text-[#6B2545]" : "text-[#2B2118]"
                      }`}
                    >
                      {tri.label}
                      {isActive && (
                        <span className="ml-2 rounded-full bg-[#FFF3E9] px-2 py-0.5 text-[11px] font-semibold text-[#B5533F]">
                          You are here
                        </span>
                      )}
                      {isComplete && (
                        <span className="ml-2 text-[11px] font-medium text-emerald-600">
                          Complete
                        </span>
                      )}
                    </span>
                    <span className="text-[#8a7a6d]">{tri.range}</span>
                  </div>

                  <div className="mt-2 h-3 rounded-full bg-[#EFE4DC]">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{
                        width: `${percent}%`,
                        backgroundColor: tri.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}