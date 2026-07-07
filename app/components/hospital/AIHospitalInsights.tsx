"use client";

import { Sparkles } from "lucide-react";
import type { HospitalMetrics } from "./types";

interface AIHospitalInsightsProps {
  metrics: HospitalMetrics;
  urgentReviewCount: number;
  emergencyCount: number;
}

export default function AIHospitalInsights({ metrics, urgentReviewCount, emergencyCount }: AIHospitalInsightsProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">AI Hospital Insights</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Today&apos;s AI Summary</h2>
        </div>
        <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-3 text-fuchsia-300">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
        <ul className="space-y-3">
          <li>• {urgentReviewCount} patients require urgent review.</li>
          <li>• Emergency cases increased by 22% over the prior shift.</li>
          <li>• Blood group O- stock may become low based on the current demand trend.</li>
          <li>• Average referral response time is 14 minutes across the current queue.</li>
          <li>• {metrics.mothersRegistered.toLocaleString()} mothers are currently registered and {metrics.blockchainVerifiedRecords.toLocaleString()} records are protected on the network.</li>
        </ul>
      </div>
    </section>
  );
}
