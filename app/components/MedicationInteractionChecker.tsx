"use client";

import { useState } from "react";

export default function MedicationInteractionChecker() {

  const [medications, setMedications] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  async function checkInteractions()
   {

    const mother = JSON.parse(
  localStorage.getItem("motherProfile") || "{}"
);

const baby = JSON.parse(
  localStorage.getItem("babyProfile") || "{}"
);

const prompt = `
You are an experienced clinical pharmacist.

Patient Details:
${JSON.stringify(mother)}

Baby Details:
${JSON.stringify(baby)}

Current medications:
${medications}

Analyse:

1. Drug interactions
2. Pregnancy safety
3. Breastfeeding safety
4. Contraindications
5. Monitoring advice
6. Safer alternatives if any

Use evidence-based recommendations and explain in simple language.
`;}

  return (

    <div className="rounded-2xl bg-white shadow-lg p-6">

      <h2 className="text-2xl font-bold text-pink-600">
        💊 Medication Interaction Checker
      </h2>

      <textarea

        value={medications}

        onChange={(e)=>setMedications(e.target.value)}

        placeholder="Enter one medication per line..."

        className="mt-5 w-full rounded-xl border p-4 h-40"

      />

      <button

        onClick={checkInteractions}

        className="mt-4 rounded-xl bg-pink-600 px-6 py-3 text-white"

      >

        {loading ? "Checking..." : "Check Medications"}

      </button>

      {result && (

        <div className="mt-6 rounded-xl bg-gray-100 p-5 whitespace-pre-wrap">

          {result}

        </div>

      )}

    </div>

  );

}