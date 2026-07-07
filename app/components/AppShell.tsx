"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Menu, ShieldCheck, X } from "lucide-react";
import {
  normalizeSection,
  primaryNavigation,
  type AppSection,
  type PrimarySection,
} from "../config/productFlow";

type AppShellProps = {
  children: React.ReactNode;
  activeSection: AppSection;
  onNavigate: (section: AppSection) => void;
};

const navItems = primaryNavigation;

export default function AppShell({ children, activeSection, onNavigate }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentLabel = useMemo(
    () =>
      navItems.find((item) => item.id === normalizeSection(activeSection))
        ?.label || "Home",
    [activeSection]
  );

  const handleNavigate = (section: PrimarySection) => {
    onNavigate(section);
  };

  return (
    <div className="min-h-screen bg-[#F7F0E8] text-[#2B2118]">
      <header className="sticky top-0 z-20 border-b border-[#EFE4DC] bg-[#FFF9F4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-full border border-[#EFE4DC] bg-white p-2 lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#B5533F]">MamaCare AI</p>
              <h1 className="text-lg font-semibold text-[#2B2118]">{currentLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 sm:flex">
              <ShieldCheck className="h-4 w-4" />
              BOT Chain Verified
            </div>
            <Link href="/hospital" className="rounded-full bg-[#6B2545] px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7D2B4F]">
              Hospital
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-[1.5rem] border border-[#EFE4DC] bg-white p-4 shadow-sm lg:block">
          <div className="space-y-1">
            {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition ${active ? "bg-[#6B2545] text-white shadow-sm" : "text-[#5C4C40] hover:bg-[#FFF3E9]"}`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>
                        <span className="block">{item.label}</span>
                        <span className="mt-0.5 block text-xs font-normal opacity-70">
                          {item.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
          </div>
        </aside>

        {mobileOpen ? (
          <div className="fixed inset-0 z-30 bg-[#2B2118]/70 p-4 lg:hidden">
            <div className="rounded-[1.5rem] border border-[#EFE4DC] bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#2B2118]">Navigation</p>
                <button onClick={() => setMobileOpen(false)} className="rounded-full border border-[#EFE4DC] p-2">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleNavigate(item.id);
                        setMobileOpen(false);
                      }}
                      className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium ${active ? "bg-[#6B2545] text-white" : "bg-[#FFF7F2] text-[#5C4C40]"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <nav className="sticky bottom-0 z-20 border-t border-[#EFE4DC] bg-[#FFF9F4]/95 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl justify-between gap-2 px-3 py-2">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-medium ${active ? "bg-[#6B2545] text-white" : "text-[#6B4F3D]"}`}
              >
                <Icon className="h-4 w-4" />
                {item.shortLabel}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
