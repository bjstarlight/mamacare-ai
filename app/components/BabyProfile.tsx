"use client";

import { useState, useEffect } from "react";
import { Baby, CheckCircle2 } from "lucide-react";
import { syncVaccinationAgent } from "../lib/vaccinations/vaccinationAgent";

type StoredBabyProfile = {
  name?: string;
  dob?: string;
  gender?: string;
  age?: string;
  createdAt?: string;
  birthWeight?: string;
  bloodGroup?: string;
  deliveryType?: string;
  apgarScore?: string;
  highRisk?: boolean;
  [key: string]: unknown;
};

function computeAge(dob: string): string {
  if (!dob) return "";

  const birth = new Date(dob);
  const today = new Date();

  const diffDays = Math.floor(
    (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 0) return "";

  const weeks = Math.floor(diffDays / 7);
  const months = Math.floor(diffDays / 30);

  return months >= 1
    ? `${months} month${months > 1 ? "s" : ""}`
    : `${weeks} week${weeks !== 1 ? "s" : ""}`;
}

export default function BabyProfile() {
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [saved, setSaved] = useState(false);
  const [babyAge, setBabyAge] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = window.localStorage.getItem("babyProfile");

    if (profile) {
      const data = JSON.parse(profile);

      setName(data.name || "");
      setDob(data.dob || "");
      setGender(data.gender || "");
    }

    const savedAge = window.localStorage.getItem("babyAgeText");

    if (savedAge) {
      setBabyAge(savedAge);
    }

    if (!window.localStorage.getItem("babyMedicalRecord")) {
      window.localStorage.setItem(
        "babyMedicalRecord",
        JSON.stringify({
          vaccinations: [],
          illnesses: [],
          growthRecords: [],
          aiAlerts: [],
          followUps: [],
        })
      );
    }
  }, []);

  // Fixed: this used to be defined but never called from anywhere —
  // the age preview only ever showed a stale value from a previous
  // session. Now it recalculates live whenever the date of birth
  // changes, and keeps babyAgeText in sync for SmartDashboard.
  useEffect(() => {
    if (!dob) return;

    const age = computeAge(dob);
    if (!age) return;

    setBabyAge(age);
    window.localStorage.setItem("babyAgeText", age);

    const diffDays = Math.floor(
      (new Date().getTime() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24)
    );
    window.localStorage.setItem("babyAgeDays", diffDays.toString());
  }, [dob]);

  function saveProfile() {
    if (!name.trim()) {
      setError("Please enter your baby's name before saving.");
      setSaved(false);
      return;
    }

    setError("");

    // Fixed: this used to overwrite the whole babyProfile object with
    // hardcoded blank values for birthWeight/bloodGroup/deliveryType/
    // apgarScore/highRisk — wiping out anything another part of the
    // app (e.g. a doctor's entry) had set for those fields. Now it
    // merges with whatever's already stored and only updates the
    // fields this form actually manages.
    const existing: StoredBabyProfile = JSON.parse(
      window.localStorage.getItem("babyProfile") || "{}"
    );

    const freshAge = computeAge(dob) || babyAge;

    const updatedProfile: StoredBabyProfile = {
      ...existing,
      name,
      dob,
      gender,
      age: freshAge,
      createdAt: existing.createdAt || new Date().toISOString(),
    };

    window.localStorage.setItem("babyProfile", JSON.stringify(updatedProfile));

    window.localStorage.setItem(
      "NewBabyRegistered",
      JSON.stringify({
        baby: name,
        dob,
        gender,
        timestamp: new Date().toISOString(),
      })
    );

    syncVaccinationAgent(new Date());
    setBabyAge(freshAge);
    setSaved(true);
  }

  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-white p-5">

      <div className="flex items-center gap-2">
        <Baby className="h-5 w-5 text-[#35406B]" />
        <h2 className="text-xl font-bold text-[#35406B]">
          Baby Profile
        </h2>
      </div>

      <input
        className="w-full mt-4 border border-[#E0D5CC] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#35406B]"
        placeholder="Baby's Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="date"
        className="w-full mt-4 border border-[#E0D5CC] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#35406B]"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
      />

      <select
        className="w-full mt-4 border border-[#E0D5CC] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#35406B]"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value="">Select Gender</option>
        <option>Male</option>
        <option>Female</option>
      </select>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-600">{error}</p>
      )}

      <button
        onClick={saveProfile}
        className="mt-4 bg-[#35406B] hover:bg-[#2A3354] text-white px-5 py-3 rounded-lg font-semibold transition-colors"
      >
        Save Baby Profile
      </button>

      {saved && (
        <p className="mt-4 flex items-center gap-1.5 text-emerald-700 font-semibold text-sm">
          <CheckCircle2 className="h-4 w-4" />
          Baby profile saved successfully.
        </p>
      )}

      {babyAge && (
        <div className="mt-4 rounded-lg bg-[#FBF6F1] border border-[#EFE4DC] p-4">
          <h3 className="font-bold text-[#35406B] text-sm">
            Baby Age
          </h3>
          <p className="mt-1 text-[#2B2118]">{babyAge}</p>
        </div>
      )}
    </div>
  );
}