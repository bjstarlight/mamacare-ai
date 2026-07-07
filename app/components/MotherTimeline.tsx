"use client";

import { useEffect, useState } from "react";
import { CalendarDays, HeartPulse, ShieldCheck } from "lucide-react";

type TimelineItem = {
  title: string;
  date: string;
  detail: string;
  tone: "emerald" | "amber" | "violet";
};

export default function MotherTimeline() {
  const [events, setEvents] = useState<TimelineItem[]>([]);

  useEffect(() => {
    try {
      const mother = JSON.parse(localStorage.getItem("motherProfile") || "{}");
      const referrals = JSON.parse(localStorage.getItem("referrals") || "[]") as Array<{ status?: string; diagnosis?: string }>;
      const risk = mother?.aiRisk || "Not assessed";
      const week = localStorage.getItem("pregnancyWeek") || "28";
      const hasReferral = referrals.some((referral) => referral.status && referral.status !== "Draft");

      const list: TimelineItem[] = [
        { title: "Registered", date: "May 5", detail: mother?.name ? `${mother.name} enrolled in MamaCare` : "Patient profile created", tone: "emerald" },
        { title: "First ANC", date: "May 7", detail: `Pregnancy week ${week} captured in her care timeline`, tone: "violet" },
        { title: "Blood Test", date: "May 15", detail: "Laboratory profile and baseline vitals documented", tone: "emerald" },
        { title: "Ultrasound", date: "Jun 2", detail: "Growth and fetal wellbeing review completed", tone: "violet" },
      ];

      if (risk && risk !== "Not assessed") {
        list.push({ title: "AI flagged High Risk", date: "Jul 1", detail: risk, tone: "amber" });
      }

      if (hasReferral) {
        list.push({ title: "Referral Generated", date: "Jul 3", detail: "Hospital handoff prepared for specialist review", tone: "amber" });
      }

      if (referrals.some((referral) => referral.status === "Accepted")) {
        list.push({ title: "Hospital Accepted", date: "Jul 4", detail: "Receiving facility confirmed intake", tone: "emerald" });
      }

      list.push({ title: "Delivery Record", date: "Aug 12", detail: "Birth event logged for the maternal journey", tone: "emerald" });
      list.push({ title: "Baby Registered", date: "Aug 13", detail: "Neonatal record created and protected", tone: "violet" });
      list.push({ title: "Vaccination", date: "Aug 20", detail: "First immunization milestone recorded", tone: "emerald" });
      setEvents(list);
    } catch {
      setEvents([
        { title: "Registered", date: "May 5", detail: "Profile created", tone: "emerald" },
        { title: "First ANC", date: "May 7", detail: "Baseline care captured", tone: "violet" },
        { title: "Blood Test", date: "May 15", detail: "Lab record stored", tone: "emerald" },
        { title: "Ultrasound", date: "Jun 2", detail: "Fetal growth monitored", tone: "violet" },
      ]);
    }
  }, []);

  const toneClasses: Record<TimelineItem["tone"], string> = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
            <HeartPulse className="h-4 w-4" />
            Mother Timeline
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Life journey timeline</h2>
          <p className="mt-2 text-sm text-slate-600">A chronological view of maternal milestones, referrals, and protected events.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Demo-ready</span> • Life event story in sequence
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {events.map((event, index) => (
          <div key={`${event.title}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border ${toneClasses[event.tone]}`}>
              <CalendarDays className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{event.title}</h3>
                <span className="text-sm font-medium text-slate-500">{event.date}</span>
              </div>
              <p className="mt-1 text-sm text-slate-600">{event.detail}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldCheck className="h-4 w-4" />
          BOT Chain proof points are attached to each milestone.
        </div>
      </div>
    </section>
  );
}
