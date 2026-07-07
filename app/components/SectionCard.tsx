"use client";

import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: "default" | "accent" | "success";
};

export default function SectionCard({ title, subtitle, children, tone = "default" }: SectionCardProps) {
  const toneClasses = {
    default: "border-[#EFE4DC] bg-white",
    accent: "border-[#E7CFC8] bg-[#FFF7F2]",
    success: "border-emerald-200 bg-emerald-50/70",
  };

  return (
    <section className={`rounded-[1.5rem] border p-5 shadow-sm sm:p-6 ${toneClasses[tone]}`}>
      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-[#2B2118]">{title}</h3>
        {subtitle ? <p className="text-sm text-[#7A6A5D]">{subtitle}</p> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}
