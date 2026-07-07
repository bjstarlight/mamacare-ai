"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type PortalLayoutProps = {
  children: React.ReactNode;
  title: string;
  eyebrow?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
};

export default function PortalLayout({
  children,
  title,
  eyebrow,
  description,
  backHref = "/",
  backLabel = "Back to Dashboard",
}: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F0E8] text-[#2B2118]">
      <header className="sticky top-0 z-20 border-b border-[#EFE4DC] bg-[#FFF9F4]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 rounded-full border border-[#EFE4DC] bg-white px-3 py-2 text-sm font-medium text-[#6B2545] transition hover:bg-[#FFF3E9]"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B5533F]">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="truncate text-lg font-semibold text-[#2B2118]">{title}</h1>
          </div>
        </div>
      </header>
      <main className="page-enter mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {description ? (
          <p className="mb-6 max-w-3xl text-sm leading-6 text-[#6B4F3D]">{description}</p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
