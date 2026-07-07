"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function EmergencySOSFeed() {
  const [sos, setSos] = useState<any[]>([]);

  useEffect(() => {
    const data = JSON.parse(
      localStorage.getItem("EmergencySOS") || "[]"
    );
    setSos(data);
  }, []);

  return (
    <div className="bg-white p-6 rounded-xl shadow">

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <AlertTriangle className="text-red-600" />
        Emergency SOS Feed
      </h2>

      {sos.length === 0 ? (
        <p className="text-gray-500">
          No SOS alerts.
        </p>
      ) : (
        sos.map((s, i) => (
          <div key={i} className="border p-4 rounded-lg mb-3">

            <p className="font-bold">
              {s.mother || "Unknown"}
            </p>

            <p className="text-sm text-gray-500">
              {s.location}
            </p>

            <p className="text-sm mt-2">
              Status: {s.status || "Active"}
            </p>

          </div>
        ))
      )}

    </div>
  );
}