"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Hospital,
} from "lucide-react";

interface Referral {
  patient: string;
  village: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function IncomingReferrals() {
  const [referrals, setReferrals] = useState<Referral[]>([]);

  useEffect(() => {
    const stored = JSON.parse(
      localStorage.getItem("referrals") || "[]"
    );

    setReferrals(stored);
  }, []);

  function updateStatus(index: number, status: string) {
    const updated = [...referrals];

    updated[index].status = status;

    localStorage.setItem(
      "referrals",
      JSON.stringify(updated)
    );

    setReferrals(updated);
  }

  return (
    <div className="bg-white rounded-xl shadow p-6">

      <div className="flex items-center gap-2 mb-5">

        <Hospital className="text-blue-600" />

        <h2 className="text-xl font-bold">
          Incoming Referrals
        </h2>

      </div>

      {referrals.length === 0 ? (

        <p className="text-gray-500">
          No incoming referrals.
        </p>

      ) : (

        <div className="space-y-4">

          {referrals.map((referral, index) => (

            <div
              key={index}
              className="border rounded-lg p-4"
            >

              <div className="flex justify-between">

                <div>

                  <h3 className="font-semibold">
                    {referral.patient}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {referral.village}
                  </p>

                  <p className="mt-2">
                    <strong>Reason:</strong>{" "}
                    {referral.reason}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(
                      referral.createdAt
                    ).toLocaleString()}
                  </p>

                </div>

                <div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold
                    ${
                      referral.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : referral.status === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {referral.status}
                  </span>

                </div>

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() =>
                    updateStatus(index, "Accepted")
                  }
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                >
                  <CheckCircle size={18} />
                  Accept
                </button>

                <button
                  onClick={() =>
                    updateStatus(index, "Declined")
                  }
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                >
                  <XCircle size={18} />
                  Decline
                </button>

                <button
                  onClick={() =>
                    updateStatus(index, "Waiting")
                  }
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  <Clock size={18} />
                  Hold
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}