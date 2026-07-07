"use client";

import PortalLayout from "../components/layout/PortalLayout";
import MotherProfile from "../components/MotherProfile";
import ModuleSection from "../components/layout/ModuleSection";
import { HeartPulse } from "lucide-react";

export default function MotherPage() {
  return (
    <PortalLayout
      title="Mother Care"
      eyebrow="Profile"
      description="Review your health profile, reminders, and care plan in one place."
    >
      <ModuleSection title="Your care overview" icon={HeartPulse}>
        <MotherProfile />
      </ModuleSection>
    </PortalLayout>
  );
}
