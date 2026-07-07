"use client";

import { useCallback, useEffect, useState } from "react";
import { runAIAgent, type AgentRun } from "../lib/ai/AIAgent";
import { subscribeStorage, STORAGE_KEYS } from "../lib/storage/storageService";

export function useAIAgent(autoRun = false) {
  const [lastRun, setLastRun] = useState<AgentRun | null>(null);
  const [running, setRunning] = useState(false);

  const refresh = useCallback(() => {
    setRunning(true);
    try {
      const run = runAIAgent();
      setLastRun(run);
      return run;
    } catch (error) {
      console.error("AI agent failed:", error);
      return null;
    } finally {
      setRunning(false);
    }
  }, []);

  useEffect(() => {
    if (!autoRun) return;
    const timer = window.setTimeout(refresh, 300);
    return () => window.clearTimeout(timer);
  }, [autoRun, refresh]);

  useEffect(() => {
    const keys: string[] = [
      STORAGE_KEYS.motherProfile,
      STORAGE_KEYS.babyProfile,
      STORAGE_KEYS.pregnancyWeek,
      STORAGE_KEYS.currentSymptoms,
      STORAGE_KEYS.latestBP,
      STORAGE_KEYS.EmergencyMode,
      STORAGE_KEYS.vaccinesDue,
    ];
    const unsubscribe = subscribeStorage((key) => {
      if (keys.includes(key)) refresh();
    });

    return () => {
      unsubscribe();
    };
  }, [refresh]);

  return { lastRun, running, refresh, result: lastRun?.result ?? null };
}
