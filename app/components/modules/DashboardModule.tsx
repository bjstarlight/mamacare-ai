"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Syringe,
} from "lucide-react";
import type { AppSection } from "../../config/productFlow";
import type { OrchestratorRun } from "../../lib/AIOrchestrator";
import type { ChatMessage } from "../../hooks/useMamaCareAppState";
import { syncVaccinationAgent } from "../../lib/vaccinations/vaccinationAgent";
import { subscribeMilestones } from "../../lib/blockchain/milestoneStore";
import type { BlockchainMilestone } from "../../lib/blockchain/types";
import { syncMedicationSupplementAgent } from "../../lib/medications/medicationSupplementAgent";

type DashboardModuleProps = {
  babyAgeText: string;
  hasPregnancyProgress: boolean;
  journeyPercent: number;
  motherName: string;
  pregnancyWeek: string;
  protectedRecords: number;
  lastVerified: string;
  quickQuestion: (text: string, isMedicalComplaint?: boolean) => void;
  openSection: (section: AppSection | string, subview?: string) => void;
  weekNumber: number;
  orchestratorResult?: OrchestratorRun | null;
  onOrchestratorRefresh?: () => void;
  isFirstVisit?: boolean;
  workflowSteps?: Array<{ id: string; label: string; section: AppSection }>;
  completedStepIds?: string[];
  currentStepId?: string | null;
  workflowProgress?: number;
  returningSteps?: Array<{ id: string; label: string; section: AppSection }>;
  recentNotifications?: Array<{ id: string; title?: string; message?: string }>;
  onMarkNotificationRead?: (id: string) => void;
  messages?: ChatMessage[];
};

type CareMode = "pregnancy" | "baby" | "family";

type AppointmentSummary = {
  title?: string;
  date?: string;
  location?: string;
};

type MedicationSummary = {
  name?: string;
  schedule?: string;
  status?: string;
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function readString(key: string, fallback = "") {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDateLabel(value?: string) {
  if (!value) return "No date stored";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardModule({
  babyAgeText,
  hasPregnancyProgress,
  journeyPercent,
  motherName,
  pregnancyWeek,
  protectedRecords,
  lastVerified,
  quickQuestion,
  openSection,
  weekNumber,
  orchestratorResult,
  onOrchestratorRefresh,
  messages = [],
}: DashboardModuleProps) {
  const [careMode, setCareMode] = useState<CareMode>("family");
  const [reminders, setReminders] = useState<string[]>([]);
  const [appointments, setAppointments] = useState<AppointmentSummary[]>([]);
  const [medications, setMedications] = useState<MedicationSummary[]>([]);
  const [vaccines, setVaccines] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [adherence, setAdherence] = useState(72);
  const [medicationAdherence, setMedicationAdherence] = useState(100);
  const [missedMedicationCount, setMissedMedicationCount] = useState(0);
  const [pendingMilestones, setPendingMilestones] = useState<BlockchainMilestone[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const weekValue = Number(readString("pregnancyWeek"));
    const hasValidWeek = !Number.isNaN(weekValue) && weekValue >= 1 && weekValue <= 40;
    const hasBabyRecord = Boolean(readString("babyAgeText") || readString("babyProfile"));

    setCareMode(hasValidWeek ? "pregnancy" : hasBabyRecord ? "baby" : "family");

    const checklist = readJSON<Record<string, boolean>>(`carePriorities:${todayKey()}`, {});
    const reminderList = [
      !checklist.ironTablet ? "Take the recommended iron supplement" : null,
      !checklist.water ? "Drink enough fluids and rest today" : null,
      !checklist.walk ? "Take a gentle walk if you feel well" : null,
      !checklist.kickCount ? "Track baby movement if this is a pregnancy care day" : null,
    ].filter(Boolean) as string[];

    const vaccinationResult = syncVaccinationAgent();
    vaccinationResult.upcoming.slice(0, 3).forEach((item) => {
      reminderList.push(`${item.name} is due on ${formatDateLabel(item.dueAt)}`);
    });

    if (reminderList.length === 0) {
      reminderList.push(
        careMode === "pregnancy"
          ? "Keep your appointment routine and monitor symptoms"
          : "Review feeding, growth, and vaccination notes"
      );
    }

    setReminders(reminderList.slice(0, 4));

    const savedAppointments = readJSON<AppointmentSummary[]>("appointments", []);
    const upcoming = savedAppointments
      .filter((item) => item.date)
      .sort((left, right) => new Date(left.date!).getTime() - new Date(right.date!).getTime())
      .slice(0, 3);
    setAppointments(upcoming);

    const medicationResult = syncMedicationSupplementAgent();
    setMedicationAdherence(medicationResult.adherencePercent);
    setMissedMedicationCount(medicationResult.missedDoses.length);
    setMedications(
      medicationResult.todayDoses
        .slice(0, 3)
        .map((dose) => ({
          name: dose.name,
          schedule: `${dose.time} • ${dose.dosage}`,
          status: dose.status,
        }))
    );
    medicationResult.missedDoses.slice(0, 2).forEach((dose) => {
      reminderList.push(`Missed dose: ${dose.name} at ${dose.time}`);
    });

    const savedVaccines = vaccinationResult.upcoming.slice(0, 3);
    setVaccines(savedVaccines.map((item) => `${item.name} • ${formatDateLabel(item.dueAt)}`).slice(0, 3));

    const checkedItems = Object.values(checklist).filter(Boolean).length;
    const totalItems = Math.max(1, Object.keys(checklist).length || 4);
    setAdherence(Math.round((checkedItems / totalItems) * 100));

    const existingAlerts = readJSON<Array<{ title?: string; detail?: string }>>("aiAlerts", []);
    const alertList = existingAlerts
      .map((item) => item.title ?? item.detail)
      .filter(Boolean) as string[];
    setAlerts(alertList.slice(0, 3));
  }, [careMode]);

  useEffect(() =>{
    const unsubscribe = subscribeMilestones((milestones) => {
      setPendingMilestones(
        milestones.filter((milestone) => milestone.status === "pending" || milestone.status === "failed").slice(0, 3)
      );
    });

    return () => {
  unsubscribe();
};
  }, []);

  const statusBadge =
    careMode === "pregnancy"
      ? "Pregnancy command center"
      : careMode === "baby"
        ? "Child health command center"
        : "Family care command center";

  const heroTitle = motherName
    ? careMode === "pregnancy"
      ? `Welcome back, ${motherName}`
      : `Your care plan for ${motherName}`
    : careMode === "pregnancy"
      ? "Your pregnancy care hub"
      : careMode === "baby"
        ? "Your child care hub"
        : "Your family care hub";

  const heroDescription =
    careMode === "pregnancy"
      ? "Track pregnancy progress, reminders, appointments, vaccination and medication routines, and AI guidance from one calm overview."
      : "Track your child’s growth, vaccines, care reminders, and AI guidance without needing a separate pregnancy dashboard.";

  const progressLabel =
    careMode === "pregnancy"
      ? `Week ${weekNumber} of 40`
      : babyAgeText
        ? `Baby age: ${babyAgeText}`
        : "Add baby details to personalize growth guidance";

  const recentConversations = messages.slice(-3).reverse();

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-4xl border border-[#EFE4DC] bg-linear-to-br from-[#FFF9F4] via-white to-[#FFF3E9] p-6 shadow-[0_20px_60px_rgba(43,33,24,0.08)] sm:p-8">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F0D1C2] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#B5533F]">
              <Sparkles className="h-3.5 w-3.5" />
              {statusBadge}
            </div>
            <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#2B2118] sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6F6258] sm:text-[15px]">
              {heroDescription}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => openSection("ai")}
                className="rounded-full bg-[#6B2545] px-4 py-2 text-sm font-semibold text-[#FBF6F1] transition hover:-translate-y-0.5 hover:bg-[#7A2E52]"
              >
                Open AI care
              </button>
              <button
                onClick={() => openSection("appointments")}
                className="rounded-full border border-[#DFCCC0] bg-white px-4 py-2 text-sm font-semibold text-[#2B2118] transition hover:-translate-y-0.5 hover:bg-[#FFF3E9]"
              >
                View appointments
              </button>
              <button
                onClick={() => openSection("emergency")}
                className="rounded-full border border-[#F0D1C2] bg-[#FFF3E9] px-4 py-2 text-sm font-semibold text-[#A8462C] transition hover:-translate-y-0.5"
              >
                Emergency support
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#EFE4DC] bg-white/90 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">
                  Care snapshot
                </p>
                <p className="mt-2 text-lg font-semibold text-[#2B2118]">{progressLabel}</p>
              </div>
              <div className="rounded-full bg-[#FCEFE7] p-2 text-[#B5533F]">
                <Stethoscope className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F4] px-4 py-3">
                <span className="text-sm text-[#6F6258]">Adherence</span>
                <span className="text-sm font-semibold text-[#2B2118]">{adherence}%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F4] px-4 py-3">
                <span className="text-sm text-[#6F6258]">Protected records</span>
                <span className="text-sm font-semibold text-[#2B2118]">{protectedRecords}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[#FFF9F4] px-4 py-3">
                <span className="text-sm text-[#6F6258]">Last verification</span>
                <span className="text-sm font-semibold text-[#2B2118]">{lastVerified}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] border border-[#EFE4DC] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#B5533F]">
              <Activity className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Progress</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#2B2118]">
              {hasPregnancyProgress ? `${weekNumber}` : babyAgeText || "—"}
            </p>
            <p className="mt-1 text-sm text-[#6F6258]">{hasPregnancyProgress ? "Current week" : "Baby age"}</p>
          </div>
          <div className="rounded-[20px] border border-[#EFE4DC] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#B5533F]">
              <Clock3 className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Today</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#2B2118]">{reminders.length}</p>
            <p className="mt-1 text-sm text-[#6F6258]">Reminders queued</p>
          </div>
          <div className="rounded-[20px] border border-[#EFE4DC] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#B5533F]">
              <Syringe className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Vaccines</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#2B2118]">{vaccines.length}</p>
            <p className="mt-1 text-sm text-[#6F6258]">Due or pending</p>
          </div>
          <div className="rounded-[20px] border border-[#EFE4DC] bg-white/80 p-4">
            <div className="flex items-center gap-2 text-[#B5533F]">
              <Pill className="h-4 w-4" />
              <p className="text-xs font-semibold uppercase tracking-[0.22em]">Medication</p>
            </div>
            <p className="mt-3 text-2xl font-semibold text-[#2B2118]">{medications.length}</p>
            <p className="mt-1 text-sm text-[#6F6258]">{missedMedicationCount > 0 ? `${missedMedicationCount} missed` : "Items in plan"}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">Today&apos;s reminders</p>
                <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">A calm list for the day</h2>
              </div>
              <div className="rounded-full bg-[#FFF3E9] px-3 py-1 text-sm font-semibold text-[#B5533F]">
                {reminders.length} active
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {reminders.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#F2E5DC] bg-[#FFF9F4] px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3AA46F]" />
                  <p className="text-sm text-[#3E342D]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">AI insights</p>
                <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Coordinator guidance</h2>
              </div>
              <button
                onClick={() => openSection("ai")}
                className="text-sm font-semibold text-[#6B2545]"
              >
                Open chat
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {(orchestratorResult?.result?.recommendations?.slice(0, 3) ?? [
                "Review your current care plan and ask the coordinator for tailored next steps.",
              ]).map((item, index) => (
                <div key={`${item}-${index}`} className="rounded-2xl border border-[#F2E5DC] bg-[#FFF9F4] p-4">
                  <p className="text-sm font-semibold text-[#2B2118]">{item}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">Upcoming appointments</p>
                <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Care visits</h2>
              </div>
              <CalendarDays className="h-5 w-5 text-[#B5533F]" />
            </div>
            <div className="mt-5 space-y-3">
              {appointments.length > 0 ? (
                appointments.map((item, index) => (
                  <div key={`${item.title}-${index}`} className="rounded-2xl border border-[#F2E5DC] bg-[#FFF9F4] p-4">
                    <p className="font-semibold text-[#2B2118]">{item.title || "Care appointment"}</p>
                    <p className="mt-1 text-sm text-[#6F6258]">{formatDateLabel(item.date)}</p>
                    {item.location ? <p className="mt-1 text-sm text-[#6F6258]">{item.location}</p> : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E7D5C7] bg-[#FFF9F4] p-4 text-sm text-[#6F6258]">
                  Add your next visit to keep the care calendar visible.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">Medication status</p>
                <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Medication & supplements</h2>
              </div>
              <Pill className="h-5 w-5 text-[#B5533F]" />
            </div>
            <div className="mt-5 space-y-3">
              {medications.length > 0 ? (
                medications.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="flex items-center gap-3 rounded-2xl border border-[#F2E5DC] bg-[#FFF9F4] px-4 py-3">
                    <Pill className="h-4 w-4 shrink-0 text-[#B5533F]" />
                    <p className="text-sm text-[#3E342D]">
                      {item.name} {item.schedule ? `• ${item.schedule}` : ""}
                    </p>
                    {item.status ? (
                      <span className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        item.status === "taken" ? "bg-emerald-100 text-emerald-700" : item.status === "missed" ? "bg-red-100 text-red-700" : "bg-[#EFE4DC] text-[#8A7A6D]"
                      }`}>
                        {item.status}
                      </span>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-[#E7D5C7] bg-[#FFF9F4] p-4 text-sm text-[#6F6258]">
                  No medication schedule yet. Add medications, supplements, or vitamins to activate reminders.
                </div>
              )}
            </div>
            <p className="mt-3 text-xs font-semibold text-[#6B2545]">
              Medication adherence today: {medicationAdherence}%
            </p>
          </section>

          <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">Emergency focus</p>
                <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Safety nudges</h2>
              </div>
              <AlertTriangle className="h-5 w-5 text-[#A8462C]" />
            </div>
            <div className="mt-5 space-y-3">
              {alerts.length > 0 ? (
                alerts.map((item) => (
                  <div key={item} className="rounded-2xl border border-[#F2D3C7] bg-[#FFF3E9] px-4 py-3 text-sm text-[#8A4A31]">
                    {item}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-[#F2D3C7] bg-[#FFF3E9] p-4 text-sm text-[#8A4A31]">
                  Keep your emergency contacts handy and use the SOS shortcut if you need urgent support.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">Quick actions</p>
            <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Move to the next best step</h2>
          </div>
          <Link href="/hospital" className="text-sm font-semibold text-[#6B2545]">
            Hospital center
          </Link>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Ask the AI midwife", action: () => quickQuestion("What should I focus on today?"), icon: MessageSquare },
            { label: "Review baby care", action: () => openSection("baby"), icon: Baby },
            { label: "Open medication plan", action: () => openSection("mother"), icon: Pill },
            { label: "View appointments", action: () => openSection("appointments"), icon: CalendarDays },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex items-center justify-between rounded-2xl border border-[#EFE4DC] bg-[#FFF9F4] px-4 py-4 text-left transition hover:-translate-y-0.5 hover:bg-[#FFF3E9]"
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-full bg-white p-2 text-[#B5533F]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-semibold text-[#2B2118]">{item.label}</span>
                </span>
                <ChevronRight className="h-4 w-4 text-[#8A7A6D]" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">BOT Chain milestones</p>
            <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Consent-ready actions</h2>
          </div>
          <button onClick={() => openSection("wallet")} className="text-sm font-semibold text-[#6B2545]">
            Open wallet
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {pendingMilestones.length > 0 ? (
            pendingMilestones.map((milestone) => (
              <div key={milestone.id} className="rounded-2xl border border-[#F2E5DC] bg-[#FFF9F4] p-4">
                <p className="text-sm font-semibold text-[#2B2118]">{milestone.title}</p>
                <p className="mt-1 text-sm text-[#6F6258]">{milestone.summary || "Milestone queued for consented BOT Chain storage."}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E7D5C7] bg-[#FFF9F4] p-4 text-sm text-[#6F6258]">
              New milestone prompts appear here after appointments, vaccine completions, care-plan approvals, or health achievements are queued.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8A7A6D]">Recent conversations</p>
            <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">Your latest care chats</h2>
          </div>
          <button onClick={() => openSection("ai")} className="text-sm font-semibold text-[#6B2545]">
            Continue chat
          </button>
        </div>
        <div className="mt-5 space-y-3">
          {recentConversations.length > 0 ? (
            recentConversations.map((entry, index) => (
              <div key={`${entry.text}-${index}`} className="rounded-2xl border border-[#F2E5DC] bg-[#FFF9F4] p-4">
                <p className="text-sm font-semibold text-[#2B2118]">{entry.role === "user" ? "You" : "MamaCare AI"}</p>
                <p className="mt-1 text-sm text-[#6F6258]">{entry.text}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E7D5C7] bg-[#FFF9F4] p-4 text-sm text-[#6F6258]">
              Start a conversation with the AI coordinator to build your care timeline.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
