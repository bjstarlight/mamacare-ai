"use client";

import Link from "next/link";
import type { AppSection } from "../../config/productFlow";
import { dashboardDestinations } from "../../config/navigationMap";

type DashboardHubProps = {
  openSection: (section: AppSection | string, subview?: string) => void;
  motherName?: string;
};

export default function DashboardHub({ openSection, motherName }: DashboardHubProps) {
  const groups = [
    { id: "care", label: "Your Care" },
    { id: "emergency", label: "Emergency" },
    { id: "clinical", label: "Clinical & Records" },
    { id: "system", label: "App" },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B5533F]">
          Explore
        </p>
        <h2 className="mt-1 text-xl font-semibold text-[#2B2118]">
          {motherName ? `${motherName}'s care hub` : "Your care hub"}
        </h2>
        <p className="mt-1 text-sm text-[#6B4F3D]">
          Every card opens a working screen. Tap to continue your journey.
        </p>
      </div>

      {groups.map((group) => {
        const items = dashboardDestinations.filter((d) => d.group === group.id);
        if (items.length === 0) return null;

        return (
          <section key={group.id}>
            <h3 className="mb-3 text-sm font-semibold text-[#5C4C40]">{group.label}</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((dest) => {
                const Icon = dest.icon;
                const className = `card-lift group relative overflow-hidden rounded-2xl bg-gradient-to-br ${dest.tint} p-4 text-left shadow-sm transition`;

                const inner = (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h4 className="mt-3 text-sm font-semibold leading-tight">{dest.label}</h4>
                    <p className="mt-1 text-xs opacity-80">{dest.subtitle}</p>
                  </>
                );

                if (dest.href) {
                  return (
                    <Link key={dest.id} href={dest.href} className={className}>
                      {inner}
                    </Link>
                  );
                }

                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => dest.section && openSection(dest.section, dest.subview)}
                    className={className}
                  >
                    {inner}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
