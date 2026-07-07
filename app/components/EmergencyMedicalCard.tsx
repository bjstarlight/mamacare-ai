"use client";

import { useEffect, useState } from "react";

export default function EmergencyMedicalCard() {
  const [mother, setMother] = useState<any>({});
  const [baby, setBaby] = useState<any>({});
  const [week, setWeek] = useState("");

  useEffect(() => {
    setMother(JSON.parse(localStorage.getItem("motherProfile") || "{}"));
    setBaby(JSON.parse(localStorage.getItem("babyProfile") || "{}"));
    setWeek(localStorage.getItem("pregnancyWeek") || "");
  }, []);

  return (
    <div className="rounded-3xl bg-red-600 text-white shadow-xl p-6">

      <h2 className="text-2xl font-bold">
        🚑 Emergency Medical Card
      </h2>

      <p className="opacity-90 mt-2">
        Show this immediately to any healthcare worker.
      </p>

      <div className="grid md:grid-cols-2 gap-4 mt-6">

        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm opacity-80">Patient</p>
          <p className="font-bold">{mother.name}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm opacity-80">Pregnancy</p>
          <p className="font-bold">{week} Weeks</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm opacity-80">Blood Group</p>
          <p className="font-bold">{mother.bloodGroup}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          <p className="text-sm opacity-80">AI Risk</p>
          <p className="font-bold">{mother.aiRisk || "Unknown"}</p>
        </div>

        <div className="bg-white/10 rounded-xl p-4 md:col-span-2">
          <p className="text-sm opacity-80">Emergency Contact</p>
          <p className="font-bold">{mother.emergencyContact}</p>
        </div>

      </div>

    </div>
  );
}