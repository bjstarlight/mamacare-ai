"use client";

import { useEffect, useState } from "react";
import {
  Ambulance,
  Navigation,
  Hospital,
  ShieldCheck,
} from "lucide-react";

interface Referral {
  patient: string;
  village: string;
  reason: string;
  status: string;
  createdAt: string;
}

const stages = [
  "Accepted",
  "Ambulance Dispatched",
  "En Route",
  "Arrived",
  "Admitted",
  "Treatment Complete",
  "BOT Chain Verified",
];

export default function OutgoingReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("referrals") || "[]"
    );

    setReferrals(saved);
  }, []);

  function nextStage(index: number) {
    const updated = [...referrals];

    const current = stages.indexOf(updated[index].status);

    if (current < stages.length - 1 && current !== -1) {
      updated[index].status = stages[current + 1];
    }

    localStorage.setItem(
      "referrals",
      JSON.stringify(updated)
    );

    setReferrals(updated);
  }

  const active = referrals.filter(
    (r) => r.status !== "Pending" && r.status !== "Declined"
  );

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-5">
        Referral Journey Tracker
      </h2>

      {active.length === 0 ? (
        <p className="text-gray-500">
          No active referrals.
        </p>
      ) : (
        <div className="space-y-6">

          {active.map((item, index) => (

            <div
              key={index}
              className="border rounded-xl p-5"
            >

              <h3 className="font-semibold text-lg">
                {item.patient}
              </h3>

              <p className="text-gray-500 text-sm">
                {item.reason}
              </p>

              <div className="mt-5">

                <div className="flex flex-wrap gap-2">

                  {stages.map((stage) => (

                    <div
                      key={stage}
                      className={`px-3 py-2 rounded-full text-sm font-medium
                      ${
                        stage === item.status
                          ? "bg-blue-600 text-white"
                          : stages.indexOf(stage) <
                            stages.indexOf(item.status)
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {stage}
                    </div>

                  ))}

                </div>

              </div>

              <button
                onClick={() => nextStage(index)}
                className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Advance to Next Stage
              </button>

              <div className="grid grid-cols-4 gap-3 mt-6">

                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <Ambulance className="mx-auto text-red-600 mb-1" />
                  Ambulance
                </div>

                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <Navigation className="mx-auto text-blue-600 mb-1" />
                  Tracking
                </div>

                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <Hospital className="mx-auto text-green-600 mb-1" />
                  Hospital
                </div>

                <div className="bg-slate-100 rounded-lg p-3 text-center">
                  <ShieldCheck className="mx-auto text-purple-600 mb-1" />
                  BOT Chain
                </div>

              </div>

            </div>

          ))}

        </div>
      )}
    </div>
  );
}