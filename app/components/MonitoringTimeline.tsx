"use client";

import { CheckCircle2 } from "lucide-react";

interface MonitoringTimelineProps {
  items: Array<{ time: string; label: string }>;
}

export default function MonitoringTimeline({ items }: MonitoringTimelineProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Monitoring Timeline</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.time} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            <div>
              <p className="text-sm font-semibold text-slate-800">{item.label}</p>
              <p className="text-xs text-slate-500">{item.time}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
        ))}
      </div>
    </div>
  );
}
