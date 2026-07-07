"use client";

interface HospitalStatsProps {
  patientsOnline: number;
  highRisk: number;
  moderate: number;
  stable: number;
}

export default function HospitalStats({ patientsOnline, highRisk, moderate, stable }: HospitalStatsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Hospital Command Center</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Patients online</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{patientsOnline}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-rose-400">High risk</p>
          <p className="mt-1 text-xl font-semibold text-rose-700">{highRisk}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-400">Moderate</p>
          <p className="mt-1 text-xl font-semibold text-amber-700">{moderate}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Stable</p>
          <p className="mt-1 text-xl font-semibold text-emerald-700">{stable}</p>
        </div>
      </div>
    </div>
  );
}
