"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readJSON,
  readString,
  subscribeStorage,
  writeJSON,
  writeString,
  type StorageKey,
} from "../lib/storage/storageService";

export function usePersistentState<T>(
  key: StorageKey | string,
  initial: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial);

  useEffect(() => {
    const stored = readJSON<T>(key, initial);
    setValue(stored);
  }, [key, initial]);

  useEffect(() => {
    const unsubscribe = subscribeStorage((changedKey) => {
      if (changedKey === key) {
        setValue(readJSON<T>(key, initial));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [key, initial]);

  const setPersistent = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        writeJSON(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, setPersistent];
}

export function usePersistentString(
  key: StorageKey | string,
  initial = ""
): [string, (value: string) => void] {
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(readString(key, initial));
  }, [key, initial]);

  useEffect(() => {
    const unsubscribe = subscribeStorage((changedKey) => {
      if (changedKey === key) {
        setValue(readString(key, initial));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [key, initial]);

  const setPersistent = useCallback(
    (next: string) => {
      setValue(next);
      writeString(key, next);
    },
    [key]
  );

  return [value, setPersistent];
}
