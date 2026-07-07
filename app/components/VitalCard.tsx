"use client";

import MiniTrendChart from "./MiniTrendChart";

interface VitalCardProps {
  label: string;
  value: string;
  unit: string;
  series: number[];
  color: string;
}

export default function VitalCard({ label, value, unit, series, color }: VitalCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          <p className="mt-1 text-xl font-semibold text-slate-800">{value}</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{unit}</span>
      </div>
      <MiniTrendChart series={series} color={color} />
    </div>
  );
}
