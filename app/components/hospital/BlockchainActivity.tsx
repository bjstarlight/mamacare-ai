"use client";

import { ShieldCheck } from "lucide-react";
import type { BlockchainEvent } from "./types";

interface BlockchainActivityProps {
  events: BlockchainEvent[];
}

export default function BlockchainActivity({ events }: BlockchainActivityProps) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-slate-950/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-400">Blockchain Activity</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Recent verified records</h2>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-emerald-300">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <div key={event.id} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm">
            <div>
              <p className="font-medium text-white">{event.description}</p>
              <p className="mt-1 text-slate-400">{event.time}</p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-emerald-300">{event.status}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
