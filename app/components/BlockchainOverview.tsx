"use client";

import {
  ShieldCheck,
  Database,
  Clock3,
  CheckCircle2,
  Fingerprint,
  Link2,
} from "lucide-react";

export default function BlockchainOverview() {
  const records = [
    {
      hash: "0x8a93...bf21",
      patient: "Amina Yusuf",
      type: "Clinical Summary",
      time: "2 mins ago",
      status: "Verified",
    },
    {
      hash: "0x91dd...12af",
      patient: "Grace Peter",
      type: "Prescription",
      time: "12 mins ago",
      status: "Verified",
    },
    {
      hash: "0x5bc8...fa77",
      patient: "Mary Daniel",
      type: "Referral",
      time: "25 mins ago",
      status: "Verified",
    },
    {
      hash: "0x44ce...90ba",
      patient: "Joy Moses",
      type: "Emergency Record",
      time: "40 mins ago",
      status: "Verified",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold flex items-center gap-2">

            <ShieldCheck className="text-green-600" />

            BOT Chain Ledger

          </h2>

          <p className="text-sm text-gray-500">
            Immutable Medical Records
          </p>

        </div>

      </div>

      {/* Statistics */}

      <div className="grid grid-cols-2 gap-4 mb-6">

        <div className="rounded-xl bg-green-50 p-4">

          <Database className="text-green-600 mb-2" />

          <p className="text-sm text-gray-500">
            Protected Records
          </p>

          <h3 className="text-3xl font-bold text-green-700">
            18,425
          </h3>

        </div>

        <div className="rounded-xl bg-blue-50 p-4">

          <CheckCircle2 className="text-blue-600 mb-2" />

          <p className="text-sm text-gray-500">
            Verification Rate
          </p>

          <h3 className="text-3xl font-bold text-blue-700">
            100%
          </h3>

        </div>

      </div>

      {/* Recent Transactions */}

      <h3 className="font-semibold mb-4">
        Recent Blockchain Activity
      </h3>

      <div className="space-y-3">

        {records.map((item, index) => (

          <div
            key={index}
            className="rounded-xl border border-slate-200 p-4"
          >

            <div className="flex justify-between">

              <div>

                <p className="font-semibold">
                  {item.patient}
                </p>

                <p className="text-sm text-gray-500">
                  {item.type}
                </p>

              </div>

              <span className="text-green-600 font-semibold">
                {item.status}
              </span>

            </div>

            <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">

              <Fingerprint size={16} />

              <span className="font-mono">
                {item.hash}
              </span>

            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">

              <Clock3 size={14} />

              {item.time}

            </div>

          </div>

        ))}

      </div>

      {/* Footer */}

      <div className="mt-6 rounded-xl bg-slate-50 p-4 flex items-center gap-3">

        <Link2 className="text-blue-600" />

        <div>

          <p className="font-semibold">
            BOT Chain Security
          </p>

          <p className="text-sm text-gray-500">
            Every protected medical record is cryptographically hashed and permanently verifiable.
          </p>

        </div>

      </div>

    </div>
  );
}