import assert from "node:assert/strict";
import test from "node:test";
import { recordConsentEvent } from "../app/lib/blockchain/consentChain.ts";

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

test("recordConsentEvent creates a signed audit entry with a stable hash", async () => {
  const result = await recordConsentEvent({
    eventType: "vaccination_completed",
    category: "CareEvent",
    patientRef: "baby:amina",
    actor: "parent",
    consentGranted: true,
    metadata: { vaccine: "Pentavalent 1" },
  });

  assert.equal(Boolean(result.recordHash), true);
  const stored = JSON.parse(localStorage.getItem("blockchainRecords") || "[]");
  assert.equal(stored.length > 0, true);
  assert.equal(stored[0].hash, result.recordHash);
});
