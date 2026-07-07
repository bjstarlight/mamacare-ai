import { readJSON, writeJSON, STORAGE_KEYS } from "../storage/storageService.ts";
import { recordConsentEvent } from "../blockchain/consentChain.ts";

export type VaccinationReminderType = "7-days-before" | "1-day-before" | "same-day";
export type VaccinationStatus = "scheduled" | "overdue" | "completed";

export type VaccinationReminder = {
  id: string;
  type: VaccinationReminderType;
  dueAt: string;
  sent: boolean;
};

export type VaccinationRecord = {
  id: string;
  name: string;
  dueAt: string;
  status: VaccinationStatus;
  reminders: VaccinationReminder[];
  completedAt?: string;
  createdAt: string;
};

export type VaccinationAgentResult = {
  schedule: VaccinationRecord[];
  upcoming: VaccinationRecord[];
  reminders: string[];
  completedCount: number;
};

const STORAGE_KEY = STORAGE_KEYS.babyVaccinations;

const vaccineBlueprint = [
  { name: "BCG", ageDays: 0 },
  { name: "Hepatitis B (birth dose)", ageDays: 0 },
  { name: "OPV 0", ageDays: 0 },
  { name: "Pentavalent 1", ageDays: 42 },
  { name: "OPV 1", ageDays: 42 },
  { name: "PCV 1", ageDays: 42 },
  { name: "Rotavirus 1", ageDays: 42 },
  { name: "Pentavalent 2", ageDays: 70 },
  { name: "OPV 2", ageDays: 70 },
  { name: "PCV 2", ageDays: 70 },
  { name: "Rotavirus 2", ageDays: 70 },
  { name: "Pentavalent 3", ageDays: 98 },
  { name: "OPV 3", ageDays: 98 },
  { name: "IPV", ageDays: 98 },
  { name: "PCV 3", ageDays: 98 },
  { name: "Measles", ageDays: 270 },
  { name: "Yellow Fever", ageDays: 270 },
] as const;

function readVaccinationSchedule(): VaccinationRecord[] {
  return readJSON<VaccinationRecord[]>(STORAGE_KEY, []);
}

function persistVaccinationSchedule(schedule: VaccinationRecord[]) {
  writeJSON(STORAGE_KEY, schedule);
}

function readCompletedVaccines(): string[] {
  return readJSON<string[]>(STORAGE_KEYS.completedVaccines, []);
}

function persistCompletedVaccines(ids: string[]) {
  writeJSON(STORAGE_KEYS.completedVaccines, ids);
}

function createReminder(id: string, dueAt: string, type: VaccinationReminderType): VaccinationReminder {
  const dueDate = new Date(dueAt);
  const reminderTime =
    type === "7-days-before"
      ? new Date(dueDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      : type === "1-day-before"
        ? new Date(dueDate.getTime() - 24 * 60 * 60 * 1000)
        : dueDate;

  return {
    id: `${id}-${type}`,
    type,
    dueAt: reminderTime.toISOString(),
    sent: false,
  };
}

function getBabyDob(): Date | null {
  const profile = readJSON<{ dob?: string }>(STORAGE_KEYS.babyProfile, {});
  if (!profile.dob) return null;

  const parsed = new Date(profile.dob);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildScheduleFromDOB(dob: Date): VaccinationRecord[] {
  return vaccineBlueprint.map((vaccination) => {
    const dueDate = new Date(dob);
    dueDate.setDate(dob.getDate() + vaccination.ageDays);

    return {
      id: `${vaccination.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${vaccination.ageDays}`,
      name: vaccination.name,
      dueAt: dueDate.toISOString(),
      status: "scheduled",
      reminders: [
        createReminder(vaccination.name, dueDate.toISOString(), "7-days-before"),
        createReminder(vaccination.name, dueDate.toISOString(), "1-day-before"),
        createReminder(vaccination.name, dueDate.toISOString(), "same-day"),
      ],
      createdAt: new Date().toISOString(),
    };
  });
}

function formatDueLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function syncVaccinationAgent(now: Date = new Date()): VaccinationAgentResult {
  const babyDob = getBabyDob();
  if (!babyDob) {
    return {
      schedule: [],
      upcoming: [],
      reminders: [],
      completedCount: 0,
    };
  }

  const completedIds = new Set(readCompletedVaccines());
  const existingSchedule = readVaccinationSchedule();
  const schedule = existingSchedule.length > 0 ? existingSchedule : buildScheduleFromDOB(babyDob);

  const nextSchedule: VaccinationRecord[] = schedule.map((record) => {
    const isCompleted = completedIds.has(record.id) || completedIds.has(record.name);
    const recordDueAt = new Date(record.dueAt);
    const hasOverdueStatus = !isCompleted && now.getTime() >= recordDueAt.getTime();
    const status: VaccinationStatus = isCompleted ? "completed" : hasOverdueStatus ? "overdue" : "scheduled";

    const reminders = record.reminders?.length
      ? record.reminders.map((reminder) => {
          const reminderDueAt = new Date(reminder.dueAt);
          const shouldSend = !reminder.sent && now.getTime() >= reminderDueAt.getTime();
          return shouldSend ? { ...reminder, sent: true } : reminder;
        })
      : [
          createReminder(record.name, record.dueAt, "7-days-before"),
          createReminder(record.name, record.dueAt, "1-day-before"),
          createReminder(record.name, record.dueAt, "same-day"),
        ];

    return {
      ...record,
      reminders,
      status,
      completedAt: isCompleted ? record.completedAt ?? now.toISOString() : undefined,
    };
  });

  persistVaccinationSchedule(nextSchedule);

  const upcoming = nextSchedule
    .filter((record) => record.status !== "completed")
    .sort((left, right) => new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime());

  const dueList = upcoming.map((record) => ({
    name: record.name,
    age: formatDueLabel(record.dueAt),
  }));

  writeJSON(STORAGE_KEYS.vaccinesDue, dueList);

  const reminders = upcoming.flatMap((record) =>
    record.reminders
      .filter((reminder) => reminder.sent)
      .map((reminder) => `${record.name} reminder sent for ${formatDueLabel(reminder.dueAt)}`)
  );

  return {
    schedule: nextSchedule,
    upcoming,
    reminders,
    completedCount: nextSchedule.filter((record) => record.status === "completed").length,
  };
}

export function getUpcomingVaccines(now: Date = new Date()): VaccinationRecord[] {
  return syncVaccinationAgent(now).upcoming;
}

export function markVaccineCompleted(name: string, now: Date = new Date()): VaccinationRecord | null {
  const schedule = readVaccinationSchedule();
  const existingCompleted = readCompletedVaccines();
  const target = schedule.find((record) => record.name === name);

  if (!target) return null;

  const nextCompleted = existingCompleted.includes(target.id) || existingCompleted.includes(target.name)
    ? existingCompleted
    : [...existingCompleted, target.id, target.name];

  const nextSchedule = schedule.map((record) =>
    record.id === target.id || record.name === name
      ? {
          ...record,
          status: "completed" as const,
          completedAt: now.toISOString(),
          reminders: record.reminders.map((reminder) => ({ ...reminder, sent: true })),
        }
      : record
  );

  persistVaccinationSchedule(nextSchedule);
  persistCompletedVaccines(nextCompleted);

  void recordConsentEvent({
    eventType: "vaccination_completed",
    category: "CareEvent",
    patientRef: `baby:${readJSON<{ name?: string }>(STORAGE_KEYS.babyProfile, {}).name ?? "unknown"}`,
    actor: "parent",
    consentGranted: true,
    metadata: { vaccine: name, completedAt: now.toISOString() },
  });

  const dueList = nextSchedule
    .filter((record) => record.status !== "completed")
    .map((record) => ({ name: record.name, age: formatDueLabel(record.dueAt) }));
  writeJSON(STORAGE_KEYS.vaccinesDue, dueList);

  return nextSchedule.find((record) => record.id === target.id) ?? null;
}
