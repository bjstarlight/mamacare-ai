"use client";

import type { LucideIcon } from "lucide-react";

type ModuleSectionProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  actions?: React.ReactNode;
  contained?: boolean;
};

export default function ModuleSection({
  title,
  eyebrow,
  description,
  icon: Icon,
  children,
  actions,
  contained = true,
}: ModuleSectionProps) {
  return (
    <section
      className={
        contained
          ? "rounded-2xl border border-[#EFE4DC] bg-white p-5 shadow-sm sm:p-6"
          : "space-y-5"
      }
    >
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#B5533F]">
              {eyebrow}
            </p>
          ) : null}
          <div className="mt-1 flex items-center gap-2">
            {Icon ? <Icon className="h-5 w-5 text-[#6B2545]" /> : null}
            <h2 className="text-xl font-semibold text-[#2B2118] sm:text-2xl">
              {title}
            </h2>
          </div>
          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-6 text-[#6B4F3D]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
