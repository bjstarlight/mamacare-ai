import { STORAGE_KEYS, type StorageKey } from "./keys.ts";

type StorageListener = (key: StorageKey, value: unknown) => void;

const listeners = new Set<StorageListener>();

function getStorage() {
  if (typeof window !== "undefined" && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== "undefined" && "localStorage" in globalThis) {
    return globalThis.localStorage as Storage;
  }
  return null;
}

function isStorageAvailable() {
  return getStorage() !== null;
}

export function readJSON<T>(key: StorageKey | string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function readString(key: StorageKey | string, fallback = ""): string {
  const storage = getStorage();
  if (!storage) return fallback;
  return storage.getItem(key) ?? fallback;
}

export function writeJSON(key: StorageKey | string, value: unknown) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
    notifyListeners(key as StorageKey, value);
  } catch {
    // best-effort
  }
}

export function writeString(key: StorageKey | string, value: string) {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(key, value);
    notifyListeners(key as StorageKey, value);
  } catch {
    // best-effort
  }
}

export function appendToArray<T>(key: StorageKey | string, item: T): T[] {
  const list = readJSON<T[]>(key, []);
  const next = [...list, item];
  writeJSON(key, next);
  return next;
}

export function subscribeStorage(listener: StorageListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners(key: StorageKey, value: unknown) {
  listeners.forEach((fn) => fn(key, value));
}

/** Re-export keys for convenience */
export { STORAGE_KEYS };
export type { StorageKey } from "./keys";
