"use client";

import { useEffect, useMemo, useState } from "react";
import { getUpcomingVaccines, markVaccineCompleted, syncVaccinationAgent } from "../../lib/vaccinations/vaccinationAgent";

interface VaccineCard {
  id: string;
  name: string;
  dueAt: string;
  status: "scheduled" | "overdue" | "completed";
}

export default function VaccinationSchedule() {
  const [vaccines, setVaccines] = useState<VaccineCard[]>([]);

  const refreshVaccines = () => {
    const result = syncVaccinationAgent();
    setVaccines(
      result.schedule.map((record) => ({
        id: record.id,
        name: record.name,
        dueAt: record.dueAt,
        status: record.status,
      }))
    );
  };

  useEffect(() => {
    refreshVaccines();
  }, []);

  function completeVaccine(name: string) {
    markVaccineCompleted(name);
    refreshVaccines();
  }

  const sortedVaccines = useMemo(
    () => [...vaccines].sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime()),
    [vaccines]
  );

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="text-xl font-bold text-blue-700">💉 Vaccination Schedule</h2>
      <div className="mt-5 space-y-3">
        {sortedVaccines.map((vaccine) => (
          <div key={vaccine.id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h3 className="font-semibold">{vaccine.name}</h3>
              <p className="text-sm text-gray-500">Due {new Date(vaccine.dueAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span
                className={`rounded-full px-3 py-1 text-sm ${
                  vaccine.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : vaccine.status === "overdue"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {vaccine.status}
              </span>
              {vaccine.status !== "completed" && (
                <button
                  onClick={() => completeVaccine(vaccine.name)}
                  className="mt-2 block rounded bg-blue-600 px-3 py-1 text-xs text-white"
                >
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}