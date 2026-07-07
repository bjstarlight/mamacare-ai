"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

const data = [
  { day: "Mon", admissions: 28, deliveries: 12 },
  { day: "Tue", admissions: 35, deliveries: 15 },
  { day: "Wed", admissions: 31, deliveries: 14 },
  { day: "Thu", admissions: 43, deliveries: 19 },
  { day: "Fri", admissions: 39, deliveries: 17 },
  { day: "Sat", admissions: 46, deliveries: 21 },
  { day: "Sun", admissions: 34, deliveries: 16 },
];

export default function AdmissionsTrendChart() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Weekly Admissions
          </h2>

          <p className="text-sm text-gray-500">
            Maternal & Child Health Activity
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase text-gray-500">
            This Week
          </p>

          <p className="text-2xl font-bold text-blue-700">
            256
          </p>
        </div>

      </div>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <AreaChart data={data}>

            <defs>

              <linearGradient
                id="colorAdmissions"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="#2563eb"
                  stopOpacity={0.35}
                />

                <stop
                  offset="95%"
                  stopColor="#2563eb"
                  stopOpacity={0}
                />
              </linearGradient>

            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Area
              type="monotone"
              dataKey="admissions"
              stroke="#2563eb"
              fill="url(#colorAdmissions)"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="deliveries"
              stroke="#16a34a"
              strokeWidth={3}
            />

          </AreaChart>

        </ResponsiveContainer>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-6">

        <div className="rounded-xl bg-blue-50 p-4">

          <p className="text-sm text-blue-700">
            Total Admissions
          </p>

          <h3 className="text-3xl font-bold text-blue-800">
            256
          </h3>

        </div>

        <div className="rounded-xl bg-green-50 p-4">

          <p className="text-sm text-green-700">
            Deliveries
          </p>

          <h3 className="text-3xl font-bold text-green-800">
            114
          </h3>

        </div>

      </div>

    </div>
  );
}