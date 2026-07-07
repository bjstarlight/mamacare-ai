"use client";

import { BarChart3, TrendingUp } from "lucide-react";

export default function HospitalStatistics() {
  const stats = [
    { label: "Deliveries this month", value: "146", detail: "+12% vs last month" },
    { label: "High-risk pregnancies", value: "83", detail: "Needs special monitoring" },
    { label: "Average response time", value: "14 min", detail: "Improved from 19 min" },
    { label: "Referral completion", value: "92%", detail: "On-time handoff" },
    { label: "Maternal mortality (demo)", value: "0", detail: "No incidents in demo" },
    { label: "Neonatal outcomes", value: "97%", detail: "Stable outcomes" },
  ];

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Hospital Statistics</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Operational trends</h2>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
          <BarChart3 className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
            <p className="mt-2 text-sm text-slate-400">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
