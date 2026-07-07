"use client";

type CarePlan = {
  today: string[];
  thisWeek: string[];
  warnings: string[];
};

function generateCarePlan(): CarePlan | null {
  if (typeof window === "undefined") return null;

  const week = Number(localStorage.getItem("pregnancyWeek") || 0);
  const bp = JSON.parse(localStorage.getItem("latestBP") || "{}");
  const symptoms = JSON.parse(localStorage.getItem("currentSymptoms") || "[]");

  const plan: CarePlan = {
    today: [],
    thisWeek: [],
    warnings: [],
  };

  if (week > 0) {
    plan.today.push(`Continue pregnancy care for Week ${week}`);
    plan.thisWeek.push("Attend your antenatal appointment");
    plan.thisWeek.push("Drink at least 2 litres of water daily");
  }

  if (bp.systolic >= 140 || bp.diastolic >= 90) {
    plan.warnings.push("High blood pressure detected. Monitor closely.");
  }

  if (symptoms.includes("Fever")) {
    plan.warnings.push("Monitor temperature and hydration.");
  }

  return plan;
}

export default function AICarePlan() {
  const plan = generateCarePlan();

  if (!plan) return null;

  return (
    <div className="rounded-2xl bg-white shadow p-5">

      <h2 className="text-xl font-bold text-pink-600">
        📋 AI Care Plan
      </h2>

      <div className="mt-5">

        <h3 className="font-bold">
          Today
        </h3>

        <ul className="list-disc ml-6">
          {plan.today.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

      </div>

      <div className="mt-5">

        <h3 className="font-bold">
          This Week
        </h3>

        <ul className="list-disc ml-6">
          {plan.thisWeek.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>

      </div>

      {plan.warnings.length > 0 && (

        <div className="mt-5 rounded-xl bg-red-50 p-4">

          <h3 className="font-bold text-red-600">
            Warnings
          </h3>

          <ul className="list-disc ml-6">

            {plan.warnings.map((item, i) => (
              <li key={i}>{item}</li>
            ))}

          </ul>

        </div>

      )}

    </div>
  );
}