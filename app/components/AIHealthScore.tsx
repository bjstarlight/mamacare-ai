"use client";

import { useEffect, useState } from "react";
import { readJSON, STORAGE_KEYS, subscribeStorage } from "../lib/storage/storageService";

type HealthScoreData = {
  score: number;
  risk?: string;
  summary?: string;
  recommendations?: string[];
  updatedAt?: string;
};

export default function AIHealthScore() {
  const [data, setData] = useState<HealthScoreData>({ score: 100 });
  const [status, setStatus] = useState("Excellent");
  const [color, setColor] = useState("text-emerald-600");

  function load() {
    const stored = readJSON<HealthScoreData>(STORAGE_KEYS.healthScore, { score: 100 });
    setData(stored);

    const score = stored.score;
    if (score >= 85) {
      setStatus("Excellent");
      setColor("text-emerald-600");
    } else if (score >= 65) {
      setStatus("Good");
      setColor("text-amber-600");
    } else {
      setStatus("Needs Attention");
      setColor("text-red-600");
    }
  }

  useEffect(() => {
    load();
    const unsubscribe = subscribeStorage((key) => {
      if (key === STORAGE_KEYS.healthScore || key === STORAGE_KEYS.dashboardSnapshot) {
        load();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="rounded-xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[#2B2118]">AI Health Score</h2>
      <p className="mt-1 text-xs text-[#8A7A6D]">Powered by AI agent analysis</p>

      <p className={`mt-4 text-5xl font-bold ${color}`}>{data.score}%</p>
      <p className={`mt-2 font-semibold ${color}`}>{status}</p>

      {data.risk ? (
        <p className="mt-2 text-xs text-[#6B4F3D]">
          Risk level: <span className="font-semibold">{data.risk}</span>
        </p>
      ) : null}

      {data.summary ? (
        <p className="mt-3 text-sm leading-6 text-[#5C4C40]">{data.summary}</p>
      ) : null}

      {data.recommendations && data.recommendations.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {data.recommendations.slice(0, 4).map((rec) => (
            <li
              key={rec}
              className="rounded-lg bg-[#FFF9F4] px-3 py-2 text-xs text-[#5C4C40]"
            >
              {rec}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
