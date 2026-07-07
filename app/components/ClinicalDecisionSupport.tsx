"use client";

import { useEffect, useState } from "react";

export default function ClinicalDecisionSupport() {
  const [recommendations, setRecommendations] = useState<string[]>([]);

  useEffect(() => {
    const vitals = JSON.parse(
      localStorage.getItem("vitalSigns") || "{}"
    );

    const advice: string[] = [];

    // Blood Pressure
    if (vitals.bloodPressure) {
      const bp = vitals.bloodPressure.split("/");

      if (bp.length === 2) {
        const systolic = Number(bp[0]);
        const diastolic = Number(bp[1]);

        if (systolic >= 140 || diastolic >= 90) {
          advice.push(
            "🔴 Elevated blood pressure detected. Consider assessment for hypertensive disorders of pregnancy."
          );
        }
      }
    }

    // Temperature
    if (vitals.temperature) {
      const temp = parseFloat(vitals.temperature);

      if (temp >= 38) {
        advice.push(
          "🔴 Fever detected. Assess for infection and clinical symptoms."
        );
      }
    }

    // Oxygen
    if (vitals.oxygen) {
      const oxygen = parseFloat(vitals.oxygen);

      if (oxygen < 95) {
        advice.push(
          "🔴 Low oxygen saturation. Urgent clinical evaluation is recommended."
        );
      }
    }

    // Heart Rate
    if (vitals.heartRate) {
      const hr = parseFloat(vitals.heartRate);

      if (hr > 110) {
        advice.push(
          "🟡 Elevated heart rate detected. Review hydration, infection, pain or other causes."
        );
      }
    }

    // Blood Sugar
    if (vitals.bloodSugar) {
      const sugar = parseFloat(vitals.bloodSugar);

      if (sugar > 140) {
        advice.push(
          "🟡 Blood glucose appears elevated. Consider diabetes assessment."
        );
      }
    }

    if (advice.length === 0) {
      advice.push(
        "✅ No significant abnormalities detected from the recorded vital signs."
      );
    }

    setRecommendations(advice);
  }, []);

  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 p-6">

      <h2 className="text-2xl font-bold text-green-700">
        🧠 AI Clinical Decision Support
      </h2>

      <ul className="mt-5 space-y-3">
        {recommendations.map((item, index) => (
          <li key={index}>
            {item}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-gray-500">
        This feature provides decision support only and does not replace
        professional medical judgment.
      </p>

    </div>
  );
}