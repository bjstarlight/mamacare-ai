"use client";

import { Activity, ShieldCheck } from "lucide-react";
import type { ChainStatus } from "./types";

interface DashboardHeaderProps {
  hospitalName: string;
  chainStatus: ChainStatus;
}

export default function DashboardHeader({ hospitalName, chainStatus }: DashboardHeaderProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 p-6 shadow-2xl shadow-slate-950/40">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Hospital Command Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">{hospitalName}</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Mission control for emergency response, AI risk triage, referrals, and blockchain-backed clinical verification.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck className="h-4 w-4" />
            BOT Chain Status
          </div>
          <div className="mt-2 flex items-center gap-2 text-slate-200">
            <Activity className="h-4 w-4" />
            Network: {chainStatus.network}
          </div>
          <div className="mt-1 text-slate-300">
            Blocks Verified Today: {chainStatus.blocksVerifiedToday} · Medical Records Protected: {chainStatus.medicalRecordsProtected.toLocaleString()} · Avg Verification: {chainStatus.averageVerificationTime}
          </div>
        </div>
      </div>
    </div>
  );
}
