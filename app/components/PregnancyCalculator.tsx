"use client";
import { pregnancyAdvice } from "../data/pregnancyAdvice";
import { useState } from "react";

export default function PregnancyCalculator() {
  const [lmp, setLmp] = useState("");
  const [result, setResult] = useState("");

  function calculateEDD() {
    if (!lmp) return;

    const lmpDate = new Date(lmp);

    const dueDate = new Date(lmpDate);
    dueDate.setDate(dueDate.getDate() + 280);

    const today = new Date();

    const diff =
      today.getTime() - lmpDate.getTime();

   const weeks = Math.max(
  0,
  Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
);
const advice = pregnancyAdvice.find(
    (item) => weeks >= item.min && weeks <= item.max
);
    let trimester = "";

    if (weeks <= 13) {
      trimester = "First Trimester";
    } else if (weeks <= 27) {
      trimester = "Second Trimester";
    } else {
      trimester = "Third Trimester";
    }

    setResult(`
Estimated Due Date:
${dueDate.toDateString()}

Current Pregnancy:
${weeks} weeks

${trimester}

${advice?.advice ?? "Please consult your healthcare provider for individualized advice."}
`);
  }

  return (
    <div className="mt-8 rounded-xl border p-5 bg-pink-50">

      <h2 className="text-xl font-bold text-pink-600">
        🤰 Pregnancy Due Date Calculator
      </h2>

      <p className="text-gray-600 mt-2">
        Enter the first day of your last menstrual period (LMP).
      </p>

      <input
        type="date"
        value={lmp}
        onChange={(e) => setLmp(e.target.value)}
        className="mt-4 border rounded-lg p-3 w-full"
      />

      <button
        onClick={calculateEDD}
        className="mt-4 bg-pink-600 text-white rounded-lg px-5 py-3"
      >
        Calculate Due Date
      </button>

      {result && (
        <div className="mt-5 rounded-lg bg-white p-4 border">
          <pre className="whitespace-pre-wrap">
            {result}
          </pre>
        </div>
      )}

    </div>
  );
}