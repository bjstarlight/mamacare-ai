import assert from "node:assert/strict";
import test from "node:test";
import {
  getUpcomingVaccines,
  markVaccineCompleted,
  syncVaccinationAgent,
} from "../app/lib/vaccinations/vaccinationAgent.ts";

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

test("syncVaccinationAgent generates a schedule from the baby's date of birth and surfaces upcoming doses", () => {
  localStorage.setItem(
    "babyProfile",
    JSON.stringify({ name: "Amina", dob: "2024-01-01" })
  );

  const result = syncVaccinationAgent(new Date("2024-02-20T12:00:00.000Z"));

  assert.equal(result.schedule.length > 0, true);
  assert.ok(result.schedule.some((item) => item.name === "Pentavalent 1"));
  assert.equal(result.upcoming.length > 0, true);
  assert.ok(result.reminders.some((item) => item.includes("Pentavalent 1")));
});

test("markVaccineCompleted updates the schedule and removes the vaccine from upcoming doses", () => {
  localStorage.setItem(
    "babyProfile",
    JSON.stringify({ name: "Amina", dob: "2024-01-01" })
  );

  syncVaccinationAgent(new Date("2024-02-20T12:00:00.000Z"));
  markVaccineCompleted("Pentavalent 1", new Date("2024-02-20T12:00:00.000Z"));

  const upcoming = getUpcomingVaccines(new Date("2024-02-20T12:00:00.000Z"));
  assert.ok(!upcoming.some((item) => item.name === "Pentavalent 1"));
});
