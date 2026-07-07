"use client";

import { useEffect, useState } from "react";

export default function ConsultationNotes() {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("consultationNotes");
    if (saved) setNotes(saved);
  }, []);

  function saveNotes(value: string) {
    setNotes(value);
    localStorage.setItem("consultationNotes", value);
  }

  return (
    <div className="rounded-2xl bg-white shadow p-5">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        📝 Consultation Notes
      </h2>

      <textarea
        value={notes}
        onChange={(e) => saveNotes(e.target.value)}
        placeholder="Doctor's examination findings..."
        className="w-full rounded-xl border p-4 h-40"
      />

      <p className="text-gray-500 mt-3">
        Notes are automatically saved.
      </p>
    </div>
  );
}