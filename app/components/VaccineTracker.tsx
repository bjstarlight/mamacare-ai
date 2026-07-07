"use client";

import { useState } from "react";
import { Syringe, CheckCircle2 } from "lucide-react";

type Vaccine = {
  age: string;
  vaccines: string[];
};

type VaccineTrackerProps = {
  babyAge: string;
  setBabyAge: (age: string) => void;
  dueVaccines: string[];
  checkVaccines: () => void;
  vaccines: Vaccine[];
};

export default function VaccineTracker({
  babyAge,
  setBabyAge,
  dueVaccines,
  checkVaccines,
  vaccines,
}: VaccineTrackerProps) {
  // Fixed: previously there was no way to tell "haven't checked yet"
  // apart from "checked, and nothing is due" — both looked identical
  // (nothing shown). This tracks whether the button has been pressed
  // so we can show an explicit "no vaccines due" message when needed.
  const [hasChecked, setHasChecked] = useState(false);

  function handleCheck() {
    setHasChecked(true);
    checkVaccines();
  }

  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-emerald-50/60 p-6">
      <div className="flex items-center gap-2">
        <Syringe className="h-6 w-6 text-emerald-700" />
        <h2 className="text-2xl font-bold text-emerald-700">
          Baby Vaccination Tracker
        </h2>
      </div>

      <p className="mt-2 text-[#4a3d33]">
        Select your baby's age to see the vaccines that are due.
      </p>

      <select
        value={babyAge}
        onChange={(e) => {
          setBabyAge(e.target.value);
          setHasChecked(false);
        }}
        className="mt-4 w-full rounded-xl border border-[#E0D5CC] p-3 focus:outline-none focus:ring-2 focus:ring-emerald-600"
      >
        <option value="">Select baby's age</option>

        {vaccines.map((vaccine) => (
          <option key={vaccine.age} value={vaccine.age}>
            {vaccine.age}
          </option>
        ))}
      </select>

      <button
        onClick={handleCheck}
        disabled={!babyAge}
        className="mt-4 rounded-xl bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors"
      >
        Show Due Vaccines
      </button>

      {hasChecked && dueVaccines.length > 0 && (
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm border border-[#EFE4DC]">
          <h3 className="font-bold text-emerald-700">
            Vaccines Due
          </h3>

          <ul className="mt-3 space-y-2">
            {dueVaccines.map((vaccine) => (
              <li key={vaccine} className="flex items-center gap-2 text-[#2B2118]">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                {vaccine}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasChecked && dueVaccines.length === 0 && (
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm border border-[#EFE4DC]">
          <p className="text-sm text-[#4a3d33]">
            No vaccines are due at this age.
          </p>
        </div>
      )}
    </div>
  );
}