"use client";

interface MiniTrendChartProps {
  series: number[];
  color: string;
}

export default function MiniTrendChart({ series, color }: MiniTrendChartProps) {
  if (series.length < 2) {
    return <div className="mt-3 h-16 rounded-xl bg-slate-100" />;
  }

  const width = 160;
  const height = 52;
  const padding = 6;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;

  const path = series
    .map((value, index) => {
      const x = padding + (index / (series.length - 1)) * (width - padding * 2);
      const y = height - padding - ((value - min) / range) * (height - padding * 2);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-16 w-full">
        <path d={path} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
