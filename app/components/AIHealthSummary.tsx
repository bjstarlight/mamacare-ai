"use client";

import { useEffect, useState } from "react";

export default function AIHealthSummary() {
  const [summary, setSummary] = useState("");

  useEffect(() => {
    const mother =
      JSON.parse(localStorage.getItem("motherProfile") || "{}");

    const baby =
      JSON.parse(localStorage.getItem("babyProfile") || "{}");

    const appointments =
      JSON.parse(localStorage.getItem("appointments") || "[]");

    let advice = "Everything looks good today. ";

    if (!mother.name)
      advice += "Please complete your mother profile. ";

    if (!baby.name)
      advice += "Add your baby's information. ";

    if (appointments.length === 0)
      advice += "You have no upcoming appointments.";

    if (appointments.length > 0)
      advice += `Your next appointment is ${appointments[0].date}.`;

    setSummary(advice);
  }, []);

  return (
    <div className="rounded-2xl bg-indigo-50 border border-indigo-200 p-5 shadow">
      <h2 className="font-bold text-indigo-700 text-lg">
        🤖 AI Daily Summary
      </h2>

      <p className="mt-3 text-gray-700">
        {summary}
      </p>
    </div>
  );
}