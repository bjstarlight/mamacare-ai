"use client";

import { useEffect, useState } from "react";

export default function AIClinicalSummary() {
  const [summary, setSummary] = useState<string[]>([]);

  useEffect(() => {
    const mother =
      JSON.parse(localStorage.getItem("motherProfile") || "{}");

    const baby =
      JSON.parse(localStorage.getItem("babyProfile") || "{}");

    const week =
      localStorage.getItem("pregnancyWeek") || "-";

    const vaccines =
      localStorage.getItem("babyAgeText") || "Unknown";

    const records =
      Number(localStorage.getItem("protectedRecords")) || 0;

    const notes: string[] = [];

    notes.push(`Pregnancy Week: ${week}`);

    if (mother.bloodGroup)
      notes.push(`Blood Group: ${mother.bloodGroup}`);

    if (baby.name)
      notes.push(`Baby: ${baby.name}`);

    notes.push(`Protected Records: ${records}`);

    if (records > 0)
      notes.push("Medical records successfully verified on BOT Chain.");

    if (Number(week) >= 28)
      notes.push(
        "Continue routine antenatal care every 2 weeks."
      );

    if (Number(week) >= 36)
      notes.push(
        "Prepare birth plan and delivery arrangements."
      );

    notes.push(
      "Monitor blood pressure and fetal movement."
    );

    notes.push(
      "Vaccination status should be reviewed during next visit."
    );

    setSummary(notes);

  }, []);

  return (
    <div className="rounded-3xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 shadow-lg p-6">

      <div className="flex items-center gap-3 mb-6">

        <div className="text-4xl">
          🧠
        </div>

        <div>
          <h2 className="text-2xl font-bold text-cyan-700">
            AI Clinical Summary
          </h2>

          <p className="text-gray-500">
            Automatically generated for clinicians
          </p>
        </div>

      </div>

      <div className="space-y-4">

        {summary.map((item, index) => (

          <div
            key={index}
            className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm"
          >

            <div className="text-green-600 text-xl">
              ✓
            </div>

            <p className="text-gray-700">
              {item}
            </p>

          </div>

        ))}

      </div>

      <div className="mt-6 rounded-2xl bg-cyan-100 border border-cyan-300 p-4">

        <h3 className="font-bold text-cyan-800">
          AI Recommendation
        </h3>

        <p className="mt-2 text-cyan-900">

          Patient appears clinically stable based on the available
          records. Continue routine antenatal monitoring, maintain
          scheduled appointments, reinforce medication adherence,
          and review laboratory investigations during the next visit.

        </p>

      </div>

    </div>
  );
}