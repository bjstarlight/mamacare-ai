"use client";

import { BedDouble, FlaskConical, HeartPulse, Microscope, Stethoscope } from "lucide-react";
import type { CapacityItem } from "./types";

interface HospitalCapacityProps {
  capacity: CapacityItem[];
}

const icons = {
  success: HeartPulse,
  warning: BedDouble,
  neutral: Stethoscope,
};

export default function HospitalCapacity({ capacity }: HospitalCapacityProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Hospital Capacity</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Current availability</h2>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-300">
          <Microscope className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {capacity.map((item) => {
          const Icon = icons[item.tone] ?? Stethoscope;
          return (
            <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-800 p-2 text-cyan-300">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">{item.label}</p>
                  <p className="text-lg font-semibold text-white">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
