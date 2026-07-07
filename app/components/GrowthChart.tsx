"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Measurement = {
  date: string;
  weight: string;
  height: string;
};

type Props = {
  history: Measurement[];
};

export default function GrowthChart({ history }: Props) {
  const data = history.map((item) => ({
    date: item.date,
    weight: Number(item.weight),
    height: Number(item.height),
  }));

  return (
    <div className="mt-6 rounded-xl border bg-white p-4">
      <h3 className="mb-4 text-xl font-bold text-blue-700">
        📈 Growth Trend
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />

          <Line
            type="monotone"
            dataKey="weight"
            stroke="#2563eb"
            strokeWidth={3}
          />

          <Line
            type="monotone"
            dataKey="height"
            stroke="#16a34a"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}