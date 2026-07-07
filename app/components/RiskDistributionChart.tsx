"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const data = [
  {
    name: "Low Risk",
    value: 1720,
    color: "#22c55e",
  },
  {
    name: "Moderate",
    value: 510,
    color: "#facc15",
  },
  {
    name: "High Risk",
    value: 180,
    color: "#fb923c",
  },
  {
    name: "Critical",
    value: 73,
    color: "#ef4444",
  },
];

export default function RiskDistributionChart() {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold text-slate-800">
            Pregnancy Risk Distribution
          </h2>

          <p className="text-sm text-gray-500">
            AI Population Risk Classification
          </p>

        </div>

        <div className="text-right">

          <p className="text-xs uppercase text-gray-500">
            Total Patients
          </p>

          <p className="text-2xl font-bold text-blue-700">
            {total}
          </p>

        </div>

      </div>

      <div className="h-80">

        <ResponsiveContainer width="100%" height="100%">

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
            >

              {data.map((entry) => (

                <Cell
                  key={entry.name}
                  fill={entry.color}
                />

              ))}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">

        {data.map((risk) => (

          <div
            key={risk.name}
            className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
          >

            <div className="flex items-center gap-2">

              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: risk.color,
                }}
              />

              <span className="font-medium">
                {risk.name}
              </span>

            </div>

            <span className="font-bold text-slate-700">

              {risk.value}

            </span>

          </div>

        ))}

      </div>

    </div>
  );
}