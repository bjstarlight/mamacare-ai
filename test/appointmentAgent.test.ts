import assert from "node:assert/strict";
import test from "node:test";
import { scheduleAppointment, syncAppointmentAgent } from "../app/lib/appointments/appointmentAgent.ts";

class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string) { return this.store.has(key) ? this.store.get(key)! : null; }
  setItem(key: string, value: string) { this.store.set(key, value); }
  removeItem(key: string) { this.store.delete(key); }
  clear() { this.store.clear(); }
  key(index: number) { return Array.from(this.store.keys())[index] ?? null; }
  get length() { return this.store.size; }
}

const storage = new MemoryStorage();

Object.defineProperty(globalThis, "localStorage", {
  value: storage,
  configurable: true,
});

test("scheduleAppointment creates reminders and persists them", () => {
  const appointment = scheduleAppointment({
    title: "Antenatal visit",
    date: "2030-01-10T09:00:00.000Z",
    location: "Kibera Clinic",
    notes: "Bring records",
  });

  assert.equal(appointment.status, "scheduled");
  assert.equal(appointment.reminders.length, 3);
  assert.equal(appointment.reminders[0].type, "3-days-before");
  assert.equal(appointment.reminders[1].type, "1-day-before");
  assert.equal(appointment.reminders[2].type, "2-hours-before");
});

test("syncAppointmentAgent marks overdue appointments as missed and prompts reschedule", () => {
  const past = scheduleAppointment({
    title: "Missed visit",
    date: "2020-01-10T09:00:00.000Z",
    location: "Kibera Clinic",
  });

  const result = syncAppointmentAgent(new Date("2020-01-11T10:00:00.000Z"));

  const updated = result.appointments.find((item) => item.id === past.id);
  assert.ok(updated);
  assert.equal(updated?.status, "missed");
  assert.equal(updated?.needsReschedule, true);
  assert.equal(result.reschedulePrompts.length, 1);
});
