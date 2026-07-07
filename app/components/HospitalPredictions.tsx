"use client";

import {
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  Baby,
  Bed,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";

export default function HospitalPredictions() {
  const predictions = [
    {
      icon: Baby,
      title: "Expected Deliveries (7 Days)",
      value: "41",
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      icon: AlertTriangle,
      title: "Predicted High-Risk Cases",
      value: "12",
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      icon: Bed,
      title: "Projected Bed Occupancy",
      value: "87%",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: HeartPulse,
      title: "Expected NICU Admissions",
      value: "8",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const recommendations = [
    "Increase obstetric staffing for Thursday and Friday.",
    "Prepare two additional labour beds.",
    "Stock Magnesium Sulphate for anticipated pre-eclampsia cases.",
    "Notify Neonatal Unit of increased expected admissions.",
    "Monitor Jos North cluster for rising hypertension cases.",
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center gap-3 mb-6">

        <BrainCircuit className="h-7 w-7 text-indigo-600" />

        <div>

          <h2 className="text-xl font-bold">
            AI Hospital Predictions
          </h2>

          <p className="text-sm text-gray-500">
            7-Day Operational Forecast
          </p>

        </div>

      </div>

      {/* Prediction Cards */}

      <div className="grid md:grid-cols-2 gap-4 mb-6">

        {predictions.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className={`rounded-xl p-4 ${item.bg}`}
            >

              <div className="flex justify-between">

                <div>

                  <p className="text-sm text-gray-600">
                    {item.title}
                  </p>

                  <h3 className={`text-3xl font-bold mt-2 ${item.color}`}>
                    {item.value}
                  </h3>

                </div>

                <Icon className={`h-8 w-8 ${item.color}`} />

              </div>

            </div>

          );

        })}

      </div>

      {/* AI Insight */}

      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 mb-5">

        <div className="flex items-center gap-2 mb-3">

          <TrendingUp className="text-indigo-700" />

          <h3 className="font-semibold text-indigo-800">
            AI Operational Insight
          </h3>

        </div>

        <p className="text-sm text-indigo-700">

          Based on historical maternal admissions,
          seasonal disease trends,
          and current pregnancy risk profiles,
          MamaCare predicts a
          <strong> 18% increase </strong>
          in obstetric admissions over the next week.

        </p>

      </div>

      {/* Recommendations */}

      <div>

        <h3 className="font-semibold mb-4">
          Recommended Hospital Actions
        </h3>

        <div className="space-y-3">

          {recommendations.map((rec, index) => (

            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-slate-50 p-3"
            >

              <CheckCircle2 className="text-green-600 mt-1 h-5 w-5" />

              <p className="text-sm">
                {rec}
              </p>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}