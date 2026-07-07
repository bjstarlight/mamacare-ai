"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Lock, Activity } from "lucide-react";

export default function BlockchainConsentPanel() {
  const [events, setEvents] = useState<Array<{ hash: string; type: string; details: string }>>([]);

  useEffect(() => {
    const stored = JSON.parse(window.localStorage.getItem("blockchainRecords") || "[]") as Array<{
      hash: string;
      type: string;
      details: string;
    }>;
    setEvents(stored.slice(0, 5));
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 text-emerald-700">
        <ShieldCheck className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Consent-first BOT Chain Journal</h2>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        User-consented healthcare events are hashed and recorded on BOT Chain. Sensitive medical details remain off-chain and are only referenced by encrypted metadata pointers.
      </p>
      <div className="mt-5 space-y-3">
        {events.map((event) => (
          <div key={event.hash} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Activity className="h-4 w-4 text-emerald-600" />
                {event.type}
              </div>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Hash recorded</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{event.details}</p>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              {event.hash}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
