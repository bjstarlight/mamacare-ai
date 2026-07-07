"use client";

import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

/**
 * Renders LogoutButton as a persistent floating control on every route
 * except the welcome/login screen itself — you're not logged in yet
 * there, so a logout button would be meaningless (and confusing) on
 * that page.
 */
export default function AppChrome() {
  const pathname = usePathname();

  if (pathname?.startsWith("/welcome")) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <LogoutButton className="bg-black/70 backdrop-blur-sm" />
    </div>
  );
}