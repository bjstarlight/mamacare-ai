"use client";

import PortalLayout from "../components/layout/PortalLayout";
import DoctorMode from "../components/DoctorMode";
import DoctorLoginGate from "../components/doctor/DoctorLoginGate";

export default function DoctorPage() {
  return (
    <PortalLayout
      title="Doctor Portal"
      eyebrow="Clinical"
      description="Patient queue, timeline, AI summary, notes, and blockchain signing."
    >
      <DoctorLoginGate>
        <DoctorMode />
      </DoctorLoginGate>
    </PortalLayout>
  );
}
