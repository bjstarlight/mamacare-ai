"use client";

import { useState } from "react";

export default function EmergencyRisk() {
  const [symptoms, setSymptoms] = useState("");
  const [risk, setRisk] = useState("");
  const [message, setMessage] = useState("");

  async function analyzeRisk() {
  if (!symptoms.trim()) return;

  setRisk("🤖 Analyzing...");
  setMessage("Please wait while MamaCare AI reviews your symptoms...");

  try {
    const response = await fetch("/api/analyze-symptoms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await response.json();

    let aiResult = data.result;

    // Remove Markdown code fences if Gemini returns them
    aiResult = aiResult.replace(/```json/g, "").replace(/```/g, "").trim();

    const result = JSON.parse(aiResult);

    if (result.risk === "HIGH") {
      setRisk("🔴 HIGH RISK");
    } else if (result.risk === "MODERATE") {
      setRisk("🟠 MODERATE RISK");
    } else {
      setRisk("🟢 LOW RISK");
    }

    setMessage(result.advice);

  } catch (error) {
    setRisk("⚠️ Error");
    setMessage("Unable to analyze symptoms. Please try again.");
  }
}

  return (
    <div className="rounded-2xl bg-white shadow-lg p-6 mt-8">
      <h2 className="text-2xl font-bold text-red-600">
        🚨 AI Emergency Risk Checker
      </h2>

      <p className="text-gray-600 mt-2">
        Describe how you are feeling today.
      </p>

      <textarea
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        placeholder="Example: I have severe headache and blurred vision..."
        className="w-full mt-4 rounded-lg border p-4 h-32"
      />

      <button
        onClick={analyzeRisk}
        className="mt-4 rounded-lg bg-red-600 px-6 py-3 text-white hover:bg-red-700"
      >
        Analyze Symptoms
      </button>

      {risk && (
        <div className="mt-6 rounded-xl border p-5 bg-gray-50">
          <h3 className="text-2xl font-bold">{risk}</h3>

          <p className="mt-3">{message}</p>
        </div>
      )}
    </div>
  );
}