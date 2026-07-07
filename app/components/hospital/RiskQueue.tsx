"use client";

import { ArrowUpDown, ShieldAlert } from "lucide-react";
import type { RiskPatient } from "./types";

interface RiskQueueProps {
  patients: RiskPatient[];
}

export default function RiskQueue({ patients }: RiskQueueProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">AI Risk Queue</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Sortable by risk</h2>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-cyan-300">
          <ArrowUpDown className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-950/70 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Patient</th>
              <th className="px-4 py-3 font-medium">Risk</th>
              <th className="px-4 py-3 font-medium">Weeks</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-900/60 text-slate-200">
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="px-4 py-3 font-medium text-white">{patient.name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${patient.riskLevel === "Critical" ? "bg-rose-500/15 text-rose-200" : patient.riskLevel === "High" ? "bg-amber-500/15 text-amber-200" : "bg-emerald-500/15 text-emerald-200"}`}>
                    {patient.riskLevel}
                  </span>
                </td>
                <td className="px-4 py-3">{patient.weeks}w</td>
                <td className="px-4 py-3">{patient.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
