"use client";

import { useEffect } from "react";
import { generateRecommendation } from "./AIDecisionEngine";
// ==========================================
// NEW BABY REGISTRATION
// ==========================================

const newBaby = localStorage.getItem("NewBabyRegistered");

if (newBaby) {

  const baby = JSON.parse(newBaby);

  localStorage.removeItem("NewBabyRegistered");

  // ----------------------------
  // Create Vaccination Schedule
  // ----------------------------

  const vaccines = [
    {
      name: "BCG",
      due: "At Birth",
      completed: false,
    },
    {
      name: "OPV 0",
      due: "At Birth",
      completed: false,
    },
    {
      name: "Hepatitis B",
      due: "At Birth",
      completed: false,
    },
    {
      name: "Pentavalent 1",
      due: "6 Weeks",
      completed: false,
    },
    {
      name: "OPV 1",
      due: "6 Weeks",
      completed: false,
    },
    {
      name: "PCV 1",
      due: "6 Weeks",
      completed: false,
    },
    {
      name: "Rotavirus 1",
      due: "6 Weeks",
      completed: false,
    }
  ];

  localStorage.setItem(
    "babyVaccinations",
    JSON.stringify(vaccines)
  );

  // ----------------------------
  // Growth Record
  // ----------------------------

  localStorage.setItem(
    "babyGrowth",
    JSON.stringify([
      {
        date: new Date().toISOString(),
        weight: "",
        height: "",
        headCircumference: "",
      }
    ])
  );

  // ----------------------------
  // AI Reminder
  // ----------------------------

  const reminders = JSON.parse(
    localStorage.getItem("notifications") || "[]"
  );

  reminders.push({
    id: crypto.randomUUID(),
    type: "Baby",
    title: "Baby Registered",
    message:
      `${baby.baby} has been registered. Vaccination schedule has been created.`,
    createdAt: new Date().toISOString(),
  });

  localStorage.setItem(
    "notifications",
    JSON.stringify(reminders)
  );

  // ----------------------------
  // Blockchain
  // ----------------------------

  const logs = JSON.parse(
    localStorage.getItem("blockchainLogs") || "[]"
  );

  logs.push({
    id: crypto.randomUUID(),
    type: "BABY_REGISTERED",
    baby: baby.baby,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(
    "blockchainLogs",
    JSON.stringify(logs)
  );

}
export default function AICareCoordinator() {
  useEffect(() => {
    const interval = setInterval(() => {
      const pending = localStorage.getItem("EmergencySOSPending");

      if (!pending) return;

      const emergency = JSON.parse(pending);
      const recommendation = generateRecommendation(
    emergency.analysis.severity,
    emergency.analysis.diagnosis
);

      // Prevent duplicate processing
      localStorage.removeItem("EmergencySOSPending");

      // -----------------------------
      // 1. CREATE SOS RECORD
      // -----------------------------
      const sos = JSON.parse(
        localStorage.getItem("EmergencySOS") || "[]"
      );

      sos.push({
        id: crypto.randomUUID(),
        mother: "Current User",
        symptoms: emergency.symptoms,
        severity: emergency.analysis.severity,
        diagnosis: emergency.analysis.diagnosis,
        status: "Pending",
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "EmergencySOS",
        JSON.stringify(sos)
      );

      // -----------------------------
      // 2. NOTIFY CHW
      // -----------------------------
      const chw = JSON.parse(
        localStorage.getItem("CHWNotifications") || "[]"
      );

      chw.push({
        id: crypto.randomUUID(),
        type: "Emergency",
        message:
          "Emergency detected. Immediate review required.",
        patient: "Current User",
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "CHWNotifications",
        JSON.stringify(chw)
      );

      // -----------------------------
      // // -----------------------------
// 3. CREATE REFERRAL
// -----------------------------
const referrals = JSON.parse(
  localStorage.getItem("referrals") || "[]"
);

referrals.push({
  id: crypto.randomUUID(),

  patient: "Current User",

  diagnosis: emergency.analysis.diagnosis,

  priority: emergency.analysis.severity,

  destinationHospital:
    recommendation.hospital?.name ?? "No Hospital Available",

  destinationUnit:
    emergency.analysis.destinationUnit,

  assignedDoctor:
    recommendation.doctor?.name ?? "Awaiting Assignment",

  confidence:
    recommendation.confidence,

  reasoning:
    recommendation.reasoning,

  status: "Pending",

  createdAt: new Date().toISOString(),
});

localStorage.setItem(
  "referrals",
  JSON.stringify(referrals)
);
      // -----------------------------
// 4. CREATE AMBULANCE REQUEST
// -----------------------------
const trips = JSON.parse(
  localStorage.getItem("ambulanceTrips") || "[]"
);

trips.push({
  id: crypto.randomUUID(),

  patient: "Current User",

  ambulance:
    recommendation.ambulance?.id ?? null,

  destination:
    recommendation.hospital?.name ?? "Unknown Hospital",

  destinationUnit:
    emergency.analysis.destinationUnit,

  assignedDoctor:
    recommendation.doctor?.name ?? "Awaiting Assignment",

  confidence:
    recommendation.confidence,

  reasoning:
    recommendation.reasoning,

  status:
    recommendation.ambulance
      ? "Awaiting Dispatch"
      : "Waiting for Ambulance",

  createdAt: new Date().toISOString(),
});

localStorage.setItem(
  "ambulanceTrips",
  JSON.stringify(trips)
);

      // -----------------------------
// 5. BLOCKCHAIN LOG
// -----------------------------
const logs = JSON.parse(
  localStorage.getItem("blockchainLogs") || "[]"
);

logs.push({
  id: crypto.randomUUID(),

  type: "AI_EMERGENCY_DETECTED",

  diagnosis:
    emergency.analysis.diagnosis,

  severity:
    emergency.analysis.severity,

  recommendedHospital:
    recommendation.hospital?.name,

  assignedDoctor:
    recommendation.doctor?.name,

  assignedAmbulance:
    recommendation.ambulance?.id,

  confidence:
    recommendation.confidence,

  reasoning:
    recommendation.reasoning,

  timestamp:
    new Date().toISOString(),
});

localStorage.setItem(
  "blockchainLogs",
  JSON.stringify(logs)
);

      // -----------------------------
      // 6. POPULATION HEALTH UPDATE
      // -----------------------------
      const analytics = JSON.parse(
        localStorage.getItem("populationHealth") ||
          '{"emergencies":0}'
      );

      analytics.emergencies =
        (analytics.emergencies || 0) + 1;

      localStorage.setItem(
        "populationHealth",
        JSON.stringify(analytics)
      );

      console.log(
        "✅ AI Care Coordinator handled emergency."
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return null;
}