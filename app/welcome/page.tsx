"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Baby,
  Check,
  ChevronRight,
  Heart,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { runAIAgent } from "../lib/AIOrchestrator";
import { readString, STORAGE_KEYS, writeJSON, writeString } from "../lib/storage/storageService";

// NOTE ON SECURITY: this is a local passcode lock for demo purposes —
// credentials are stored in plain text in localStorage on a single
// device. It's enough to give the app a real "log in / log out" UX,
// but it is NOT real authentication and should never be relied on to
// protect actual medical data in production.
//
// NOTE ON STORAGE_KEYS: this file references `STORAGE_KEYS.sessionActive`.
// If that key doesn't already exist in your storageService.ts, add it
// alongside the others (e.g. sessionActive: "mamacare:sessionActive").
// Everything else here reuses existing keys.

type Step = "splash" | "onboarding" | "auth" | "profile" | "care-type" | "done";
type AuthMode = "signup" | "login";

type StoredAuthUser = {
  name?: string;
  contact?: string;
  passcode?: string;
};

const ONBOARDING_SLIDES = [
  {
    title: "AI-powered maternal care",
    body: "Personalized guidance from pregnancy through your baby's first years.",
    icon: Heart,
  },
  {
    title: "Emergency-ready",
    body: "SOS, ambulance dispatch, and hospital referrals when seconds matter.",
    icon: ShieldCheck,
  },
  {
    title: "Verified health records",
    body: "Protect and share records on BOT Chain with doctors you trust.",
    icon: Baby,
  },
];

function readJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("splash");
  const [slide, setSlide] = useState(0);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState("");

  const [lmp, setLmp] = useState("");
  const [careType, setCareType] = useState<"pregnancy" | "baby" | "both" | "">("");

  // Fixed: previously this redirected straight to "/" for ANY user who
  // had ever completed onboarding, with no concept of being logged
  // out. Now onboarding-complete and session-active are tracked
  // separately, so a logged-out returning user sees a Log In screen
  // instead of bouncing straight back into the dashboard.
  useEffect(() => {
    const onboarded = readString(STORAGE_KEYS.onboardingComplete) === "true";
    const sessionActive = readString(STORAGE_KEYS.sessionActive) === "true";

    if (onboarded && sessionActive) {
      router.replace("/");
      return;
    }

    if (onboarded && !sessionActive) {
      setAuthMode("login");
      setStep("auth");
    }
  }, [router]);

  useEffect(() => {
    if (step !== "splash") return;
    const timer = window.setTimeout(() => {
      const onboarded = readString(STORAGE_KEYS.onboardingComplete) === "true";
      setStep(onboarded ? "auth" : "onboarding");
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [step]);

  function handleSignup() {
    setAuthError("");

    if (!name.trim() || !contact.trim()) {
      setAuthError("Please enter your name and a phone or email.");
      return;
    }
    if (passcode.length < 4) {
      setAuthError("Your passcode should be at least 4 digits.");
      return;
    }
    if (passcode !== confirmPasscode) {
      setAuthError("Passcodes don't match.");
      return;
    }

    setStep("profile");
  }

  function handleLogin() {
    setAuthError("");

    const stored = readJSON<StoredAuthUser>(
      localStorage.getItem(STORAGE_KEYS.authUser),
      {}
    );

    if (!stored.passcode) {
      setAuthError("No account found on this device. Please sign up.");
      return;
    }

    const contactMatches =
      !contact.trim() || stored.contact === contact.trim();

    if (!contactMatches || stored.passcode !== passcode) {
      setAuthError("Incorrect phone/email or passcode.");
      return;
    }

    writeString(STORAGE_KEYS.sessionActive, "true");
    router.replace("/");
  }

  function finishOnboarding() {
    writeJSON(STORAGE_KEYS.authUser, { name, contact, passcode });
    writeJSON(STORAGE_KEYS.motherProfile, { name, lmp });
    writeString(STORAGE_KEYS.careType, careType);
    writeString(STORAGE_KEYS.onboardingComplete, "true");
    writeString(STORAGE_KEYS.sessionActive, "true");
    writeString(STORAGE_KEYS.notificationsEnabled, "true");

    // Fixed: this used to call the deprecated runAIOrchestrator() and
    // discard the result entirely, silently dropping any
    // pendingEmergencyActions it produced. runAIAgent() is the
    // current, non-deprecated entry point; for a brand-new profile
    // there's essentially no health data yet, so emergency actions
    // are very unlikely here, but discarding a run's result is the
    // wrong pattern regardless.
    try {
      runAIAgent();
    } catch (err) {
      console.error("Initial AI care setup failed:", err);
    }

    setStep("done");
    window.setTimeout(() => router.replace("/"), 600);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#1b150f] text-[#FBF6F1] rounded-[45px]">
      {step === "splash" && (
        <div className="page-enter flex flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#6B2545] text-3xl shadow-lg">
            <Heart className="h-9 w-9" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight">MamaCare AI</h1>
          <p className="mt-3 max-w-sm text-sm text-white/70">
            Maternal & child healthcare for the BOT Chain Hackathon
          </p>
          <div className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-[#E2725B]" />
          </div>
        </div>
      )}

      {step === "onboarding" && (
        <div className="page-enter flex flex-1 flex-col px-6 py-10">
          <div className="flex flex-1 flex-col justify-center">
            {(() => {
              const current = ONBOARDING_SLIDES[slide];
              const Icon = current.icon;
              return (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6B2545]">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h2 className="mt-6 text-3xl font-semibold leading-tight">{current.title}</h2>
                  <p className="mt-4 text-base leading-7 text-white/72">{current.body}</p>
                </>
              );
            })()}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {ONBOARDING_SLIDES.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all ${
                    i === slide ? "w-8 bg-[#E2725B]" : "w-2 bg-white/30"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                slide < ONBOARDING_SLIDES.length - 1
                  ? setSlide((s) => s + 1)
                  : setStep("auth")
              }
              className="inline-flex items-center gap-2 rounded-full bg-[#E2725B] px-5 py-3 text-sm font-semibold text-white"
            >
              {slide < ONBOARDING_SLIDES.length - 1 ? "Next" : "Get started"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === "auth" && (
        <div className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
          {/* Sign Up / Log In toggle — previously there was no real
              distinction between these; every visit to this step
              behaved like signup, with no credential check at all. */}
          <div className="flex rounded-2xl bg-white/5 p-1">
            <button
              type="button"
              onClick={() => {
                setAuthMode("signup");
                setAuthError("");
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                authMode === "signup" ? "bg-[#E2725B] text-white" : "text-white/60"
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("login");
                setAuthError("");
              }}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors ${
                authMode === "login" ? "bg-[#E2725B] text-white" : "text-white/60"
              }`}
            >
              Log In
            </button>
          </div>

          <h2 className="mt-6 text-2xl font-semibold">
            {authMode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-white/70">
            {authMode === "signup"
              ? "Set up MamaCare on this device."
              : "Log in to continue where you left off."}
          </p>

          <div className="mt-5 space-y-4">
            {authMode === "signup" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-white/50">
                  Your name
                </label>
                <input
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#E2725B]"
                  placeholder="e.g. Amina Yusuf"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-white/50">
                Phone or email
              </label>
              <input
                className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#E2725B]"
                placeholder="080xxxxxxxx or you@email.com"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-white/50">
                Passcode
              </label>
              <div className="relative mt-1.5">
                <input
                  type={showPasscode ? "text" : "password"}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 pr-12 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#E2725B]"
                  placeholder="At least 4 digits"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                  aria-label={showPasscode ? "Hide passcode" : "Show passcode"}
                >
                  {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {authMode === "signup" && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-white/50">
                  Confirm passcode
                </label>
                <input
                  type={showPasscode ? "text" : "password"}
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-[#E2725B]"
                  placeholder="Re-enter your passcode"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                />
              </div>
            )}
          </div>

          {authError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-3 py-2.5 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {authError}
            </div>
          )}

          <button
            type="button"
            onClick={authMode === "signup" ? handleSignup : handleLogin}
            className="mt-6 w-full rounded-2xl bg-[#E2725B] py-3 font-semibold text-white transition-opacity hover:opacity-90"
          >
            {authMode === "signup" ? "Continue" : "Log In"}
          </button>

          <p className="mt-4 text-center text-xs text-white/40">
            Your passcode is stored only on this device and never shared.
          </p>
        </div>
      )}

      {step === "profile" && (
        <div className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E2725B]">
            Step 2 of 3
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Mother profile</h2>
          <p className="mt-2 text-sm text-white/70">Set up your health profile to personalize care.</p>

          <label className="mt-6 text-xs font-medium uppercase tracking-wide text-white/50">
            Last menstrual period (optional)
          </label>
          <input
            type="date"
            className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-[#E2725B]"
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setStep("care-type")}
            className="mt-6 w-full rounded-2xl bg-[#E2725B] py-3 font-semibold text-white"
          >
            Continue
          </button>
        </div>
      )}

      {step === "care-type" && (
        <div className="page-enter mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#E2725B]">
            Step 3 of 3
          </p>
          <h2 className="mt-2 text-2xl font-semibold">What brings you here?</h2>
          <p className="mt-2 text-sm text-white/70">We&apos;ll tailor your dashboard experience.</p>
          <div className="mt-6 space-y-3">
            {(
              [
                { id: "pregnancy", label: "Pregnancy care", desc: "Track pregnancy week by week" },
                { id: "baby", label: "Baby care", desc: "Growth, vaccines & feeding" },
                { id: "both", label: "Both", desc: "Full maternal & child journey" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setCareType(opt.id)}
                className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                  careType === opt.id
                    ? "border-[#E2725B] bg-[#6B2545]/40"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div>
                  <p className="font-semibold">{opt.label}</p>
                  <p className="text-xs text-white/60">{opt.desc}</p>
                </div>
                {careType === opt.id ? <Check className="h-5 w-5 text-[#E2725B]" /> : null}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={!careType}
            onClick={finishOnboarding}
            className="mt-6 w-full rounded-2xl bg-[#E2725B] py-3 font-semibold text-white disabled:opacity-40"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {step === "done" && (
        <div className="page-enter flex flex-1 items-center justify-center">
          <div className="text-center">
            <Check className="mx-auto h-12 w-12 text-emerald-400" />
            <p className="mt-4 text-lg font-semibold">Welcome to MamaCare</p>
          </div>
        </div>
      )}
    </div>
  );
}
