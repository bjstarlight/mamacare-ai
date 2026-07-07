"use client";

import { AlertTriangle, Ambulance, ArrowRight } from "lucide-react";
import type { EmergencyCase } from "./types";

interface EmergencyPanelProps {
  emergencies: EmergencyCase[];
}

export default function EmergencyPanel({ emergencies }: EmergencyPanelProps) {
  if (!emergencies.length) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-rose-500/30 bg-gradient-to-br from-rose-600/20 to-slate-900 p-5 shadow-2xl shadow-rose-950/20">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-300">Live Emergency Panel</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Emergency cases</h2>
        </div>
        <div className="rounded-2xl bg-rose-500/20 p-3 text-rose-200">
          <AlertTriangle className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {emergencies.map((item) => (
          <div key={item.id} className="rounded-2xl border border-rose-400/20 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">{item.patientName}</h3>
                  <span className="rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium text-rose-200">
                    {item.priority}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-400">{item.gestationalAge}</p>
              </div>
              <div className="rounded-full bg-rose-500/15 px-3 py-1 text-sm text-rose-200">
                {item.distanceKm}
              </div>
            </div>

            <p className="mt-3 text-sm text-slate-200">{item.summary}</p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Ambulance className="h-4 w-4" />
                {item.status}
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-rose-400">
                Escalate
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
