"use client";

import PortalLayout from "../components/layout/PortalLayout";
import BabyProfile from "../components/BabyProfile";
import BabyGrowthPrediction from "../components/BabyGrowthPrediction";
import VaccineReminder from "../components/VaccineReminder";
import MedicationReminder from "../components/MedicationReminder";
import ModuleSection from "../components/layout/ModuleSection";
import { Baby } from "lucide-react";

export default function BabyPage() {
  return (
    <PortalLayout
      title="Baby Care"
      eyebrow="Growth & vaccines"
      description="Follow growth, vaccination, and everyday care updates in one place."
    >
      <div className="space-y-6">
        <ModuleSection title="Baby profile" icon={Baby}>
          <div className="space-y-6">
            <BabyProfile />
            <BabyGrowthPrediction />
          </div>
        </ModuleSection>
        <VaccineReminder />
        <MedicationReminder />
      </div>
    </PortalLayout>
  );
}
