"use client";

import { BrainCircuit, TrendingUp } from "lucide-react";

export default function AIPopulationIntelligence() {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2">
        <div className="rounded-full bg-amber-50 p-2 text-amber-700">
          <BrainCircuit className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-600">AI Population Intelligence</p>
          <h2 className="text-2xl font-semibold text-slate-900">Signals that matter across the network</h2>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <TrendingUp className="h-4 w-4" />
            Hypertension cases increased 23%
          </div>
          <p className="mt-2 text-sm text-amber-800">Jos North shows the strongest cluster and may need redistribution of specialist visits.</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <TrendingUp className="h-4 w-4" />
            Anemia rising in underserved districts
          </div>
          <p className="mt-2 text-sm text-emerald-800">Iron supplementation outreach is recommended in the next 10 days.</p>
        </div>
        <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-violet-700">
            <TrendingUp className="h-4 w-4" />
            Nearest hospital overloaded
          </div>
          <p className="mt-2 text-sm text-violet-800">Recommend rerouting routine referrals to tertiary clinics with available capacity.</p>
        </div>
      </div>
    </section>
  );
}
