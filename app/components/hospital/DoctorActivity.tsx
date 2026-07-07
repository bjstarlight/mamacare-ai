"use client";

import { Clock3, ShieldCheck } from "lucide-react";
import type { DoctorActivityEntry } from "./types";

interface DoctorActivityProps {
  doctors: DoctorActivityEntry[];
}

export default function DoctorActivity({ doctors }: DoctorActivityProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Doctor Activity</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Live physician activity</h2>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{doctor.name}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">
                  <Clock3 className="h-4 w-4" />
                  Last consultation {doctor.lastConsultation}
                </div>
              </div>
              <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                {doctor.patientsToday} patients today
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-300">Verified records: {doctor.verifiedRecords}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
