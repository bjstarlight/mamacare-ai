"use client";

import { useEffect, useState } from "react";

export default function VaccineReminder() {
  const [reminder, setReminder] = useState("");

  useEffect(() => {
    const age = localStorage.getItem("babyAgeText");

    if (!age) return;

    if (age.includes("6 week")) {
      setReminder("💉 Your baby is due for the 6-week vaccines.");
    } else if (age.includes("10 week")) {
      setReminder("💉 Your baby is due for the 10-week vaccines.");
    } else if (age.includes("14 week")) {
      setReminder("💉 Your baby is due for the 14-week vaccines.");
    }
  }, []);

  if (!reminder) return null;

  return (
    <div className="rounded-xl border border-green-300 bg-green-50 p-4">
      <h2 className="font-bold text-green-700">
        Vaccine Reminder
      </h2>

      <p className="mt-2">{reminder}</p>
    </div>
  );
}