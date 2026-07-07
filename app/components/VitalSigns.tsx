"use client";

import { useEffect, useState } from "react";

export default function VitalSigns() {
  const [vitals, setVitals] = useState({
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    oxygen: "",
    weight: "",
    bloodSugar: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("vitalSigns");

    if (saved) {
      setVitals(JSON.parse(saved));
    }
  }, []);

  function updateVital(field: string, value: string) {
    const updated = {
      ...vitals,
      [field]: value,
    };

    setVitals(updated);

    localStorage.setItem(
      "vitalSigns",
      JSON.stringify(updated)
    );
  }

  return (
    <div className="rounded-2xl bg-white shadow p-6">

      <h2 className="text-2xl font-bold text-red-600 mb-6">
        ❤️ Vital Signs
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <input
          placeholder="Blood Pressure (120/80)"
          value={vitals.bloodPressure}
          onChange={(e) =>
            updateVital("bloodPressure", e.target.value)
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Heart Rate (72 bpm)"
          value={vitals.heartRate}
          onChange={(e) =>
            updateVital("heartRate", e.target.value)
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Temperature (36.8°C)"
          value={vitals.temperature}
          onChange={(e) =>
            updateVital("temperature", e.target.value)
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Oxygen Saturation (98%)"
          value={vitals.oxygen}
          onChange={(e) =>
            updateVital("oxygen", e.target.value)
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Weight (70 kg)"
          value={vitals.weight}
          onChange={(e) =>
            updateVital("weight", e.target.value)
          }
          className="border rounded-lg p-3"
        />

        <input
          placeholder="Blood Sugar (90 mg/dL)"
          value={vitals.bloodSugar}
          onChange={(e) =>
            updateVital("bloodSugar", e.target.value)
          }
          className="border rounded-lg p-3"
        />

      </div>

    </div>
  );
}