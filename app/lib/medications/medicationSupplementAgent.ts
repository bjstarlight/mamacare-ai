import { readJSON, STORAGE_KEYS, writeJSON } from "../storage/storageService";

export type MedicationKind = "medication" | "supplement" | "vitamin";

export type MedicationRegistryItem = {
  id: string;
  kind: MedicationKind;
  name: string;
  dosage: string;
  scheduleTimes: string[];
  notes?: string;
  active: boolean;
  createdAt: string;
};

export type MedicationDoseStatus = "taken" | "missed" | "skipped";

export type MedicationDoseLog = {
  id: string;
  medicationId: string;
  occurrenceId: string;
  scheduledAt: string;
  status: MedicationDoseStatus;
  loggedAt: string;
};

export type MedicationDoseOccurrence = {
  occurrenceId: string;
  medicationId: string;
  name: string;
  kind: MedicationKind;
  dosage: string;
  time: string;
  scheduledAt: string;
  status: "upcoming" | MedicationDoseStatus;
};

export type MedicationAgentResult = {
  registry: MedicationRegistryItem[];
  todayDoses: MedicationDoseOccurrence[];
  missedDoses: MedicationDoseOccurrence[];
  upcomingDoses: MedicationDoseOccurrence[];
  adherencePercent: number;
  summary: string;
};

function todayKey(now: Date) {
  return now.toISOString().slice(0, 10);
}

function occurrenceId(medicationId: string, dateKey: string, time: string) {
  return `${medicationId}|${dateKey}|${time}`;
}

function toIsoForTime(dateKey: string, time: string) {
  const [h, m] = time.split(":").map((value) => Number(value));
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(h) || Number.isNaN(m)) return date.toISOString();
  date.setHours(h, m, 0, 0);
  return date.toISOString();
}

function readRegistry() {
  return readJSON<MedicationRegistryItem[]>(STORAGE_KEYS.medicationRegistry, []);
}

function readDoseLogs() {
  return readJSON<MedicationDoseLog[]>(STORAGE_KEYS.medicationDoseLogs, []);
}

function normalizeTimes(times: string[]) {
  return Array.from(new Set(times.map((time) => time.trim()).filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function migrateLegacyMedicationList() {
  const registry = readRegistry();
  if (registry.length > 0) return registry;

  const legacy = readJSON<Array<{ name?: string; time?: string }>>(STORAGE_KEYS.medications, []);
  const migrated = legacy
    .filter((item) => item.name && item.time)
    .map((item) => ({
      id: crypto.randomUUID(),
      kind: "medication" as const,
      name: item.name as string,
      dosage: "As prescribed",
      scheduleTimes: [item.time as string],
      active: true,
      createdAt: new Date().toISOString(),
    }));

  if (migrated.length > 0) {
    writeJSON(STORAGE_KEYS.medicationRegistry, migrated);
  }

  return migrated;
}

function writeLegacyMedicationProjection(registry: MedicationRegistryItem[]) {
  const projected = registry
    .filter((item) => item.active)
    .flatMap((item) => item.scheduleTimes.map((time) => ({ name: item.name, schedule: time })));
  writeJSON(STORAGE_KEYS.medications, projected);
}

export function registerMedication(input: {
  kind: MedicationKind;
  name: string;
  dosage: string;
  scheduleTimes: string[];
  notes?: string;
}) {
  const registry = migrateLegacyMedicationList();
  const item: MedicationRegistryItem = {
    id: crypto.randomUUID(),
    kind: input.kind,
    name: input.name,
    dosage: input.dosage,
    scheduleTimes: normalizeTimes(input.scheduleTimes),
    notes: input.notes,
    active: true,
    createdAt: new Date().toISOString(),
  };

  const next = [item, ...registry];
  writeJSON(STORAGE_KEYS.medicationRegistry, next);
  writeLegacyMedicationProjection(next);
  return item;
}

export function removeMedication(id: string) {
  const registry = readRegistry().filter((item) => item.id !== id);
  writeJSON(STORAGE_KEYS.medicationRegistry, registry);
  writeLegacyMedicationProjection(registry);
}

export function markDoseStatus(occurrenceIdToMark: string, status: MedicationDoseStatus, now: Date = new Date()) {
  const logs = readDoseLogs().filter((entry) => entry.occurrenceId !== occurrenceIdToMark);
  const [medicationId, dateKey, time] = occurrenceIdToMark.split("|");
  const next: MedicationDoseLog = {
    id: crypto.randomUUID(),
    medicationId,
    occurrenceId: occurrenceIdToMark,
    scheduledAt: toIsoForTime(dateKey, time),
    status,
    loggedAt: now.toISOString(),
  };
  writeJSON(STORAGE_KEYS.medicationDoseLogs, [next, ...logs]);
}

function autoMarkMissedDoses(
  todayDoses: MedicationDoseOccurrence[],
  logs: MedicationDoseLog[],
  now: Date,
  persist: boolean
) {
  const missed: MedicationDoseLog[] = [];
  const merged = [...logs];

  todayDoses.forEach((dose) => {
    const hasLog = merged.some((entry) => entry.occurrenceId === dose.occurrenceId);
    if (hasLog) return;
    if (new Date(dose.scheduledAt).getTime() < now.getTime()) {
      const log: MedicationDoseLog = {
        id: crypto.randomUUID(),
        medicationId: dose.medicationId,
        occurrenceId: dose.occurrenceId,
        scheduledAt: dose.scheduledAt,
        status: "missed",
        loggedAt: now.toISOString(),
      };
      merged.unshift(log);
      missed.push(log);
    }
  });

  if (persist && missed.length > 0) {
    writeJSON(STORAGE_KEYS.medicationDoseLogs, merged);
  }

  return merged;
}

export function syncMedicationSupplementAgent(
  now: Date = new Date(),
  options: { persist?: boolean } = {}
): MedicationAgentResult {
  const persist = options.persist ?? true;
  const registry = migrateLegacyMedicationList();
  if (persist) {
    writeLegacyMedicationProjection(registry);
  }
  const dateKey = todayKey(now);
  const logs = readDoseLogs();

  const todayDoses = registry
    .filter((item) => item.active)
    .flatMap((item) =>
      item.scheduleTimes.map((time) => ({
        occurrenceId: occurrenceId(item.id, dateKey, time),
        medicationId: item.id,
        name: item.name,
        kind: item.kind,
        dosage: item.dosage,
        time,
        scheduledAt: toIsoForTime(dateKey, time),
        status: "upcoming" as const,
      }))
    )
    .sort((left, right) => left.time.localeCompare(right.time));

  const normalizedLogs = autoMarkMissedDoses(todayDoses, logs, now, persist);
  const statusByOccurrence = new Map(normalizedLogs.map((entry) => [entry.occurrenceId, entry.status]));

  const enriched = todayDoses.map((dose) => ({
    ...dose,
    status: statusByOccurrence.get(dose.occurrenceId) ?? "upcoming",
  }));

  const missedDoses = enriched.filter((dose) => dose.status === "missed");
  const upcomingDoses = enriched.filter((dose) => dose.status === "upcoming");
  const dueDoses = enriched.filter((dose) => new Date(dose.scheduledAt).getTime() <= now.getTime());
  const takenDoses = enriched.filter((dose) => dose.status === "taken");
  const adherencePercent = dueDoses.length === 0 ? 100 : Math.round((takenDoses.length / dueDoses.length) * 100);

  return {
    registry,
    todayDoses: enriched,
    missedDoses,
    upcomingDoses,
    adherencePercent,
    summary: `${takenDoses.length} taken • ${missedDoses.length} missed • ${upcomingDoses.length} upcoming`,
  };
}
