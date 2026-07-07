"use client";

import { useState } from "react";
import { Bell, QrCode, ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import { hashRecord } from "../lib/hash";

type MotherProfile = {
  name?: string;
  age?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  phone?: string;
  highRisk?: string;
  pregnancyStage?: string;
  [key: string]: unknown;
};

type BabyProfile = {
  name?: string;
  status?: string;
  dueDate?: string;
  [key: string]: unknown;
};

type DoctorConsultation = {
  summary?: string;
  doctor?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  [key: string]: unknown;
};

type EmergencyContact = {
  name?: string;
  phone?: string;
  relationship?: string;
};

type Appointment = {
  date?: string;
  doctor?: string;
  [key: string]: unknown;
};

type Prescription = {
  date?: string;
  prescription?: string;
  [key: string]: unknown;
};

function parseJson<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export default function OfflineEmergencyMode() {
  const [mother] = useState<MotherProfile>(() =>
    typeof window === "undefined"
      ? {}
      : parseJson<MotherProfile>(localStorage.getItem("motherProfile") || "{}", {})
  );
  const [baby] = useState<BabyProfile>(() =>
    typeof window === "undefined"
      ? {}
      : parseJson<BabyProfile>(localStorage.getItem("babyProfile") || "{}", {})
  );
  const [pregnancyWeek] = useState<string>(() =>
    typeof window === "undefined" ? "-" : localStorage.getItem("pregnancyWeek") || "-"
  );
  const [doctorConsultation] = useState<DoctorConsultation>(() =>
    typeof window === "undefined"
      ? {}
      : parseJson<DoctorConsultation>(
          localStorage.getItem("doctorConsultation") || "{}",
          {}
        )
  );
  const [clinicalSummary] = useState<string>(() =>
    typeof window === "undefined"
      ? "No clinical summary available."
      : localStorage.getItem("clinicalSummary") || "No clinical summary available."
  );
  const [emergencyContact] = useState<EmergencyContact>(() =>
    typeof window === "undefined"
      ? {}
      : parseJson<EmergencyContact>(localStorage.getItem("emergencyContact") || "{}", {})
  );
  const [prescriptionHistory] = useState<Prescription[]>(() =>
    typeof window === "undefined"
      ? []
      : parseJson<Prescription[]>(localStorage.getItem("prescriptionHistory") || "[]", [])
  );
  const [appointments] = useState<Appointment[]>(() =>
    typeof window === "undefined"
      ? []
      : parseJson<Appointment[]>(localStorage.getItem("appointments") || "[]", [])
  );
  const [protectedRecords] = useState<number>(() =>
    typeof window === "undefined"
      ? 0
      : Number(localStorage.getItem("protectedRecords")) || 0
  );
  const [lastVerified] = useState<string>(() =>
    typeof window === "undefined" ? "Never" : localStorage.getItem("lastVerified") || "Never"
  );
  const [isFlashing, setIsFlashing] = useState(false);

  const phoneNumber =
    emergencyContact.phone || mother.phone || "+234000000000";
  const callHref = `tel:${phoneNumber}`;

  const lastAppointment =
    appointments.length > 0
      ? `${appointments[0].date || "Date TBD"}${appointments[0].doctor ? ` with ${appointments[0].doctor}` : ""}`
      : "No upcoming appointment";

  const lastPrescription =
    prescriptionHistory.length > 0
      ? `${prescriptionHistory[0].date || "Unknown date"}: ${prescriptionHistory[0].prescription || "No prescription details"}`
      : "No prescription history stored.";

  const qrData = `MamaCare Offline Emergency\n\nMother: ${mother.name || "Unknown"}\nBlood Group: ${mother.bloodGroup || "Unknown"}\nPregnancy Week: ${pregnancyWeek}\nAllergies: ${mother.allergies || "None"}\nMedical Conditions: ${mother.medicalConditions || "None"}\nEmergency Contact: ${emergencyContact.name || "Unknown"} ${phoneNumber}\nDoctor: ${doctorConsultation.doctor || "Not available"}`;

  const playAlarm = () => {
    try {
      const windowWithAudio = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextImpl = windowWithAudio.AudioContext || windowWithAudio.webkitAudioContext;
      if (!AudioContextImpl) return;

      const audioCtx = new AudioContextImpl();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gain.gain.value = 0.25;

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        audioCtx.close();
      }, 1200);
    } catch {
      // ignore audio failures on unsupported devices
    }
  };

  const handleSOS = () => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(1000);
    }

    setIsFlashing(true);
    playAlarm();

    logBlockchainRecord({
      hash: hashRecord({
        type: "Emergency SOS",
        patient: mother.name || "Unknown Patient",
        timestamp: new Date().toISOString(),
      }),
      type: "Emergency SOS",
      patient: mother.name || "Unknown Patient",
      actor: "Patient",
      details: "Emergency SOS activated",
    });

    setTimeout(() => {
      setIsFlashing(false);
      window.location.href = callHref;
    }, 400);
  };

  return (
    <div className="relative min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-red-500 bg-slate-950 text-slate-50 shadow-2xl">
      {isFlashing && (
        <div className="pointer-events-none absolute inset-0 z-50 animate-pulse bg-white/40" />
      )}

      <div className="rounded-[2rem] bg-red-600 px-6 py-5 text-white shadow-inner shadow-red-900">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em]">⚠ OFFLINE EMERGENCY MODE</p>
            <h1 className="mt-2 text-3xl font-extrabold leading-tight">Internet unavailable.</h1>
            <p className="max-w-2xl text-sm text-red-100/90">
              Critical information loaded from secure local storage.
            </p>
          </div>
          <div className="rounded-3xl bg-white/10 px-4 py-3 text-right text-sm font-semibold text-white/95">
            Last verification: {lastVerified}
          </div>
        </div>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="space-y-6 rounded-[2rem] bg-slate-900/95 p-6 shadow-xl shadow-black/20 border border-slate-800">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-emerald-400" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Secure Offline Profile</p>
                <h2 className="text-2xl font-bold">Emergency Medical Card</h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Patient Name</p>
                <p className="mt-2 text-2xl font-semibold text-white">{mother.name || "Unknown"}</p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Age</p>
                <p className="mt-2 text-2xl font-semibold text-white">{mother.age || "—"}</p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Blood Group</p>
                <p className="mt-2 text-2xl font-semibold text-white">{mother.bloodGroup || "—"}</p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Pregnancy Week</p>
                <p className="mt-2 text-2xl font-semibold text-white">{pregnancyWeek}</p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Baby</p>
              <p className="mt-2 text-2xl font-semibold text-white">{baby.name || baby.status || "Info unavailable"}</p>
              {baby.dueDate && (
                <p className="mt-1 text-sm text-slate-400">Due {baby.dueDate}</p>
              )}
            </div>

            <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
                <p className="mt-2 text-2xl font-semibold text-white">
                  {emergencyContact.name || "Unknown"}
                </p>
                <p className="mt-1 text-sm text-slate-400">{phoneNumber}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Allergies</p>
              <p className="mt-2 text-lg font-semibold text-white">{mother.allergies || "None reported"}</p>
            </div>
            <div className="rounded-3xl bg-slate-950/80 p-5 border border-slate-800">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Medical Conditions</p>
              <p className="mt-2 text-lg font-semibold text-white">{mother.medicalConditions || "None reported"}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={callHref}
              className="flex-1 rounded-3xl bg-emerald-500 px-6 py-5 text-center text-xl font-bold text-slate-950 transition hover:bg-emerald-400"
            >
              📞 CALL EMERGENCY CONTACT
            </a>
            <button
              onClick={handleSOS}
              className="flex-1 rounded-3xl bg-red-600 px-6 py-5 text-center text-xl font-bold text-white transition hover:bg-red-700"
            >
              🚨 EMERGENCY SOS
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[2rem] bg-slate-900/95 p-6 shadow-xl shadow-black/20 border border-slate-800">
            <div className="flex items-center gap-3 text-white">
              <QrCode className="h-6 w-6" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Offline QR Code</p>
                <h2 className="text-xl font-semibold">Emergency data for first responders</h2>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center rounded-3xl bg-white/10 p-4">
              <QRCode value={qrData} size={180} />
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">
              Scan this QR without internet to share the patient&apos;s key emergency details and contact.
            </p>
          </div>

          <div className="rounded-[2rem] bg-slate-900/95 p-6 shadow-xl shadow-black/20 border border-slate-800">
            <div className="flex items-center gap-3">
              <Bell className="h-6 w-6 text-pink-400" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Last AI Summary</p>
                <h2 className="text-xl font-semibold">Recent offline records</h2>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-950/80 p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Clinical Summary</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{clinicalSummary}</p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Doctor Visit</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {doctorConsultation.doctor || "Unknown doctor"} – {doctorConsultation.diagnosis || "No diagnosis recorded."}
                </p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last Prescription</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{lastPrescription}</p>
              </div>

              <div className="rounded-3xl bg-slate-950/80 p-4 border border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Next Appointment</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">{lastAppointment}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-900/95 p-6 shadow-xl shadow-black/20 border border-slate-800">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Offline BOT Verification Badge</p>
                <h2 className="text-xl font-semibold">Protected records status</h2>
              </div>
            </div>

            <div className="mt-5 grid gap-3 rounded-3xl bg-slate-950/85 p-5 border border-slate-800">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Last Blockchain Verification</span>
                <span>{lastVerified}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Verified</span>
                <span>{lastVerified !== "Never" ? "Yes" : "Pending"}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-300">
                <span>Protected Records</span>
                <span>{protectedRecords}</span>
              </div>
              <div className="rounded-3xl bg-blue-600/10 px-4 py-3 text-sm text-blue-200">
                Waiting for synchronization...
              </div>
            </div>
          </div>
        </aside>
      </div>

      <button
        onClick={handleSOS}
        className="fixed bottom-6 right-6 z-50 flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-3xl shadow-2xl shadow-red-500/40 transition hover:bg-red-700"
        aria-label="Emergency SOS"
      >
        🚨
      </button>
    </div>
  );
}
