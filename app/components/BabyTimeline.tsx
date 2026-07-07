"use client";

import { useEffect, useState } from "react";
import { Baby, CalendarDays, ShieldCheck } from "lucide-react";

type TimelineItem = {
  title: string;
  date: string;
  detail: string;
  tone: "emerald" | "amber" | "violet";
};

export default function BabyTimeline() {
  const [events, setEvents] = useState<TimelineItem[]>([]);

  useEffect(() => {
    try {
      const baby = JSON.parse(localStorage.getItem("babyProfile") || "{}");
      const list: TimelineItem[] = [
        { title: "Birth", date: "Aug 12", detail: baby?.name ? `${baby.name} registered at birth` : "Newborn profile created", tone: "emerald" },
        { title: "Vitamin K", date: "Aug 12", detail: "Routine newborn protection administered", tone: "violet" },
        { title: "BCG", date: "Aug 20", detail: "Tuberculosis vaccine completed", tone: "emerald" },
        { title: "OPV", date: "Sep 2", detail: "Oral polio vaccine milestone recorded", tone: "violet" },
        { title: "Hep B", date: "Sep 2", detail: "Hepatitis B vaccination completed", tone: "emerald" },
        { title: "6 weeks", date: "Sep 23", detail: "Growth monitoring and wellness review", tone: "amber" },
        { title: "10 weeks", date: "Oct 21", detail: "Development milestone captured", tone: "violet" },
        { title: "14 weeks", date: "Nov 18", detail: "Nutrition and stimulation review completed", tone: "emerald" },
      ];
      setEvents(list);
    } catch {
      setEvents([
        { title: "Birth", date: "Aug 12", detail: "Newborn profile created", tone: "emerald" },
        { title: "Vitamin K", date: "Aug 12", detail: "Routine newborn protection", tone: "violet" },
        { title: "BCG", date: "Aug 20", detail: "Tuberculosis vaccine", tone: "emerald" },
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
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-sm font-semibold text-cyan-700">
            <Baby className="h-4 w-4" />
            Baby Timeline
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-slate-900">Infant growth and care journey</h2>
          <p className="mt-2 text-sm text-slate-600">A separate lifecycle view for newborn milestones, vaccinations, and development updates.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Neonatal track</span> • Clean growth storyline
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
          Baby milestones are stored in the same BOT Chain framework for later proof.
        </div>
      </div>
    </section>
  );
}
