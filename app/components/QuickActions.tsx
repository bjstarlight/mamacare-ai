"use client";

import {
  HeartPulse,
  Baby,
  Syringe,
  Droplet,
  HeartHandshake,
  AlertTriangle,
} from "lucide-react";

type Props = {
  quickQuestion: (text: string, isMedicalComplaint?: boolean) => void;
  openSection: (section: string, subview?: string) => void;
};

const CARDS = [
  {
    section: "pregnancy",
    icon: HeartPulse,
    title: "Pregnancy",
    subtitle: "Week-by-week guidance",
    tint: "bg-[#FBEAE3] hover:bg-[#F5D9CC] text-[#B5533F]",
  },
  {
    // Fixed: was "baby-care", which page.tsx never checks for —
    // clicking this used to leave the page blank.
    section: "baby",
    icon: Baby,
    title: "Baby Care",
    subtitle: "Common childhood illnesses",
    tint: "bg-[#EAF0FB] hover:bg-[#D9E4F5] text-[#35406B]",
  },
  {
    section: "baby",
    subview: "vaccines",
    icon: Syringe,
    title: "Vaccinations",
    subtitle: "Immunization schedule",
    tint: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700",
  },
  {
    section: "baby",
    subview: "home ORS",
    icon: Droplet,
    title: "ORS Guide",
    subtitle: "Diarrhea & dehydration",
    tint: "bg-[#FDF3E3] hover:bg-[#F9E7C4] text-[#8a6d1f]",
  },
  {
    section: "baby",
    subview: "feeding",
    icon: HeartHandshake,
    title: "Breastfeeding",
    subtitle: "Feeding support",
    tint: "bg-[#F3E9F0] hover:bg-[#E8D3E0] text-[#6B2545]",
  },
  {
    section: "emergency",
    icon: AlertTriangle,
    title: "Emergency",
    subtitle: "Recognize danger signs",
    tint: "bg-red-50 hover:bg-red-100 text-red-700",
  },
] as const;

type CardItem = (typeof CARDS)[number];

const QUICK_TOPICS = [
  {
    icon: HeartPulse,
    label: "Pregnancy",
    question: "What should I expect at my current week of pregnancy?",
  },
  {
    icon: Baby,
    label: "Baby Care",
    question: "What are common childhood illnesses I should watch for?",
  },
  {
    icon: Syringe,
    label: "Vaccinations",
    question: "What vaccines does my baby need at this age?",
  },
  {
    icon: Droplet,
    label: "ORS",
    question: "How do I prepare ORS for dehydration at home?",
  },
  {
    icon: HeartHandshake,
    label: "Breastfeeding",
    question: "What are some breastfeeding tips for a new baby?",
  },
] as const;

export default function QuickActions({
  quickQuestion,
  openSection,
}: Props) {
  return (
    <>
      {/* Large Cards — navigate to a full section */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CARDS.map((card) => (
          <button
            key={`${card.section}-${"subview" in card ? card.subview : card.title}`}
            onClick={() =>
              openSection(
                card.section,
                "subview" in card ? card.subview : undefined
              )
            }
            className={`rounded-2xl p-5 text-left transition-colors ${card.tint}`}
          >
            <card.icon className="h-7 w-7" />
            <h2 className="font-semibold mt-3">{card.title}</h2>
            <p className="text-sm opacity-70">{card.subtitle}</p>
          </button>
        ))}
      </div>

      {/* Small Chips — ask the AI directly instead of duplicating the
          cards above. Opens the chat section so the answer is visible. */}
      <div className="mt-6">
        <p className="text-sm font-semibold text-[#4a3d33] mb-3">
          Quick Health Topics
        </p>

        <div className="flex flex-wrap gap-3">
          {QUICK_TOPICS.map((topic) => (
            <button
              key={topic.label}
              onClick={() => {
                openSection("chat");
                quickQuestion(topic.question);
              }}
              className="flex items-center gap-2 rounded-full bg-white border border-[#EFE4DC] px-4 py-2 text-sm text-[#4a3d33] hover:bg-[#FBF6F1] transition-colors"
            >
              <topic.icon className="h-4 w-4" />
              {topic.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}