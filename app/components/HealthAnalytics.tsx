"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { week: "20", score: 70 },
  { week: "24", score: 75 },
  { week: "28", score: 82 },
  { week: "32", score: 88 },
  { week: "36", score: 92 },
  { week: "40", score: 100 },
];

export default function HealthAnalytics() {
  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <h2 className="text-xl font-bold text-pink-600 mb-4">
        📊 Pregnancy Progress Analytics
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="week" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#ec4899"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}