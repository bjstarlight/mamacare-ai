"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { STORAGE_KEYS, writeString } from "../lib/storage/storageService";

/**
 * Logging out ends the session only — it does NOT delete motherProfile,
 * babyProfile, prescriptionHistory, or any other saved data. Clearing
 * `sessionActive` (rather than `onboardingComplete`) is what lets
 * WelcomePage show a Log In screen instead of full onboarding again.
 */
export default function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  function handleLogout() {
    writeString(STORAGE_KEYS.sessionActive, "false");
    router.replace("/welcome");
  }

  if (confirming) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-white/70">Log out?</span>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-full bg-red-600 hover:bg-red-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors"
        >
          Yes, log out
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10 transition-colors ${className}`}
    >
      <LogOut className="h-3.5 w-3.5" />
      Log out
    </button>
  );
}