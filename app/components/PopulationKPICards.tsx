"use client";

import {
  Users,
  HeartPulse,
  Baby,
  ShieldCheck,
  AlertTriangle,
  Ambulance,
  Database,
  WifiOff,
} from "lucide-react";

export default function PopulationKPICards() {
  const cards = [
    {
      title: "Registered Mothers",
      value: "2,483",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      progress: 92,
    },
    {
      title: "High Risk Pregnancies",
      value: "124",
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
      progress: 65,
    },
    {
      title: "Deliveries Today",
      value: "18",
      icon: Baby,
      color: "text-pink-600",
      bg: "bg-pink-50",
      progress: 75,
    },
    {
      title: "Emergency SOS",
      value: "6",
      icon: Ambulance,
      color: "text-orange-600",
      bg: "bg-orange-50",
      progress: 80,
    },
    {
      title: "BOT Verified Records",
      value: "15,622",
      icon: ShieldCheck,
      color: "text-green-600",
      bg: "bg-green-50",
      progress: 95,
    },
    {
      title: "Offline Records",
      value: "9",
      icon: WifiOff,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      progress: 50,
    },
    {
      title: "Clinical Records",
      value: "21,480",
      icon: Database,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      progress: 85,
    },
    {
      title: "Active Patients",
      value: "364",
      icon: HeartPulse,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      progress: 80,
    },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">{card.title}</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-800">{card.value}</h2>
              </div>

              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${card.bg}`}>
                <Icon className={`h-7 w-7 ${card.color}`} />
              </div>
            </div>

            <div className="mt-5 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-blue-600" style={{ width: `${card.progress}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
