"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { vaccines } from "../data/vaccines";
import { pregnancyTips } from "../lib/pregnancyTips";
import { runAIOrchestrator } from "../lib/AIOrchestrator";
import type { AppSection } from "../config/productFlow";
import { parseSectionHash } from "../config/productFlow";
import {
  readJSON,
  readString,
  STORAGE_KEYS,
  subscribeStorage,
  writeString,
} from "../lib/storage/storageService";

export type ChatMessage = {
  role: "user" | "assistant";
  text: string;
  agentSummary?: string;
  routedAgents?: string[];
  recommendations?: Array<{ title: string; description?: string; priority?: string }>;
  riskLevel?: string;
  followUpQuestion?: string;
};

type AIOrchestratorResult = ReturnType<typeof runAIOrchestrator> | null;

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function useMamaCareAppState() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [emergency, setEmergency] = useState(false);
  const [pregnancyWeek, setPregnancyWeek] = useState("");
  const [weekAdvice, setWeekAdvice] = useState("");
  const [babyAge, setBabyAge] = useState("");
  const [dueVaccines, setDueVaccines] = useState<string[]>([]);
  const [babyDOB, setBabyDOB] = useState("");
  const [babyAgeText, setBabyAgeText] = useState("");
  const [activeSection, setActiveSection] = useState<AppSection>("dashboard");
  const [activeSubview, setActiveSubview] = useState<string | null>(null);
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [protectedRecords, setProtectedRecords] = useState(0);
  const [lastVerified, setLastVerified] = useState("Never");
  const [motherName, setMotherName] = useState("");
  const [orchestratorResult, setOrchestratorResult] =
    useState<AIOrchestratorResult>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshAI = useCallback(() => {
    if (typeof window === "undefined") return null;

    try {
      const result = runAIOrchestrator();
      setOrchestratorResult(result);
      return result;
    } catch (error) {
      console.error("AI refresh failed:", error);
      return null;
    }
  }, []);

  const hydrateFromStorage = useCallback(() => {
    const savedBabyAge = readString(STORAGE_KEYS.babyAgeText);
    const mother = readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {});

    setProtectedRecords(Number(readString(STORAGE_KEYS.protectedRecords, "0")) || 0);
    setLastVerified(readString(STORAGE_KEYS.lastVerified, "Never"));
    setBabyAge(savedBabyAge);
    setBabyAgeText(savedBabyAge);
    setPregnancyWeek(readString(STORAGE_KEYS.pregnancyWeek));
    setMotherName(mother.name ?? "");
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      hydrateFromStorage();
      refreshAI();

      const parsed = parseSectionHash(window.location.hash);
      if (parsed?.section) {
        setActiveSection(parsed.section);
        if (parsed.subview) setActiveSubview(parsed.subview);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [hydrateFromStorage, refreshAI]);

  useEffect(() => {
    const unsubscribe = subscribeStorage((key) => {
      if (
        key === STORAGE_KEYS.protectedRecords
        || key === STORAGE_KEYS.lastVerified
        || key === STORAGE_KEYS.latestTransaction
        || key === STORAGE_KEYS.botChainMilestones
      ) {
        hydrateFromStorage();
      }
    });

    return () => {
  unsubscribe();
};
  }, [hydrateFromStorage]);

  useEffect(() => {
    function onHashChange() {
      const parsed = parseSectionHash(window.location.hash);
      if (!parsed?.section) return;
      setActiveSection(parsed.section);
      setActiveSubview(parsed.subview || null);
    }
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigateTo = useCallback((section: AppSection, subview?: string) => {
    setActiveSection(section);
    setActiveSubview(subview ?? null);
    if (subview) {
      window.location.hash = `${section}-${subview}`;
    } else if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const processMessage = useCallback(async (userMessage: string) => {
    const symptomWords = [
      "fever",
      "cough",
      "diarrhea",
      "vomiting",
      "rash",
      "pain",
      "headache",
      "bleeding",
    ];

    const hasSymptoms = symptomWords.some((word) =>
      userMessage.toLowerCase().includes(word)
    );

    setShowSymptomChecker((prev) => prev || hasSymptoms);

    const emergencyWords = [
      "convulsion",
      "convulsions",
      "seizure",
      "not breathing",
      "difficulty breathing",
      "unconscious",
      "heavy bleeding",
      "severe bleeding",
      "blue lips",
      "cannot wake",
    ];

    const isEmergency = emergencyWords.some((word) =>
      userMessage.toLowerCase().includes(word)
    );

    setEmergency((prev) => prev || isEmergency);
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          pregnancyWeek: readString(STORAGE_KEYS.pregnancyWeek),
          motherName: readJSON<{ name?: string }>(STORAGE_KEYS.motherProfile, {}).name,
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: data.reply,
          agentSummary: data.agentSummary,
          routedAgents: data.routedAgents,
          recommendations: data.recommendations,
          riskLevel: data.riskLevel,
          followUpQuestion: data.followUpQuestion,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
      refreshAI();
      hydrateFromStorage();
    }
  }, [refreshAI, hydrateFromStorage]);

  const sendMessage = useCallback(async () => {
    if (!message.trim()) return;
    await processMessage(message);
  }, [message, processMessage]);

  const quickQuestion = useCallback(
    async (text: string, isMedicalComplaint = false) => {
      setShowSymptomChecker(isMedicalComplaint);
      setEmergency(isMedicalComplaint);
      setActiveSection("ai");
      await processMessage(text);
    },
    [processMessage]
  );

  const checkPregnancyWeek = useCallback(() => {
    const week = Number(pregnancyWeek);
    refreshAI();

    if (Number.isNaN(week) || week < 1 || week > 40) {
      setWeekAdvice("Please enter a valid pregnancy week (1-40).");
      return;
    }

    const stage = pregnancyTips.find(
      (tip) => week >= tip.startWeek && week <= tip.endWeek
    );

    if (!stage) {
      setWeekAdvice("No advice available.");
      return;
    }

    const advice =
      `Week ${week}\n\n` +
      `${stage.title}\n\n` +
      stage.tips.map((tip) => `- ${tip}`).join("\n");

    setWeekAdvice(advice);
    writeString(STORAGE_KEYS.pregnancyWeek, pregnancyWeek);
    refreshAI();
  }, [pregnancyWeek, refreshAI]);

  const checkVaccines = useCallback(() => {
    const result = vaccines.find(
      (v) => v.age.toLowerCase() === babyAge.toLowerCase()
    );

    refreshAI();
    setDueVaccines(result ? result.vaccines : []);
  }, [babyAge, refreshAI]);

  const calculateBabyAge = useCallback(() => {
    if (!babyDOB) return;

    const birth = new Date(babyDOB);
    const today = new Date();

    const diffDays = Math.floor(
      (today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)
    );

    const weeks = Math.floor(diffDays / 7);
    const months = Math.floor(diffDays / 30);
    const age =
      months >= 1
        ? `${months} month${months > 1 ? "s" : ""}`
        : `${weeks} week${weeks !== 1 ? "s" : ""}`;

    setBabyAgeText(age);
    setBabyAge(age);
    writeString(STORAGE_KEYS.babyAgeText, age);
    writeString(STORAGE_KEYS.babyAgeMonths, String(months));
    refreshAI();
  }, [babyDOB, refreshAI]);

  const weekNumber = Number(pregnancyWeek);
  const hasPregnancyProgress =
    !Number.isNaN(weekNumber) && weekNumber >= 1 && weekNumber <= 40;
  const journeyPercent = hasPregnancyProgress ? (weekNumber / 40) * 100 : 0;

  return {
    activeSection,
    activeSubview,
    babyAge,
    babyAgeText,
    babyDOB,
    bottomRef,
    checkPregnancyWeek,
    checkVaccines,
    calculateBabyAge,
    dueVaccines,
    emergency,
    hasPregnancyProgress,
    journeyPercent,
    lastVerified,
    loading,
    message,
    messages,
    motherName,
    navigateTo,
    orchestratorResult,
    pregnancyWeek,
    processMessage,
    protectedRecords,
    quickQuestion,
    refreshAI,
    sendMessage,
    setActiveSection,
    setActiveSubview,
    setBabyAge,
    setBabyDOB,
    setMessage,
    setPregnancyWeek,
    showSymptomChecker,
    vaccines,
    weekAdvice,
    weekNumber,
    hydrateFromStorage,
  };
}
