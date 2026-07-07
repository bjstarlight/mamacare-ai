"use client";

import { useEffect, useState } from "react";
import { Lock, Stethoscope } from "lucide-react";
import { readString, STORAGE_KEYS, writeString } from "../../lib/storage/storageService";

const DEMO_PIN = "1234";

type DoctorLoginGateProps = {
  children: React.ReactNode;
};

export default function DoctorLoginGate({ children }: DoctorLoginGateProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const session = readString(STORAGE_KEYS.doctorAuthSession);
    setAuthenticated(session === "true");
    setChecking(false);
  }, []);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pin === DEMO_PIN) {
      writeString(STORAGE_KEYS.doctorAuthSession, "true");
      setAuthenticated(true);
      setError("");
      return;
    }
    setError("Invalid PIN. Demo PIN is 1234.");
  }

  function logout() {
    writeString(STORAGE_KEYS.doctorAuthSession, "");
    setAuthenticated(false);
    setPin("");
  }

  if (checking) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-[#8A7A6D]">
        Verifying session…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#EFE4DC] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#6B2545] text-white">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#2B2118]">Doctor Portal</h2>
            <p className="text-xs text-[#8A7A6D]">Secure clinical access</p>
          </div>
        </div>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8A7A6D]">
              Enter PIN
            </span>
            <div className="relative mt-2">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A7A6D]" />
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-xl border border-[#EFE4DC] bg-[#FFF9F4] py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#6B2545]/30"
              />
            </div>
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-[#6B2545] py-3 text-sm font-semibold text-white transition hover:bg-[#7D2B4F]"
          >
            Sign in
          </button>
          <p className="text-center text-xs text-[#8A7A6D]">
            Demo hackathon PIN: <span className="font-mono">1234</span>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={logout}
          className="text-xs font-semibold text-[#6B2545] hover:underline"
        >
          Sign out
        </button>
      </div>
      {children}
    </div>
  );
}
