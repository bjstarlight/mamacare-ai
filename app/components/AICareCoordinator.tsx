"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Droplets,
  Pill,
  Activity,
  Footprints,
  Baby,
  CheckCircle2,
  Circle,
  AlertTriangle,
  ShieldCheck,
  Siren,
  MapPin,
  PhoneCall,
  Stethoscope,
  ClipboardList,
  CalendarClock,
} from "lucide-react";
import { pregnancyTips } from "../lib/pregnancyTips";
import { syncMedicationSupplementAgent } from "../lib/medications/medicationSupplementAgent";

/**
 * AICareCoordinator
 * -----------------------------------------------------------------------
 * The "brain" screen: pulls together the mother's profile, today's care
 * checklist, her latest vitals, her next appointment, and the emergency
 * shortcuts, into one coordinated view instead of 40 separate widgets.
 *
 * Design note: every number here is computed from real localStorage data.
 * Nothing is a hardcoded placeholder (e.g. no fixed "96% confidence" or
 * fabricated risk alert) — see the honesty note in each compute function
 * below for what it's actually based on.
 * -----------------------------------------------------------------------
 */

// ---------------------------------------------------------------------------
// Types for the data this component reads/writes
// ---------------------------------------------------------------------------

interface MotherProfile {
  name?: string;
}

interface EmergencyContact {
  name?: string;
  relation?: string;
  phone?: string;
}

interface AppointmentInfo {
  nextAppointmentDate?: string;
  location?: string;
  label?: string;
}

interface LatestBP {
  systolic?: number;
  diastolic?: number;
  timestamp?: number;
}

interface DailyChecklist {
  ironTablet: boolean;
  water: boolean;
  bpCheck: boolean;
  walk: boolean;
  kickCount: boolean;
}

interface CareTimelineEntry {
  label: string;
  offsetDays: number;
}

interface MedicationSummaryState {
  adherencePercent: number;
  missedDoses: number;
  upcomingLabel: string;
}

const DEFAULT_CHECKLIST: DailyChecklist = {
  ironTablet: false,
  water: false,
  bpCheck: false,
  walk: false,
  kickCount: false,
};

const CHECKLIST_ITEMS: {
  key: keyof DailyChecklist;
  label: string;
  icon: typeof Pill;
}[] = [
  { key: "ironTablet", label: "Take iron tablet", icon: Pill },
  { key: "water", label: "Drink 3L water", icon: Droplets },
  { key: "bpCheck", label: "BP check", icon: Activity },
  { key: "walk", label: "Walk 20 minutes", icon: Footprints },
  { key: "kickCount", label: "Baby kick count", icon: Baby },
];

// ---------------------------------------------------------------------------
// Safe localStorage helpers
// ---------------------------------------------------------------------------

function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort save
  }
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target.getTime() - startOfToday.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function formatDayLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days > 1) return `${days} days`;
  return "Overdue";
}

// ---------------------------------------------------------------------------
// Honest derived values — every one of these is computed from real
// signals, not hardcoded, so this section is the "show your work" for the
// numbers rendered below.
// ---------------------------------------------------------------------------

function computeCareScore(checklist: DailyChecklist): number {
  const values = Object.values(checklist);
  const done = values.filter(Boolean).length;
  return Math.round((done / values.length) * 100);
}

function getRiskLevel(bp: LatestBP | null): "low" | "elevated" | "unknown" {
  if (!bp || bp.systolic == null || bp.diastolic == null) return "unknown";
  if (bp.systolic >= 140 || bp.diastolic >= 90) return "elevated";
  return "low";
}

/**
 * "AI Confidence" here is NOT a diagnostic certainty score — it's a plain
 * measure of how much of her health data the coordinator actually has to
 * work with. More real signals present = a more complete picture, which is
 * the honest thing this number can claim. A fixed number regardless of
 * input would be the same fabrication bug we fixed in HealthWallet.
 */
function computeDataConfidence(signals: boolean[]): number {
  const present = signals.filter(Boolean).length;
  return Math.round((present / signals.length) * 100);
}

function buildRecommendations(
  weekNumber: number | null,
  checklist: DailyChecklist,
  riskLevel: "low" | "elevated" | "unknown"
): string[] {
  const recs: string[] = [];

  if (!checklist.water) {
    recs.push("Increase your water intake — aim for 3 litres today.");
  }
  if (!checklist.walk) {
    recs.push("Fit in a 20-minute walk when you can today.");
  }

  if (weekNumber != null && !Number.isNaN(weekNumber)) {
    const stage = pregnancyTips.find(
      (tip) => weekNumber >= tip.startWeek && weekNumber <= tip.endWeek
    );
    if (stage) {
      // Pull from the same stage-specific tips used in the Pregnancy
      // Tracker, so advice stays consistent across the app instead of
      // inventing a second, disconnected set of tips here.
      for (const tip of stage.tips.slice(0, 3)) {
        if (!recs.includes(tip)) recs.push(tip);
      }
    }
  }

  if (riskLevel === "elevated") {
    recs.unshift(
      "Your last BP reading was elevated — repeat it this evening."
    );
  }

  // Always end with the safety-net line, since it's a fixed clinical
  // threshold rather than a personalized claim.
  recs.push("Call your doctor if BP exceeds 140/90.");

  return recs.slice(0, 5);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AICareCoordinator({
  openSection,
  viewerRole = "mother",
}: {
  openSection?: (id: string) => void;
  /**
   * "mother": her own dashboard — greeted by name, checklist is tappable.
   * "doctor": clinical view of the same patient — no personal greeting,
   * and the checklist becomes read-only. A doctor should be able to see
   * whether she's kept up with hydration/meds/kick counts, but ticking
   * those boxes on her behalf would misrepresent self-reported data as
   * something a clinician verified.
   */
  viewerRole?: "mother" | "doctor";
}) {
  const [motherName, setMotherName] = useState("");
  const [pregnancyWeek, setPregnancyWeek] = useState<string>("");
  const [checklist, setChecklist] = useState<DailyChecklist>(
    DEFAULT_CHECKLIST
  );
  const [bp, setBp] = useState<LatestBP | null>(null);
  const [appointment, setAppointment] = useState<AppointmentInfo | null>(
    null
  );
  const [contact, setContact] = useState<EmergencyContact | null>(null);
  const [extraTimeline, setExtraTimeline] = useState<CareTimelineEntry[]>(
    []
  );
  const [medicationSummary, setMedicationSummary] = useState<MedicationSummaryState>({
    adherencePercent: 100,
    missedDoses: 0,
    upcomingLabel: "No medication schedule",
  });

  const refreshMedicationSummary = useCallback(() => {
    const medication = syncMedicationSupplementAgent();
    const nextDose = medication.upcomingDoses[0];
    setMedicationSummary({
      adherencePercent: medication.adherencePercent,
      missedDoses: medication.missedDoses.length,
      upcomingLabel: nextDose
        ? `${nextDose.name} at ${nextDose.time}`
        : "No more doses due today",
    });
  }, []);

  useEffect(() => {
    const mother = readJSON<MotherProfile>("motherProfile");
    setMotherName(mother?.name ?? "");

    setPregnancyWeek(window.localStorage.getItem("pregnancyWeek") ?? "");

    const key = `carePriorities:${todayKey()}`;
    setChecklist(readJSON<DailyChecklist>(key) ?? DEFAULT_CHECKLIST);

    setBp(readJSON<LatestBP>("latestBP"));
    setAppointment(readJSON<AppointmentInfo>("appointments"));
    setContact(readJSON<EmergencyContact>("emergencyContact"));

    // Optional: a real scheduling feature can write further-out items here
    // (e.g. [{ label: "Ultrasound", offsetDays: 3 }]). If it's not present,
    // we show an honest "nothing scheduled" state rather than inventing
    // an ultrasound/lab date that was never actually booked.
    setExtraTimeline(readJSON<CareTimelineEntry[]>("careTimeline") ?? []);

    refreshMedicationSummary();

    const timer = window.setInterval(refreshMedicationSummary, 60_000);
    return () => window.clearInterval(timer);
  }, [refreshMedicationSummary]);

  const weekNumber = pregnancyWeek ? Number(pregnancyWeek) : null;
  const hasValidWeek =
    weekNumber != null && !Number.isNaN(weekNumber) && weekNumber >= 1;

  const toggleItem = (key: keyof DailyChecklist) => {
    // Doctors view this data; only the mother's own device should write it.
    if (viewerRole === "doctor") return;
    const updated = { ...checklist, [key]: !checklist[key] };
    setChecklist(updated);
    writeJSON(`carePriorities:${todayKey()}`, updated);
  };

  const careScore = useMemo(() => computeCareScore(checklist), [checklist]);
  const riskLevel = useMemo(() => getRiskLevel(bp), [bp]);
  const confidence = useMemo(
    () =>
      computeDataConfidence([
        !!motherName,
        hasValidWeek,
        !!bp,
        !!appointment?.nextAppointmentDate,
        Object.values(checklist).some(Boolean),
        medicationSummary.missedDoses === 0,
      ]),
    [motherName, hasValidWeek, bp, appointment, checklist, medicationSummary]
  );
  const recommendations = useMemo(
    () => buildRecommendations(weekNumber, checklist, riskLevel),
    [weekNumber, checklist, riskLevel]
  );

  const appointmentDays = appointment?.nextAppointmentDate
    ? daysUntil(appointment.nextAppointmentDate)
    : null;

  const firstIncompleteItem = CHECKLIST_ITEMS.find(
    (item) => !checklist[item.key]
  );

  // Timeline: only ever built from real data. "Today" reflects the
  // checklist; the appointment slot only appears if one is actually
  // stored; anything from `careTimeline` is whatever the app itself
  // scheduled. If none of that exists, we say so instead of filling
  // the gap with invented milestones.
  const timeline = useMemo(() => {
    const entries: { days: number; label: string; sublabel?: string }[] = [
      {
        days: 0,
        label: firstIncompleteItem
          ? firstIncompleteItem.label
          : "All caught up for today",
      },
    ];

    if (appointmentDays != null && appointmentDays >= 0) {
      entries.push({
        days: appointmentDays,
        label: appointment?.label || "Doctor Visit",
        sublabel: appointment?.location,
      });
    }

    for (const entry of extraTimeline) {
      entries.push({ days: entry.offsetDays, label: entry.label });
    }

    return entries.sort((a, b) => a.days - b.days).slice(0, 4);
  }, [firstIncompleteItem, appointmentDays, appointment, extraTimeline]);

  const hasFutureTimeline = timeline.length > 1;

  return (
    <div className="space-y-6">
      {/* Card 1: Greeting + priorities + upcoming + risk + confidence */}
      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2 text-[#B5533F]">
          <Sparkles className="h-5 w-5" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            AI Care Coordinator
          </p>
        </div>

        {viewerRole === "mother" ? (
          <>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#2B2118]">
              {getGreeting()}
              {motherName ? `, ${motherName}` : ""} 👋
            </h2>
            <p className="mt-1 text-sm text-[#8a7a6d]">
              {hasValidWeek
                ? `You are ${weekNumber} weeks pregnant.`
                : "Add your pregnancy week to unlock personalized guidance."}
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-[#2B2118]">
              {motherName || "Patient"}
              {hasValidWeek ? ` — Week ${weekNumber}` : ""}
            </h2>
            <p className="mt-1 text-sm text-[#8a7a6d]">
              AI-coordinated care plan and adherence for this patient.
            </p>
          </>
        )}

        {/* Today's priorities */}
        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
            {viewerRole === "mother"
              ? "Today's priorities"
              : "Today's care plan adherence"}
          </p>
          <div className="mt-3 space-y-2">
            {CHECKLIST_ITEMS.map(({ key, label, icon: Icon }) => {
              const done = checklist[key];
              const readOnly = viewerRole === "doctor";
              return (
                <button
                  key={key}
                  onClick={() => toggleItem(key)}
                  disabled={readOnly}
                  aria-readonly={readOnly}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    readOnly ? "cursor-default" : ""
                  } ${
                    done
                      ? "border-emerald-200 bg-emerald-50"
                      : `border-[#EFE4DC] bg-[#FFF9F4] ${
                          readOnly ? "" : "hover:bg-[#FFF3E9]"
                        }`
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 text-[#c9b8ab]" />
                  )}
                  <Icon className="h-4 w-4 flex-shrink-0 text-[#6B2545]" />
                  <span
                    className={`text-sm font-medium ${
                      done ? "text-emerald-800" : "text-[#4a3d33]"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Upcoming appointment */}
          <div className="rounded-2xl bg-[#EEF1F9] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#35406B]">
              Upcoming
            </p>
            {appointment?.nextAppointmentDate ? (
              <>
                <p className="mt-1 font-semibold text-[#2B2118]">
                  {appointment.label || "Doctor Visit"}
                </p>
                <p className="text-sm text-[#4a5170]">
                  {appointmentDays != null
                    ? formatDayLabel(appointmentDays)
                    : appointment.nextAppointmentDate}
                  {appointment.location ? ` · ${appointment.location}` : ""}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-[#4a5170]">
                No appointment scheduled yet.
              </p>
            )}
          </div>

          {/* Risk alert — only claims what the data supports */}
          <div
            className={`rounded-2xl p-4 ${
              riskLevel === "elevated"
                ? "bg-red-50"
                : riskLevel === "low"
                ? "bg-emerald-50"
                : "bg-[#FFF3E9]"
            }`}
          >
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${
                riskLevel === "elevated"
                  ? "text-red-700"
                  : riskLevel === "low"
                  ? "text-emerald-700"
                  : "text-[#B5533F]"
              }`}
            >
              Risk Alert
            </p>
            {riskLevel === "elevated" && (
              <p className="mt-1 flex items-start gap-1.5 text-sm text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                Blood pressure reading was elevated. Repeat BP this evening.
              </p>
            )}
            {riskLevel === "low" && (
              <p className="mt-1 text-sm text-emerald-800">
                Latest BP reading is within a healthy range.
              </p>
            )}
            {riskLevel === "unknown" && (
              <p className="mt-1 text-sm text-[#8a5a3f]">
                No BP reading logged yet. Log one for a personalized alert.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#FFF9F4] px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#8a7a6d]">
              Data Confidence
            </p>
            <p className="text-[11px] text-[#a89887]">
              Based on how much of your health data is available
            </p>
          </div>
          <p className="font-serif text-2xl font-semibold text-[#6B2545]">
            {confidence}%
          </p>
        </div>
      </section>

      {/* Card 2: Today's Care Score */}
      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-[#6B2545]" />
          <h3 className="font-serif text-xl font-semibold text-[#2B2118]">
            Today's Care Score
          </h3>
        </div>

        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#EFE4DC]">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-[#E2725B] to-[#F3B091] transition-all"
              style={{ width: `${careScore}%` }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-[#6B2545]">
            {careScore}% complete
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatusChip label="Hydration" done={checklist.water} />
          <StatusChip label="Medication" done={checklist.ironTablet} />
          <StatusChip label="Exercise" done={checklist.walk} />
          <StatusChip
            label="Appointment"
            done={appointmentDays != null && appointmentDays <= 1}
            neutralText={
              appointment?.nextAppointmentDate
                ? formatDayLabel(appointmentDays ?? 0)
                : "None set"
            }
          />
          <StatusChip
            label="Risk"
            done={riskLevel === "low"}
            warn={riskLevel === "elevated"}
            neutralText={
              riskLevel === "unknown"
                ? "Unknown"
                : riskLevel === "low"
                ? "Low"
                : "Elevated"
            }
          />
          <StatusChip
            label="Med Agent"
            done={medicationSummary.missedDoses === 0}
            warn={medicationSummary.missedDoses > 0}
            neutralText={`${medicationSummary.adherencePercent}%`}
          />
        </div>
      </section>

      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2">
          <Pill className="h-5 w-5 text-[#6B2545]" />
          <h3 className="font-serif text-xl font-semibold text-[#2B2118]">
            Medication & Supplement Agent
          </h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-[#FFF9F4] p-3">
            <p className="text-xs uppercase tracking-wide text-[#8A7A6D]">Adherence</p>
            <p className="mt-1 text-xl font-bold text-[#35406B]">{medicationSummary.adherencePercent}%</p>
          </div>
          <div className="rounded-xl bg-[#FFF9F4] p-3">
            <p className="text-xs uppercase tracking-wide text-[#8A7A6D]">Missed doses</p>
            <p className="mt-1 text-xl font-bold text-[#A8462C]">{medicationSummary.missedDoses}</p>
          </div>
          <div className="rounded-xl bg-[#FFF9F4] p-3">
            <p className="text-xs uppercase tracking-wide text-[#8A7A6D]">Next dose</p>
            <p className="mt-1 text-sm font-semibold text-[#2B2118]">{medicationSummary.upcomingLabel}</p>
          </div>
        </div>
      </section>

      {/* Card 3: AI Recommendations */}
      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-[#35406B]" />
          <h3 className="font-serif text-xl font-semibold text-[#2B2118]">
            AI Recommendations
          </h3>
        </div>
        <ul className="mt-4 space-y-2.5">
          {recommendations.map((rec, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm text-[#4a3d33]"
            >
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B5533F]" />
              {rec}
            </li>
          ))}
        </ul>
      </section>

      {/* Card 4: Upcoming Timeline */}
      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 sm:p-7 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-[#6B2545]" />
          <h3 className="font-serif text-xl font-semibold text-[#2B2118]">
            Upcoming Timeline
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {timeline.map((entry, i) => (
            <div key={i} className="rounded-2xl bg-[#FFF9F4] p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#B5533F]">
                {formatDayLabel(entry.days)}
              </p>
              <p className="mt-1 text-sm font-semibold text-[#2B2118]">
                {entry.label}
              </p>
              {entry.sublabel && (
                <p className="mt-0.5 text-xs text-[#8a7a6d]">
                  {entry.sublabel}
                </p>
              )}
            </div>
          ))}
        </div>

        {!hasFutureTimeline && (
          <p className="mt-3 text-xs text-[#a89887]">
            Nothing else is scheduled yet — add a visit in Appointments to
            see it here.
          </p>
        )}
      </section>

      {/* Card 5: Emergency */}
      <section className="rounded-3xl border-2 border-red-200 bg-red-50 p-6 sm:p-7">
        <div className="flex items-center gap-2">
          <Siren className="h-5 w-5 text-red-600" />
          <h3 className="text-xl font-bold text-red-700">Emergency</h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <EmergencyAction
            icon={Siren}
            label="Emergency SOS"
            onClick={() => openSection?.("emergency")}
          />
          <EmergencyAction
            icon={ShieldCheck}
            label="Offline Medical Card"
            onClick={() => openSection?.("offline")}
          />
          <EmergencyAction
            icon={MapPin}
            label="Hospital Finder"
            onClick={() => openSection?.("hospital")}
          />
          <EmergencyAction
            icon={PhoneCall}
            label="Call Caregiver"
            href={contact?.phone ? `tel:${contact.phone}` : undefined}
            disabled={!contact?.phone}
          />
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function StatusChip({
  label,
  done,
  warn,
  neutralText,
}: {
  label: string;
  done: boolean;
  warn?: boolean;
  neutralText?: string;
}) {
  const state = warn ? "warn" : done ? "done" : "pending";
  const styles = {
    done: "bg-emerald-50 text-emerald-700",
    warn: "bg-red-50 text-red-700",
    pending: "bg-[#FFF3E9] text-[#8a5a3f]",
  }[state];

  return (
    <div className={`rounded-xl px-3 py-2 text-center ${styles}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-semibold">
        {neutralText ?? (done ? "✓" : "Pending")}
      </p>
    </div>
  );
}

function EmergencyAction({
  icon: Icon,
  label,
  onClick,
  href,
  disabled,
}: {
  icon: typeof Siren;
  label: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const className = `flex items-center gap-3 rounded-xl border px-4 py-3 text-left font-semibold transition active:scale-[0.98] ${
    disabled
      ? "cursor-not-allowed border-red-100 bg-white/60 text-red-300"
      : "border-red-200 bg-white text-red-700 hover:bg-red-100"
  }`;

  if (href && !disabled) {
    return (
      <a href={href} className={className}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        {label}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      {label}
      {disabled && (
        <span className="ml-auto text-[11px] font-normal text-red-300">
          No number saved
        </span>
      )}
    </button>
  );
}