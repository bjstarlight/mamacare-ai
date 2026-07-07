"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  firstVisitWorkflow,
  returningUserFlow,
  type WorkflowStep,
} from "../config/productFlow";
import { readJSON, readString, STORAGE_KEYS, writeJSON } from "../lib/storage/storageService";

export type WorkflowState = {
  completedSteps: string[];
  isFirstVisit: boolean;
  currentStepId: string | null;
  lastUpdated: string;
};

function detectCompletedSteps(): string[] {
  const completed: string[] = [];
  const mother = readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {});
  const pregnancyWeek = readString(STORAGE_KEYS.pregnancyWeek);
  const baby = readJSON<{ name?: string }>(STORAGE_KEYS.babyProfile, {});
  const notificationsEnabled =
    readJSON<boolean>(STORAGE_KEYS.notificationsEnabled, false) ||
    readJSON<unknown[]>(STORAGE_KEYS.notifications, []).length > 0;
  const walletActive =
    Number(readString(STORAGE_KEYS.protectedRecords, "0")) > 0 ||
    readJSON<unknown[]>(STORAGE_KEYS.blockchainRecords, []).length > 0;

  if (mother.name) completed.push("mother-profile");
  if (pregnancyWeek) completed.push("pregnancy-details");
  if (completed.includes("mother-profile") && completed.includes("pregnancy-details")) {
    completed.push("ai-assessment");
  }
  if (baby.name) completed.push("baby-profile");
  if (notificationsEnabled) completed.push("notifications");
  if (walletActive) completed.push("health-wallet");

  return completed;
}

function loadWorkflowState(): WorkflowState {
  const stored = readJSON<WorkflowState | null>(STORAGE_KEYS.careWorkflow, null);
  const completedSteps = detectCompletedSteps();
  const isFirstVisit = completedSteps.length < firstVisitWorkflow.length;

  const currentStep =
    firstVisitWorkflow.find((step) => !completedSteps.includes(step.id)) ?? null;

  return {
    completedSteps,
    isFirstVisit,
    currentStepId: currentStep?.id ?? null,
    lastUpdated: stored?.lastUpdated ?? new Date().toISOString(),
  };
}

export function useCareWorkflow() {
  const [workflow, setWorkflow] = useState<WorkflowState>(() => ({
    completedSteps: [],
    isFirstVisit: true,
    currentStepId: null,
    lastUpdated: new Date().toISOString(),
  }));

  const refresh = useCallback(() => {
    const next = loadWorkflowState();
    setWorkflow(next);
    writeJSON(STORAGE_KEYS.careWorkflow, next);
    return next;
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentStep = useMemo(
    () => firstVisitWorkflow.find((s) => s.id === workflow.currentStepId) ?? null,
    [workflow.currentStepId]
  );

  const progressPercent = useMemo(() => {
    const done = workflow.completedSteps.filter((id) =>
      firstVisitWorkflow.some((s) => s.id === id)
    ).length;
    return Math.round((done / firstVisitWorkflow.length) * 100);
  }, [workflow.completedSteps]);

  const returningSteps = useMemo(() => returningUserFlow, []);

  const completeStep = useCallback(
    (stepId: string) => {
      const next: WorkflowState = {
        ...workflow,
        completedSteps: [...new Set([...workflow.completedSteps, stepId])],
        isFirstVisit: false,
        lastUpdated: new Date().toISOString(),
      };
      const pending = firstVisitWorkflow.find((s) => !next.completedSteps.includes(s.id));
      next.currentStepId = pending?.id ?? null;
      next.isFirstVisit = next.completedSteps.length < firstVisitWorkflow.length;
      setWorkflow(next);
      writeJSON(STORAGE_KEYS.careWorkflow, next);
      return next;
    },
    [workflow]
  );

  return {
    workflow,
    currentStep,
    progressPercent,
    firstVisitSteps: firstVisitWorkflow,
    returningSteps,
    refresh,
    completeStep,
    isFirstVisit: workflow.isFirstVisit,
  };
}

export type { WorkflowStep };
