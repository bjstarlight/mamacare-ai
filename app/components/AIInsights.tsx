"use client";

import { useEffect, useState } from "react";

export default function AIInsights() {
  const [insight, setInsight] = useState("Loading AI insights...");

  useEffect(() => {
    const mother = JSON.parse(
      localStorage.getItem("motherProfile") || "{}"
    );

    const baby = JSON.parse(
      localStorage.getItem("babyProfile") || "{}"
    );

    const pregnancyWeek =
      localStorage.getItem("pregnancyWeek") || "";

    let message = "";

    if (pregnancyWeek) {
      message = `🤰 You are ${pregnancyWeek} weeks pregnant. Continue attending antenatal care and maintain a healthy diet.`;
    }

    if (baby.name) {
      message = `👶 ${baby.name} is growing well. Continue exclusive breastfeeding and keep vaccinations up to date.`;
    }

    if (mother.name) {
      message = `Hello ${mother.name}! ${message}`;
    }

    if (!message) {
      message =
        "Complete your profile to receive personalized AI insights.";
    }

    setInsight(message);
  }, []);

  return (
    <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-6 shadow">
      <h2 className="text-xl font-bold text-indigo-700">
        🤖 AI Health Insights
      </h2>

      <p className="mt-4 text-gray-700">
        {insight}
      </p>
    </div>
  );
}