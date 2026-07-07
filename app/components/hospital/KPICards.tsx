"use client";

import { Activity, AlertTriangle, HeartPulse, ShieldCheck, Stethoscope, Users } from "lucide-react";
import type { ChainStatus, HospitalMetrics, KPIItem } from "./types";

interface KPICardsProps {
  metrics: HospitalMetrics;
  chainStatus: ChainStatus;
}

export default function KPICards({ metrics, chainStatus }: KPICardsProps) {
  const items: KPIItem[] = [
    {
      label: "Mothers Registered",
      value: metrics.mothersRegistered.toLocaleString(),
      detail: "Live from local storage",
      icon: Users,
      tone: "neutral",
    },
    {
      label: "High-Risk Pregnancies",
      value: metrics.highRiskPregnancies.toString(),
      detail: "Requires follow-up",
      icon: HeartPulse,
      tone: "warning",
    },
    {
      label: "Active Emergency SOS",
      value: metrics.activeEmergencySos.toString(),
      detail: "Watchlist priority",
      icon: AlertTriangle,
      tone: "critical",
    },
    {
      label: "Incoming Referrals",
      value: metrics.incomingReferrals.toString(),
      detail: "Awaiting triage",
      icon: Stethoscope,
      tone: "neutral",
    },
    {
      label: "Doctors Online",
      value: metrics.doctorsOnline.toString(),
      detail: "Available now",
      icon: Activity,
      tone: "success",
    },
    {
      label: "Blockchain Verified Records",
      value: metrics.blockchainVerifiedRecords.toLocaleString(),
      detail: `${chainStatus.averageVerificationTime} average verification`,
      icon: ShieldCheck,
      tone: "success",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        const toneClasses = {
          neutral: "border-slate-800 bg-slate-900/70",
          warning: "border-amber-500/20 bg-amber-500/10",
          critical: "border-rose-500/20 bg-rose-500/10",
          success: "border-emerald-500/20 bg-emerald-500/10",
        }[item.tone];

        return (
          <div key={item.label} className={`rounded-2xl border p-4 shadow-lg shadow-slate-950/25 ${toneClasses}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{item.value}</p>
              </div>
              <div className="rounded-2xl bg-slate-950/60 p-3 text-cyan-400">
                <Icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-400">{item.detail}</p>
          </div>
        );
      })}
    </div>
  );
}
