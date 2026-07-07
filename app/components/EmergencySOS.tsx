"use client";

import Link from "next/link";
import { AlertTriangle, PhoneCall, Siren, Truck } from "lucide-react";
import { runAIOrchestrator } from "../lib/AIOrchestrator";
import { writeString, STORAGE_KEYS } from "../lib/storage/storageService";
import EmergencyMedicalCard from "./EmergencyMedicalCard";

type EmergencySOSProps = {
  onNavigate?: (section: string) => void;
};

export default function EmergencySOS({ onNavigate }: EmergencySOSProps) {
  function callEmergency() {
    window.location.href = "tel:112";
  }

  function triggerSOS() {
    writeString(STORAGE_KEYS.EmergencyMode, "true");
    writeString(STORAGE_KEYS.EmergencySOS, "true");
    runAIOrchestrator();
    onNavigate?.("emergency");
  }

  return (
    <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-6">
      <div className="flex items-center gap-2">
        <Siren className="h-6 w-6 text-red-600" />
        <h2 className="text-2xl font-bold text-red-700">Emergency SOS</h2>
      </div>

      <p className="mt-3 text-red-900/80">
        If you or your baby needs urgent medical attention, tap the emergency
        button below. AI will analyze risk and alert hospitals automatically.
      </p>

      <button
        onClick={triggerSOS}
        aria-label="Trigger emergency SOS"
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 py-4 text-xl font-bold text-white shadow-md transition hover:bg-red-700 active:scale-[0.98] focus:outline-none focus-visible:ring-4 focus-visible:ring-red-300"
      >
        <Siren className="h-6 w-6" />
        Trigger SOS + AI Analysis
      </button>

      <button
        onClick={callEmergency}
        aria-label="Call emergency services"
        className="mt-3 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-600 py-3 text-lg font-semibold text-red-700 transition hover:bg-red-100"
      >
        <PhoneCall className="h-5 w-5" />
        Call 112
      </button>

      <EmergencyMedicalCard />

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <button
          type="button"
          onClick={callEmergency}
          className="rounded-xl bg-green-600 py-4 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          Call Emergency Contact
        </button>
        <button
          type="button"
          onClick={() => onNavigate?.("emergency")}
          className="rounded-xl bg-blue-600 py-4 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Find Nearest Hospital
        </button>
        <Link
          href="/ambulance"
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-4 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          <Truck className="h-4 w-4" />
          Request Ambulance
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-red-100 bg-white p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <h3 className="font-bold text-red-700">Emergency Tips</h3>
        </div>
        <ul className="ml-5 mt-3 list-disc space-y-2 text-sm text-[#3a2a24]">
          <li>Stay calm.</li>
          <li>Call emergency services immediately.</li>
          <li>Keep mother and baby comfortable.</li>
          <li>Do not delay seeking medical care.</li>
        </ul>
      </div>
    </div>
  );
}
