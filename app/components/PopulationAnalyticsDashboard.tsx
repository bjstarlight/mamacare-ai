"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Baby, HeartPulse, Hospital, Stethoscope, Syringe } from "lucide-react";

type PopulationStats = {
  enrolled: number;
  highRisk: number;
  referrals: number;
  deliveries: number;
  neonatalEmergencies: number;
  vaccinations: number;
  hospitals: number;
  doctors: number;
};

export default function PopulationAnalyticsDashboard() {
  const [stats, setStats] = useState<PopulationStats>({
    enrolled: 284,
    highRisk: 37,
    referrals: 18,
    deliveries: 29,
    neonatalEmergencies: 4,
    vaccinations: 162,
    hospitals: 6,
    doctors: 14,
  });

  useEffect(() => {
    try {
      const referrals = JSON.parse(localStorage.getItem("referrals") || "[]") as Array<{ status?: string }>;
      const protectedRecords = Number(localStorage.getItem("protectedRecords") || 0);
      setStats((current) => ({
        ...current,
        enrolled: Math.max(current.enrolled, 120 + protectedRecords),
        referrals: referrals.filter((item) => item.status && item.status !== "Draft").length || current.referrals,
      }));
    } catch {
      // Keep defaults.
    }
  }, []);

  const cards = useMemo(
    () => [
      { label: "Pregnant women enrolled", value: stats.enrolled, icon: HeartPulse },
      { label: "High-risk pregnancies", value: stats.highRisk, icon: Stethoscope },
      { label: "Active referrals", value: stats.referrals, icon: Activity },
      { label: "Deliveries this month", value: stats.deliveries, icon: Baby },
      { label: "Neonatal emergencies", value: stats.neonatalEmergencies, icon: Activity },
      { label: "Vaccinations completed", value: stats.vaccinations, icon: Syringe },
      { label: "Hospitals online", value: stats.hospitals, icon: Hospital },
      { label: "Doctors online", value: stats.doctors, icon: Stethoscope },
    ],
    [stats]
  );

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            <Activity className="h-4 w-4" />
            Population Analytics
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Hospital-level maternal health intelligence</h2>
          <p className="mt-2 text-sm text-slate-600">From individual care events to community-scale demand visibility.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Regional view</span> • Plateau state network
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Icon className="h-4 w-4" />
                {card.label}
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Operational readout</p>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-white p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk concentration</p>
            <p className="mt-1 font-semibold text-slate-900">High-risk cases cluster around Jos North and Barkin Ladi.</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Capacity pressure</p>
            <p className="mt-1 font-semibold text-slate-900">Referral load is rising 12% week over week.</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Coverage</p>
            <p className="mt-1 font-semibold text-slate-900">Vaccination uptake remains above target in three districts.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
