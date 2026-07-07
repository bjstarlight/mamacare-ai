"use client";

import { useEffect, useMemo, useState } from "react";
import { AlarmClock, CheckCircle2, Clock, Pill, PlusCircle, Trash2, XCircle } from "lucide-react";
import {
  markDoseStatus,
  registerMedication,
  removeMedication,
  syncMedicationSupplementAgent,
  type MedicationKind,
} from "../lib/medications/medicationSupplementAgent";

function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return time24;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function MedicationReminder() {
  const [kind, setKind] = useState<MedicationKind>("medication");
  const [medicine, setMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [scheduleTimes, setScheduleTimes] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const result = useMemo(() => syncMedicationSupplementAgent(), [refreshTick]);

  useEffect(() => {
    const timer = window.setInterval(() => setRefreshTick((value) => value + 1), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  function addScheduleTime() {
    if (!timeInput) return;
    if (scheduleTimes.includes(timeInput)) {
      setTimeInput("");
      return;
    }
    setScheduleTimes((times) => [...times, timeInput].sort((left, right) => left.localeCompare(right)));
    setTimeInput("");
  }

  function removeScheduleTime(time: string) {
    setScheduleTimes((times) => times.filter((entry) => entry !== time));
  }

  function saveMedication() {
    if (!medicine || !dosage || scheduleTimes.length === 0) return;
    registerMedication({
      kind,
      name: medicine,
      dosage,
      scheduleTimes,
      notes: notes || undefined,
    });
    setKind("medication");
    setMedicine("");
    setDosage("");
    setScheduleTimes([]);
    setNotes("");
    setRefreshTick((value) => value + 1);
  }

  function markTaken(occurrenceId: string) {
    markDoseStatus(occurrenceId, "taken");
    setRefreshTick((value) => value + 1);
  }

  function markSkipped(occurrenceId: string) {
    markDoseStatus(occurrenceId, "skipped");
    setRefreshTick((value) => value + 1);
  }

  const adherenceTone = result.adherencePercent >= 80 ? "text-emerald-700" : result.adherencePercent >= 50 ? "text-amber-700" : "text-red-700";

  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-white p-6">
      <div className="flex items-center gap-2">
        <Pill className="h-6 w-6 text-[#B5533F]" />
        <h2 className="text-2xl font-bold text-[#6B2545]">
          Medication & Supplement Agent
        </h2>
      </div>
      <p className="mt-2 text-sm text-[#6F6258]">
        Register medications, supplements, and vitamins with dosage schedules. The agent tracks adherence, missed doses, and upcoming reminders.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-[#FFF9F4] p-3">
          <p className="text-xs uppercase tracking-wide text-[#8A7A6D]">Adherence</p>
          <p className={`mt-1 text-xl font-bold ${adherenceTone}`}>{result.adherencePercent}%</p>
        </div>
        <div className="rounded-xl bg-[#FFF9F4] p-3">
          <p className="text-xs uppercase tracking-wide text-[#8A7A6D]">Missed today</p>
          <p className="mt-1 text-xl font-bold text-[#A8462C]">{result.missedDoses.length}</p>
        </div>
        <div className="rounded-xl bg-[#FFF9F4] p-3">
          <p className="text-xs uppercase tracking-wide text-[#8A7A6D]">Upcoming</p>
          <p className="mt-1 text-xl font-bold text-[#35406B]">{result.upcomingDoses.length}</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            Type
          </label>
          <select
            value={kind}
            onChange={(event) => setKind(event.target.value as MedicationKind)}
            className="mt-1 w-full rounded-xl border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
          >
            <option value="medication">Medication</option>
            <option value="supplement">Supplement</option>
            <option value="vitamin">Vitamin</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            Name
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="e.g. Iron tablet"
            value={medicine}
            onChange={(e) => setMedicine(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            Dosage
          </label>
          <input
            className="mt-1 w-full rounded-xl border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="e.g. 1 tablet, 500mg, 10ml"
            value={dosage}
            onChange={(event) => setDosage(event.target.value)}
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            Add schedule time
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="time"
              className="w-full rounded-xl border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
              value={timeInput}
              onChange={(event) => setTimeInput(event.target.value)}
            />
            <button
              type="button"
              onClick={addScheduleTime}
              className="rounded-xl border border-[#6B2545] px-4 text-sm font-semibold text-[#6B2545]"
            >
              Add
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {scheduleTimes.map((time) => (
              <button
                type="button"
                key={time}
                onClick={() => removeScheduleTime(time)}
                className="rounded-full bg-[#FFF3E9] px-3 py-1 text-xs font-semibold text-[#6B2545]"
              >
                {formatTime(time)} ×
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 min-h-20 w-full rounded-xl border border-[#EFE4DC] p-3 focus:outline-none focus:ring-2 focus:ring-[#B5533F]/40"
            placeholder="e.g. take with food"
          />
        </div>
      </div>

      <button
        onClick={saveMedication}
        disabled={!medicine || !dosage || scheduleTimes.length === 0}
        className="mt-4 flex items-center gap-2 rounded-xl bg-[#6B2545] px-5 py-3 font-semibold text-white hover:bg-[#7A2E52] disabled:cursor-not-allowed disabled:bg-[#EFE4DC] disabled:text-[#a89887]"
      >
        <PlusCircle className="h-4 w-4" />
        Save Schedule
      </button>

      <div className="mt-6">
        <h3 className="flex items-center gap-1.5 font-bold text-[#6B2545]">
          <AlarmClock className="h-4 w-4" />
          Today&apos;s Dose Schedule
        </h3>

        {result.todayDoses.length === 0 ? (
          <p className="mt-2 text-sm text-[#a89887]">
            No medication, supplement, or vitamin schedules added yet.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {result.todayDoses.map((dose) => {
              const statusTone =
                dose.status === "taken"
                  ? "bg-emerald-100 text-emerald-700"
                  : dose.status === "missed"
                    ? "bg-red-100 text-red-700"
                    : dose.status === "skipped"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-[#EFE4DC] text-[#8a7a6d]";
              return (
                <div
                  key={dose.occurrenceId}
                  className="flex items-center justify-between rounded-xl border border-[#EFE4DC] bg-[#FFF9F4] p-3"
                >
                  <div>
                    <p className="flex items-center gap-1.5 font-medium text-[#2B2118]">
                      <Pill className="h-4 w-4 text-[#B5533F]" />
                      {dose.name} • {dose.dosage}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[#8a7a6d]">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(dose.time)}
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusTone}`}
                      >
                        {dose.status}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {dose.status === "upcoming" || dose.status === "missed" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => markTaken(dose.occurrenceId)}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          <span className="inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Taken
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => markSkipped(dose.occurrenceId)}
                          className="rounded-lg bg-slate-600 px-2.5 py-1.5 text-xs font-semibold text-white"
                        >
                          <span className="inline-flex items-center gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            Skip
                          </span>
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {result.registry.length > 0 ? (
        <div className="mt-6">
          <h3 className="font-bold text-[#6B2545]">Registered items</h3>
          <div className="mt-3 space-y-2">
            {result.registry.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-[#EFE4DC] bg-white p-3">
                <div>
                  <p className="font-medium text-[#2B2118]">{item.name} ({item.kind})</p>
                  <p className="text-xs text-[#8a7a6d]">
                    {item.dosage} • {item.scheduleTimes.map(formatTime).join(", ")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    removeMedication(item.id);
                    setRefreshTick((value) => value + 1);
                  }}
                  className="rounded-lg p-2 text-[#a89887] hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}