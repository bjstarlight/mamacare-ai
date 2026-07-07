"use client";

import PortalLayout from "../components/layout/PortalLayout";
import AmbulanceDashboard from "../components/ambulance/AmbulanceDashboard";

export default function AmbulancePage() {
  return (
    <PortalLayout
      title="Ambulance Dispatch"
      eyebrow="Emergency"
      description="Request and track ambulance dispatch for emergency cases."
    >
      <AmbulanceDashboard />
    </PortalLayout>
  );
}
