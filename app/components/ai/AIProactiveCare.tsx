"use client";

import { useEffect, useState } from "react";
import { loadMemory } from "./AIMemory";

interface Alert {
  id: string;
  title: string;
  message: string;
  priority: "Low" | "Medium" | "High";
}

export default function AIProactiveCare() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const memory = loadMemory();

      const newAlerts: Alert[] = [];

      // Pregnancy week reminders
      if (
        memory.gestationalAge &&
        memory.gestationalAge >= 36
      ) {
        newAlerts.push({
          id: "delivery",
          title: "Prepare for Delivery",
          message:
            "You're close to full term. Ensure your hospital bag is ready.",
          priority: "Medium",
        });
      }

      // High-risk pregnancy reminder
      if (memory.highRisk) {
        newAlerts.push({
          id: "risk",
          title: "High Risk Pregnancy",
          message:
            "Attend all antenatal appointments and monitor symptoms closely.",
          priority: "High",
        });
      }

      // Previous diagnosis follow-up
      if (memory.lastDiagnosis) {
        newAlerts.push({
          id: "followup",
          title: "Follow-up Required",
          message: `Previous diagnosis: ${memory.lastDiagnosis}. Continue monitoring and follow medical advice.`,
          priority: "Medium",
        });
      }

      // Previous Caesarean reminder
      if (memory.previousCS) {
        newAlerts.push({
          id: "cs",
          title: "Previous Caesarean Section",
          message:
            "Discuss your delivery plan early with your obstetrician.",
          priority: "Medium",
        });
      }

      setAlerts(newAlerts);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white rounded-xl shadow p-5">

      <h2 className="text-xl font-bold mb-4">
        AI Care Alerts
      </h2>

      {alerts.length === 0 ? (
        <p className="text-gray-500">
          No active alerts.
        </p>
      ) : (
        <div className="space-y-4">

          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg p-4 border ${
                alert.priority === "High"
                  ? "border-red-500 bg-red-50"
                  : alert.priority === "Medium"
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-green-500 bg-green-50"
              }`}
            >
              <h3 className="font-semibold">
                {alert.title}
              </h3>

              <p className="text-sm mt-2">
                {alert.message}
              </p>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}