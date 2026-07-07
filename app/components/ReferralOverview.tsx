"use client";

import {
  Building2,
  Ambulance,
  CheckCircle2,
  Clock3,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";

export default function ReferralOverview() {
  const referrals = [
    {
      patient: "Amina Yusuf",
      from: "Primary Health Centre Jos",
      to: "Jos University Teaching Hospital",
      reason: "Emergency C-section",
      status: "Accepted",
      color: "bg-green-100 text-green-700",
    },
    {
      patient: "Grace Peter",
      from: "Bukuru Clinic",
      to: "Plateau Specialist Hospital",
      reason: "Severe Pre-eclampsia",
      status: "Pending",
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      patient: "Mary Daniel",
      from: "Community Clinic",
      to: "Bingham University Teaching Hospital",
      reason: "NICU Transfer",
      status: "In Transit",
      color: "bg-blue-100 text-blue-700",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold flex items-center gap-2">

            <Ambulance className="text-red-600" />

            Referral Command Centre

          </h2>

          <p className="text-sm text-gray-500">
            AI Assisted Hospital Referral System
          </p>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="rounded-xl bg-blue-50 p-4">

          <Building2 className="text-blue-600 mb-2" />

          <p className="text-sm text-gray-500">
            Total Referrals
          </p>

          <h3 className="text-3xl font-bold text-blue-700">
            124
          </h3>

        </div>

        <div className="rounded-xl bg-yellow-50 p-4">

          <Clock3 className="text-yellow-600 mb-2" />

          <p className="text-sm text-gray-500">
            Pending
          </p>

          <h3 className="text-3xl font-bold text-yellow-700">
            9
          </h3>

        </div>

        <div className="rounded-xl bg-green-50 p-4">

          <CheckCircle2 className="text-green-600 mb-2" />

          <p className="text-sm text-gray-500">
            Accepted
          </p>

          <h3 className="text-3xl font-bold text-green-700">
            111
          </h3>

        </div>

        <div className="rounded-xl bg-red-50 p-4">

          <Ambulance className="text-red-600 mb-2" />

          <p className="text-sm text-gray-500">
            Active Transfers
          </p>

          <h3 className="text-3xl font-bold text-red-700">
            4
          </h3>

        </div>

      </div>

      {/* AI Recommendation */}

      <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 mb-6">

        <div className="flex items-start gap-3">

          <BrainCircuit className="text-blue-600 mt-1" />

          <div>

            <h3 className="font-semibold text-blue-800">
              AI Referral Recommendation
            </h3>

            <p className="text-sm text-blue-700 mt-2">
              High-risk obstetric emergency detected.
              Recommended destination:
            </p>

            <p className="font-bold mt-2">
              Jos University Teaching Hospital –
              Obstetrics Emergency Unit
            </p>

          </div>

        </div>

      </div>

      {/* Referral List */}

      <div className="space-y-4">

        {referrals.map((item, index) => (

          <div
            key={index}
            className="rounded-xl border border-slate-200 p-4"
          >

            <div className="flex justify-between">

              <div>

                <h3 className="font-semibold">
                  {item.patient}
                </h3>

                <p className="text-sm text-gray-500">
                  {item.reason}
                </p>

              </div>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}
              >
                {item.status}
              </span>

            </div>

            <div className="mt-4 flex items-center gap-2 text-sm">

              <Building2 size={16} />

              <span>{item.from}</span>

              <ArrowRight size={16} />

              <span>{item.to}</span>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}