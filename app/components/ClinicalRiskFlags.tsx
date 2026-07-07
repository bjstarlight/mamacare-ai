"use client";

import { useEffect, useState } from "react";

export default function ClinicalRiskFlags() {
  const [flags, setFlags] = useState<string[]>([]);

  useEffect(() => {
    const mother =
      JSON.parse(localStorage.getItem("motherProfile") || "{}");

    const baby =
      JSON.parse(localStorage.getItem("babyProfile") || "{}");

    const risks: string[] = [];

    if (!mother.bloodGroup)
      risks.push("⚠ Blood group not recorded");

    if (!baby.name)
      risks.push("⚠ Baby profile incomplete");

    if (!baby.dob)
      risks.push("⚠ Date of birth missing");

    if (risks.length === 0)
      risks.push("✅ No major clinical flags.");

    setFlags(risks);
  }, []);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5">
      <h2 className="font-bold text-red-700">
        🚨 Clinical Risk Flags
      </h2>

      <ul className="mt-3 space-y-2">
        {flags.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}