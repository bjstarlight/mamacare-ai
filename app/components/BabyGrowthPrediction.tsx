"use client";

import { useEffect, useState } from "react";
import { runAIOrchestrator } from "../lib/AIOrchestrator";

export default function BabyGrowthPrediction() {
  const [prediction, setPrediction] = useState("");

  useEffect(() => {
    const baby =
      JSON.parse(localStorage.getItem("babyProfile") || "{}");

    const age =
      localStorage.getItem("babyAgeText") || "";

      runAIOrchestrator();
    if (!baby.name) {
      setPrediction("Complete your baby's profile to receive AI growth predictions.");
      return;
    }

    if (age.includes("week")) {
      setPrediction(
        "Your baby should begin gaining weight steadily. Continue exclusive breastfeeding if possible."
      );
    } else if (age.includes("month")) {
      setPrediction(
        "Your baby's motor skills are expected to improve over the coming weeks. Encourage tummy time and interactive play."
      );
    } else {
      setPrediction(
        "Growth prediction unavailable."
      );
    }
  }, []);

  return (
    <div className="rounded-2xl bg-green-50 border border-green-200 p-5 shadow">
      <h2 className="font-bold text-green-700 text-lg">
        📈 AI Growth Prediction
      </h2>

      <p className="mt-3 text-gray-700">
        {prediction}
      </p>
    </div>
  );
}