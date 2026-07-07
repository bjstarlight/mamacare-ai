"use client";

import { useEffect, useState } from "react";

interface GrowthRecord {
  date: string;
  weight: number;
  height: number;
  headCircumference: number;
}

export default function GrowthTracker() {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [head, setHead] = useState("");

  const [records, setRecords] = useState<GrowthRecord[]>([]);

  const [analysis, setAnalysis] = useState("");

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("babyGrowth") || "[]"
    );

    setRecords(saved);
  }, []);

  function analyzeGrowth(
    weightValue: number,
    heightValue: number
  ) {

    if (weightValue < 2.5) {
      return "⚠️ Low birth weight detected. AI recommends immediate pediatric review.";
    }

    if (weightValue > 20) {
      return "⚠️ Weight is unusually high for infancy. Growth assessment recommended.";
    }

    if (heightValue < 45) {
      return "⚠️ Height appears below expected range. Monitor growth closely.";
    }

    return "✅ Growth appears normal based on current measurements.";
  }

  function saveGrowth() {

    const record = {

      date: new Date().toLocaleDateString(),

      weight: Number(weight),

      height: Number(height),

      headCircumference: Number(head),

    };

    const updated = [...records, record];

    localStorage.setItem(
      "babyGrowth",
      JSON.stringify(updated)
    );

    const aiResult = analyzeGrowth(
      Number(weight),
      Number(height)
    );

    setAnalysis(aiResult);

    localStorage.setItem(
      "latestGrowthAnalysis",
      aiResult
    );

    const logs = JSON.parse(
      localStorage.getItem("blockchainLogs") || "[]"
    );

    logs.push({

      id: crypto.randomUUID(),

      type: "BABY_GROWTH_UPDATED",

      weight,

      height,

      head,

      aiAssessment: aiResult,

      timestamp: new Date().toISOString(),

    });

    localStorage.setItem(
      "blockchainLogs",
      JSON.stringify(logs)
    );

    setRecords(updated);

    setWeight("");

    setHeight("");

    setHead("");

  }

  return (

    <div className="rounded-xl bg-white border p-5">

      <h2 className="text-xl font-bold text-blue-700">

        📈 AI Growth Checker

      </h2>

      <input

        className="w-full border rounded-lg p-3 mt-4"

        placeholder="Weight (kg)"

        value={weight}

        onChange={(e)=>setWeight(e.target.value)}

      />

      <input

        className="w-full border rounded-lg p-3 mt-3"

        placeholder="Height (cm)"

        value={height}

        onChange={(e)=>setHeight(e.target.value)}

      />

      <input

        className="w-full border rounded-lg p-3 mt-3"

        placeholder="Head Circumference (cm)"

        value={head}

        onChange={(e)=>setHead(e.target.value)}

      />

      <button

        onClick={saveGrowth}

        className="mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg"

      >

        Save Growth Record

      </button>

      {analysis && (

        <div className="mt-5 rounded-lg bg-blue-50 border p-4">

          <h3 className="font-bold text-blue-700">

            🤖 AI Growth Assessment

          </h3>

          <p className="mt-2">

            {analysis}

          </p>

        </div>

      )}

      <div className="mt-6">

        <h3 className="font-bold">

          Growth History

        </h3>

        {records.map((record,index)=>(

          <div

            key={index}

            className="border rounded-lg p-3 mt-3"

          >

            <p>

              📅 {record.date}

            </p>

            <p>

              ⚖️ {record.weight} kg

            </p>

            <p>

              📏 {record.height} cm

            </p>

            <p>

              🧠 {record.headCircumference} cm

            </p>

          </div>

        ))}

      </div>

    </div>

  );

}