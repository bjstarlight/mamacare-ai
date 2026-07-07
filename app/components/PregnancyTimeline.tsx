"use client";

import { useState } from "react";
import {
  UserRound,
  CalendarDays,
  Droplet,
  AlertTriangle,
  Stethoscope,
  Building2,
  PhoneCall,
  HeartPulse,
  CheckCircle2,
} from "lucide-react";
import { runAIOrchestrator } from "../lib/AIOrchestrator";
import { writeJSON, STORAGE_KEYS } from "../lib/storage/storageService";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

function weeksPregnantFromLMP(lmp: string): number | null {
  if (!lmp) return null;
  const start = new Date(lmp);
  if (Number.isNaN(start.getTime())) return null;
  const days = (Date.now() - start.getTime()) / (1000 * 60 * 60 * 24);
  if (days < 0) return null;
  return Math.floor(days / 7);
}

export default function MotherProfile() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [lmp, setLmp] = useState("");
  const [bloodGroup, setBloodGroup] = useState("Unknown");
  const [isHighRisk, setIsHighRisk] = useState(false);
  const [allergies, setAllergies] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [hospital, setHospital] = useState("");
  const [doctor, setDoctor] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactRelation, setContactRelation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [saved, setSaved] = useState(false);

  const weeksPregnant = weeksPregnantFromLMP(lmp);

  function saveProfile() {
    const profile = {
      name,
      age: age ? Number(age) : undefined,
      lmp,
      bloodGroup,
      isHighRisk,
      allergies: allergies
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      medicalConditions: medicalConditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      hospital,
      doctor,
    };

    writeJSON(STORAGE_KEYS.motherProfile, profile);

    // Bridges to the raw localStorage keys the rest of the app already
    // reads (OfflineEmergencyMode, AIClinicalDecision, ReferralSystem,
    // AICareCoordinator) — those don't go through storageService yet.
    if (weeksPregnant != null) {
      window.localStorage.setItem("pregnancyWeek", String(weeksPregnant));
    }
    if (contactName || contactPhone) {
      window.localStorage.setItem(
        "emergencyContact",
        JSON.stringify({
          name: contactName,
          relation: contactRelation,
          phone: contactPhone,
        })
      );
    }

    runAIOrchestrator();
    setSaved(true);
  }

  return (
    <div className="mt-8 rounded-2xl border border-[#EFE4DC] bg-white p-6">
      <div className="flex items-center gap-2">
        <UserRound className="h-6 w-6 text-[#B5533F]" />
        <h2 className="text-xl font-bold text-[#6B2545]">Mother Profile</h2>
      </div>

      {/* Core identity */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Mother's Name">
          <input
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Age">
          <input
            inputMode="numeric"
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="Years"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </Field>
      </div>

      {/* LMP + derived week */}
      <div className="mt-3">
        <Field label="Last Menstrual Period (LMP)" icon={CalendarDays}>
          <input
            type="date"
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
          />
        </Field>
        {weeksPregnant != null && (
          <p className="mt-1.5 text-sm font-medium text-[#B5533F]">
            ≈ {weeksPregnant} weeks pregnant, based on LMP.
          </p>
        )}
      </div>

      {/* Medical basics */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Blood Group" icon={Droplet}>
          <select
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          >
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </Field>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            High-Risk Pregnancy
          </label>
          <button
            onClick={() => setIsHighRisk((v) => !v)}
            className={`mt-1 flex w-full items-center gap-2 rounded-lg border p-3 text-sm font-medium ${
              isHighRisk
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-[#EFE4DC] text-[#8a7a6d] hover:bg-[#FFF9F4]"
            }`}
          >
            <HeartPulse className="h-4 w-4" />
            {isHighRisk ? "Marked as high-risk" : "Not marked high-risk"}
          </button>
        </div>
      </div>

      <div className="mt-3">
        <Field label="Allergies (comma-separated)" icon={AlertTriangle}>
          <input
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="e.g. Penicillin, Latex"
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Medical Conditions (comma-separated)" icon={Stethoscope}>
          <input
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="e.g. Gestational diabetes"
            value={medicalConditions}
            onChange={(e) => setMedicalConditions(e.target.value)}
          />
        </Field>
      </div>

      {/* Care team */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Hospital" icon={Building2}>
          <input
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
          />
        </Field>
        <Field label="Doctor">
          <input
            className="w-full rounded-lg border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            value={doctor}
            onChange={(e) => setDoctor(e.target.value)}
          />
        </Field>
      </div>

      {/* Emergency contact */}
      <div className="mt-5 rounded-xl border border-[#EFE4DC] bg-[#FFF9F4] p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
          <PhoneCall className="h-3.5 w-3.5" />
          Emergency Contact
        </p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <input
            className="rounded-lg border border-[#EFE4DC] p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="Name"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />
          <input
            className="rounded-lg border border-[#EFE4DC] p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="Relation"
            value={contactRelation}
            onChange={(e) => setContactRelation(e.target.value)}
          />
          <input
            type="tel"
            className="rounded-lg border border-[#EFE4DC] p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="Phone"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={saveProfile}
        disabled={!name}
        className="mt-5 rounded-lg bg-[#6B2545] px-5 py-3 font-semibold text-white hover:bg-[#7A2E52] disabled:cursor-not-allowed disabled:bg-[#EFE4DC] disabled:text-[#a89887]"
      >
        Save Profile
      </button>

      {saved && (
        <p className="mt-4 flex items-center gap-1.5 font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Mother profile saved
        </p>
      )}
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: typeof Droplet;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </label>
      <div className="mt-1">{children}</div>
    </div>
  );
}