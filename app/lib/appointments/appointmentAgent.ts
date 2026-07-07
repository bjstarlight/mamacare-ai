import { readJSON, writeJSON, STORAGE_KEYS } from "../storage/storageService.ts";
import { recordConsentEvent } from "../blockchain/consentChain.ts";

export type AppointmentReminderType = "3-days-before" | "1-day-before" | "2-hours-before";

export type AppointmentStatus = "scheduled" | "missed" | "completed";

export type AppointmentReminder = {
  id: string;
  type: AppointmentReminderType;
  dueAt: string;
  sent: boolean;
};

export type AppointmentRecord = {
  id: string;
  title: string;
  date: string;
  location?: string;
  notes?: string;
  status: AppointmentStatus;
  reminders: AppointmentReminder[];
  needsReschedule?: boolean;
  createdAt: string;
};

export type AppointmentAgentResult = {
  appointments: AppointmentRecord[];
  reschedulePrompts: string[];
  reminderCount: number;
};

const STORAGE_KEY = STORAGE_KEYS.appointments;

function createReminder(id: string, appointmentDate: string, type: AppointmentReminderType): AppointmentReminder {
  const appointmentTime = new Date(appointmentDate);
  const reminderTime =
    type === "3-days-before"
      ? new Date(appointmentTime.getTime() - 3 * 24 * 60 * 60 * 1000)
      : type === "1-day-before"
        ? new Date(appointmentTime.getTime() - 24 * 60 * 60 * 1000)
        : new Date(appointmentTime.getTime() - 2 * 60 * 60 * 1000);

  return {
    id: `${id}-${type}`,
    type,
    dueAt: reminderTime.toISOString(),
    sent: false,
  };
}

function readAppointments(): AppointmentRecord[] {
  return readJSON<AppointmentRecord[]>(STORAGE_KEY, []);
}

function persistAppointments(appointments: AppointmentRecord[]) {
  writeJSON(STORAGE_KEY, appointments);
}

export function scheduleAppointment(input: {
  title: string;
  date: string;
  location?: string;
  notes?: string;
}): AppointmentRecord {
  const appointment: AppointmentRecord = {
    id: crypto.randomUUID(),
    title: input.title,
    date: input.date,
    location: input.location,
    notes: input.notes,
    status: "scheduled",
    reminders: [
      createReminder("appointment", input.date, "3-days-before"),
      createReminder("appointment", input.date, "1-day-before"),
      createReminder("appointment", input.date, "2-hours-before"),
    ],
    createdAt: new Date().toISOString(),
  };

  const existing = readAppointments();
  const next = [...existing, appointment];
  persistAppointments(next);

  void recordConsentEvent({
    eventType: "appointment_confirmed",
    category: "CareEvent",
    patientRef: `appointment:${appointment.id}`,
    actor: "parent",
    consentGranted: true,
    metadata: { title: appointment.title, date: appointment.date, location: input.location },
  });

  return appointment;
}

export function syncAppointmentAgent(now: Date = new Date()): AppointmentAgentResult {
  const appointments = readAppointments().map((appointment) => {
    const appointmentDate = new Date(appointment.date);
    const isOverdue = appointment.status === "scheduled" && appointmentDate < now;

    if (!isOverdue) return appointment;

    return {
      ...appointment,
      status: "missed" as const,
      needsReschedule: true,
    };
  });

  persistAppointments(appointments);

  const reschedulePrompts = appointments
    .filter((appointment) => appointment.status === "missed" && appointment.needsReschedule)
    .map((appointment) => `Your appointment "${appointment.title}" was missed. Would you like to reschedule it?`);

  return {
    appointments,
    reschedulePrompts,
    reminderCount: appointments.reduce((count, appointment) => count + appointment.reminders.length, 0),
  };
}

export function getUpcomingAppointments(now: Date = new Date()): AppointmentRecord[] {
  return readAppointments()
    .filter((appointment) => appointment.status === "scheduled")
    .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime())
    .filter((appointment) => new Date(appointment.date) >= now);
}

export function getAppointmentsForDashboard() {
  syncAppointmentAgent();
  return getUpcomingAppointments();
}
