"use client";

import { useState } from "react";

export default function SOAPNotes() {
  const [notes, setNotes] = useState("");

  async function generateSOAP() {
    const mother =
      JSON.parse(localStorage.getItem("motherProfile") || "{}");

    const baby =
      JSON.parse(localStorage.getItem("babyProfile") || "{}");

    const prompt = `
Generate a professional SOAP clinical note.

Mother:
${JSON.stringify(mother)}

Baby:
${JSON.stringify(baby)}

Format exactly as:

S:
O:
A:
P:

Keep it concise and evidence-based.
`;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: prompt,
      }),
    });

    const data = await res.json();

    setNotes(data.reply);
  }

  return (
    <div className="rounded-2xl bg-white shadow p-6">

      <h2 className="text-2xl font-bold text-pink-600">
        🩺 AI SOAP Notes
      </h2>

      <button
        onClick={generateSOAP}
        className="mt-5 rounded-xl bg-pink-600 px-6 py-3 text-white"
      >
        Generate SOAP Note
      </button>

      {notes && (
        <pre className="mt-6 whitespace-pre-wrap rounded-xl bg-gray-100 p-5">
          {notes}
        </pre>
      )}

    </div>
  );
}