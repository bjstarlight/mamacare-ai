"use client";

import { useEffect } from "react";

type SectionAnchorProps = {
  id: string;
  children: React.ReactNode;
  className?: string;
  scrollTo?: boolean;
};

export default function SectionAnchor({
  id,
  children,
  className = "",
  scrollTo = false,
}: SectionAnchorProps) {
  useEffect(() => {
    if (!scrollTo) return;
    const el = document.getElementById(id);
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
    return () => window.clearTimeout(timer);
  }, [id, scrollTo]);

  return (
    <div id={id} className={`scroll-mt-24 ${className}`}>
      {children}
    </div>
  );
}
