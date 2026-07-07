"use client";

import PortalLayout from "../components/layout/PortalLayout";
import HospitalNetworkDashboard from "../components/hospital/HospitalNetworkDashboard";

export default function HospitalPage() {
  return (
    <PortalLayout
      title="Hospital Network"
      eyebrow="Referrals"
      description="Incoming referrals, ambulances, capacity, and emergency coordination."
    >
      <HospitalNetworkDashboard />
    </PortalLayout>
  );
}
