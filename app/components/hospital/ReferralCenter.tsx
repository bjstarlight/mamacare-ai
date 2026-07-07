"use client";

import { CheckCircle2, Eye, XCircle } from "lucide-react";
import type { ReferralItem } from "./types";

interface ReferralCenterProps {
  referrals: ReferralItem[];
  onReferralAction: (id: string, action: "accept" | "reject") => void;
}

export default function ReferralCenter({ referrals, onReferralAction }: ReferralCenterProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Referral Center</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Incoming referrals</h2>
        </div>
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/10 p-3 text-violet-300">
          <Eye className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {referrals.map((referral) => (
          <div key={referral.id} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-white">{referral.mother}</p>
                <p className="mt-1 text-sm text-slate-400">From {referral.hospital}</p>
              </div>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-300">
                {referral.priority}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-300">{referral.diagnosis}</p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-400">Status: {referral.status}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => onReferralAction(referral.id, "accept")}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-2 text-sm font-medium text-emerald-300 transition hover:bg-emerald-500/25"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Accept
                </button>
                <button
                  onClick={() => onReferralAction(referral.id, "reject")}
                  className="inline-flex items-center gap-2 rounded-full bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/25"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700">
                  <Eye className="h-4 w-4" />
                  View Record
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
