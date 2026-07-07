"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  TestTube,
  CalendarClock,
} from "lucide-react";

export default function AIClinicalDecisionSupport() {
  const [week, setWeek] = useState(0);
  const [bp, setBp] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [risk, setRisk] = useState("Low");

  useEffect(() => {
    const mother =
      JSON.parse(localStorage.getItem("motherProfile") || "{}");

    setBp(mother.bp || "120/80");
    setBloodGroup(mother.bloodGroup || "-");

    const pregnancyWeek =
      Number(localStorage.getItem("pregnancyWeek")) || 0;

    setWeek(pregnancyWeek);

    if (mother.aiRisk) {
      setRisk(mother.aiRisk);
    }
  }, []);

  const alerts = [];

  if (bp.includes("140"))
    alerts.push("Possible hypertension.");

  if (week >= 28)
    alerts.push("Increase fetal movement monitoring.");

  if (bloodGroup === "O-")
    alerts.push("Rh-negative pregnancy. Monitor antibody status.");

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-6">

      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-7 h-7 text-blue-600"/>
        <div>
          <h2 className="font-bold text-xl">
            AI Clinical Decision Support
          </h2>

          <p className="text-gray-500 text-sm">
            AI-generated recommendations for clinicians
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">

        <div className="rounded-xl bg-green-50 p-5 border">

          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="text-green-600"/>
            <h3 className="font-semibold">
              Overall Assessment
            </h3>
          </div>

          <p className="text-lg font-bold text-green-700">
            {risk} Risk Pregnancy
          </p>

        </div>

        <div className="rounded-xl bg-yellow-50 p-5 border">

          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="text-yellow-600"/>
            <h3 className="font-semibold">
              Alerts
            </h3>
          </div>

          {alerts.length === 0 ? (
            <p>No significant alerts.</p>
          ) : (
            <ul className="space-y-2">
              {alerts.map((item,index)=>(
                <li key={index}>• {item}</li>
              ))}
            </ul>
          )}

        </div>

        <div className="rounded-xl bg-blue-50 p-5 border">

          <div className="flex items-center gap-2 mb-3">
            <TestTube className="text-blue-600"/>
            <h3 className="font-semibold">
              Suggested Tests
            </h3>
          </div>

          <ul className="space-y-2">
            <li>• CBC</li>
            <li>• Urinalysis</li>
            <li>• Blood Glucose</li>
          </ul>

        </div>

        <div className="rounded-xl bg-purple-50 p-5 border">

          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="text-purple-600"/>
            <h3 className="font-semibold">
              Recommended Actions
            </h3>
          </div>

          <ul className="space-y-2">
            <li>• Continue ANC follow-up</li>
            <li>• Monitor BP weekly</li>
            <li>• Continue Iron & Folate</li>
            <li>• Review in 7 days</li>
          </ul>

        </div>

      </div>

      <div className="mt-6 rounded-xl bg-slate-900 text-white p-5">

        <div className="flex justify-between">

          <span>AI Confidence</span>

          <span className="font-bold text-green-400">
            94%
          </span>

        </div>

      </div>

    </div>
  );
}