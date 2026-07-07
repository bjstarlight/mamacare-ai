import { recordConsentEvent } from "./blockchain/consentChain";

export interface CarePlan {
  today: string[];
  thisWeek: string[];
  warnings: string[];
}

export function generateCarePlan() {
  if (typeof window === "undefined") return null;

  const week = Number(localStorage.getItem("pregnancyWeek") || 0);

  const bp = JSON.parse(
    localStorage.getItem("latestBP") || "{}"
  );

  const symptoms = JSON.parse(
    localStorage.getItem("currentSymptoms") || "[]"
  );

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
    plan.warnings.push(
      "High blood pressure detected. Monitor closely."
    );
  }

  if (symptoms.includes("Fever")) {
    plan.warnings.push(
      "Monitor temperature and hydration."
    );
  }

  void recordConsentEvent({
    eventType: "care_plan_created",
    category: "CareEvent",
    patientRef: `mother:${localStorage.getItem("motherProfile") ? "known" : "unknown"}`,
    actor: "ai-care-plan",
    consentGranted: true,
    metadata: { today: plan.today, thisWeek: plan.thisWeek, warnings: plan.warnings },
  });

  return plan;
}