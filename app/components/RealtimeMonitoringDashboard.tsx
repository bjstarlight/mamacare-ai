"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Activity, HeartPulse, ShieldCheck, Stethoscope } from "lucide-react";
import VitalCard from "./VitalCard";
import MonitoringTimeline from "./MonitoringTimeline";
import ConnectedDevices from "./ConnectedDevices";
import DoctorAlerts from "./DoctorAlerts";
import HospitalStats from "./HospitalStats";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import { hashRecord } from "../lib/hash";

type VitalSnapshot = {
  bloodPressure: string;
  heartRate: string;
  temperature: string;
  oxygen: string;
  bloodSugar: string;
  pregnancyWeek: string;
  babyHeartRate: string;
};

function parseVitalSnapshot(raw: string | null): VitalSnapshot {
  try {
    const parsed = JSON.parse(raw || "{}");
    return {
      bloodPressure: parsed.bloodPressure || "120/80",
      heartRate: parsed.heartRate || "82",
      temperature: parsed.temperature || "36.8°C",
      oxygen: parsed.oxygen || "98%",
      bloodSugar: parsed.bloodSugar || "92 mg/dL",
      pregnancyWeek: parsed.pregnancyWeek || "31",
      babyHeartRate: parsed.babyHeartRate || "145",
    };
  } catch {
    return {
      bloodPressure: "120/80",
      heartRate: "82",
      temperature: "36.8°C",
      oxygen: "98%",
      bloodSugar: "92 mg/dL",
      pregnancyWeek: "31",
      babyHeartRate: "145",
    };
  }
}

function parseNumber(value: string): number {
  const match = `${value}`.match(/\d+/g);
  return match ? Number(match[0]) : 0;
}

export default function RealtimeMonitoringDashboard() {
  const [snapshot, setSnapshot] = useState<VitalSnapshot>(() => parseVitalSnapshot(localStorage.getItem("vitalSigns")));
  const [lastUpdated, setLastUpdated] = useState("2 mins ago");
  const [riskLevel, setRiskLevel] = useState<"Stable" | "Moderate" | "High">("Stable");
  const [riskScore, setRiskScore] = useState(21);
  const [alerts, setAlerts] = useState<string[]>([
    "Blood pressure increased 3 mins ago",
    "Patient missed medication Today",
    "Abnormal fetal movement Yesterday",
  ]);

  useEffect(() => {
    const saved = localStorage.getItem("vitalSigns");
    if (saved) {
      setSnapshot(parseVitalSnapshot(saved));
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSnapshot((current) => {
        const nextHeartRate = Math.max(76, Math.min(90, parseNumber(current.heartRate) + (Math.random() > 0.5 ? 1 : -1)));
        const nextBloodPressure = Math.max(110, Math.min(132, parseNumber(current.bloodPressure.split("/")[0]) + (Math.random() > 0.5 ? 2 : -2)));
        const nextOxygen = Math.max(95, Math.min(100, parseNumber(current.oxygen) + (Math.random() > 0.5 ? 1 : -1)));
        const nextSugar = Math.max(82, Math.min(110, parseNumber(current.bloodSugar) + (Math.random() > 0.5 ? 1 : -1)));
        const nextBabyHeartRate = Math.max(138, Math.min(150, parseNumber(current.babyHeartRate) + (Math.random() > 0.5 ? 1 : -1)));

        const updated = {
          ...current,
          heartRate: `${nextHeartRate} bpm`,
          bloodPressure: `${nextBloodPressure}/${Math.max(70, nextBloodPressure - 40)}`,
          oxygen: `${nextOxygen}%`,
          bloodSugar: `${nextSugar} mg/dL`,
          babyHeartRate: `${nextBabyHeartRate}`,
        };

        localStorage.setItem("vitalSigns", JSON.stringify(updated));
        setLastUpdated("Just now");

        const nextRisk = nextHeartRate > 88 || nextBloodPressure > 128 || nextSugar > 100 ? "Moderate" : "Stable";
        setRiskLevel(nextRisk);
        setRiskScore(Math.max(12, Math.min(40, 21 + (nextRisk === "Moderate" ? 4 : 0))));

        logBlockchainRecord({
          hash: hashRecord({
            type: "Monitoring Update",
            heartRate: nextHeartRate,
            bloodPressure: updated.bloodPressure,
            timestamp: new Date().toISOString(),
          }),
          type: "Monitoring Update",
          patient: "Current Patient",
          actor: "AI Monitor",
          details: `Live monitoring update at ${new Date().toLocaleTimeString()}`,
        });

        return updated;
      });
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const vitals = useMemo(
    () => [
      {
        label: "Heart Rate",
        value: snapshot.heartRate,
        unit: "bpm",
        series: [78, 80, 82, 84, 86, 84, 82],
        color: "#2563eb",
      },
      {
        label: "Blood Pressure",
        value: snapshot.bloodPressure,
        unit: "mmHg",
        series: [118, 120, 122, 124, 126, 123, 121],
        color: "#ef4444",
      },
      {
        label: "Temperature",
        value: snapshot.temperature,
        unit: "°C",
        series: [36.6, 36.7, 36.8, 36.8, 36.9, 36.8, 36.8],
        color: "#7c3aed",
      },
      {
        label: "Blood Oxygen",
        value: snapshot.oxygen,
        unit: "%",
        series: [96, 97, 97, 98, 98, 99, 98],
        color: "#0f766e",
      },
      {
        label: "Blood Sugar",
        value: snapshot.bloodSugar,
        unit: "mg/dL",
        series: [88, 90, 91, 92, 94, 93, 92],
        color: "#ea580c",
      },
    ],
    [snapshot]
  );

  const timeline = [
    { time: "08:00", label: "Vitals Recorded" },
    { time: "09:00", label: "Medication Taken" },
    { time: "10:15", label: "BP Checked" },
    { time: "11:40", label: "AI Analysis Completed" },
    { time: "12:00", label: "Doctor Reviewed" },
  ];

  const devices = [
    { name: "Smart BP Monitor", online: true },
    { name: "Pulse Oximeter", online: true },
    { name: "Smart Watch", online: true },
    { name: "Baby Doppler", online: true },
    { name: "Weight Scale", online: false },
  ];

  const aiAlerts = [
    "✓ Stable fetal heart rate",
    "✓ Blood pressure normal",
    "⚠ Increased swelling reported yesterday",
    "⚠ Blood glucose rising",
    "✓ No emergency indicators detected",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-emerald-600 via-emerald-500 to-cyan-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-100">Real-Time Monitoring</p>
            <h2 className="mt-2 text-3xl font-semibold">Patient Status</h2>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-semibold backdrop-blur">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              {riskLevel === "High" ? "High risk" : riskLevel === "Moderate" ? "Moderate" : "Stable"}
            </div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm text-emerald-50">Last update</p>
            <p className="mt-1 text-xl font-semibold">{lastUpdated}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-emerald-50">Heart Rate</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.heartRate}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-emerald-50">Blood Pressure</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.bloodPressure}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-emerald-50">Temperature</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.temperature}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-emerald-50">Blood Oxygen</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.oxygen}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-emerald-50">Blood Sugar</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.bloodSugar}</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="text-sm text-emerald-50">Baby Heart Rate</p>
              <p className="mt-2 text-2xl font-semibold">{snapshot.babyHeartRate} bpm</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/20 bg-slate-950/20 p-4 backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-emerald-50">Overall Status</p>
                <p className="mt-2 text-2xl font-semibold">{riskLevel}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3 text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-100">Risk Score</p>
                <p className="mt-1 text-xl font-semibold">{riskScore}%</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-emerald-50">
              Last analysed <span className="font-semibold">2 minutes ago</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {vitals.map((card) => (
              <VitalCard key={card.label} label={card.label} value={card.value} unit={card.unit} series={card.series} color={card.color} />
            ))}
          </div>
          <MonitoringTimeline items={timeline} />
          <ConnectedDevices devices={devices} />
        </div>

        <div className="space-y-6">
          <DoctorAlerts alerts={alerts} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-cyan-700" />
              <h3 className="text-lg font-semibold text-slate-900">AI Live Alerts</h3>
            </div>
            <div className="mt-4 space-y-3">
              {aiAlerts.map((alert) => (
                <div key={alert} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                  {alert}
                </div>
              ))}
            </div>
          </div>
          <HospitalStats patientsOnline={28} highRisk={3} moderate={8} stable={17} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-slate-900">BOT Chain Status</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Today&apos;s logs</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">15</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">Verified</p>
                <p className="mt-1 text-xl font-semibold text-emerald-700">15</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending</p>
                <p className="mt-1 text-xl font-semibold text-slate-900">0</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              Last sync <span className="font-semibold text-slate-900">2 mins ago</span>
            </div>
          </div>
        </div>
      </section>

      {riskLevel === "High" && (
        <div className="rounded-[2rem] border border-rose-300 bg-rose-50 p-6 text-rose-800 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em]">Emergency</p>
              <h3 className="text-2xl font-semibold">High Risk Pregnancy</h3>
              <p className="mt-1 text-sm">Doctor review required. Immediate assessment recommended.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
