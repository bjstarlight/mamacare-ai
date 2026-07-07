"use client";

import PortalLayout from "../components/layout/PortalLayout";
import AIMidwife from "../components/ai/AIMidwife";

export default function AIMidwifePage() {
  return (
    <PortalLayout
      title="AI Midwife"
      eyebrow="Conversation"
      description="Full AI midwife experience with risk assessment and proactive care."
    >
      <AIMidwife />
    </PortalLayout>
  );
}
