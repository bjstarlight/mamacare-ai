"use client";

import { useEffect } from "react";
import { HeartHandshake } from "lucide-react";

type FeedingGuideProps = {
  onAskAI?: (question: string) => void;
};

const TIPS = [
  {
    title: "First hour",
    body: "Start skin-to-skin and offer the breast within the first hour after birth when possible.",
  },
  {
    title: "Frequency",
    body: "Newborns often feed 8–12 times per day. Follow baby's hunger cues rather than a rigid schedule.",
  },
  {
    title: "Positioning",
    body: "Support baby's head and neck. Nose should be free, chin touching breast, mouth wide open.",
  },
  {
    title: "Hydration",
    body: "Breast milk alone is enough for the first 6 months. No water or other fluids needed.",
  },
  {
    title: "Danger signs",
    body: "Seek care if baby is not feeding, has fewer wet nappies, or shows signs of dehydration.",
  },
];

export default function FeedingGuide({ onAskAI }: FeedingGuideProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HeartHandshake className="h-5 w-5 text-[#6B2545]" />
        <h3 className="text-lg font-semibold text-[#2B2118]">Breastfeeding & feeding guide</h3>
      </div>
      <p className="text-sm leading-6 text-[#6B4F3D]">
        Evidence-based feeding support for mothers and newborns. Continue breastfeeding unless
        a clinician advises otherwise.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="rounded-xl border border-[#EFE4DC] bg-[#FFF9F4] p-4"
          >
            <p className="text-sm font-semibold text-[#2B2118]">{tip.title}</p>
            <p className="mt-1 text-xs leading-5 text-[#6B4F3D]">{tip.body}</p>
          </div>
        ))}
      </div>
      {onAskAI ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              onAskAI("What breastfeeding tips should I know for my baby's current age?")
            }
            className="rounded-xl bg-[#6B2545] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#7D2B4F]"
          >
            Ask AI about feeding
          </button>
          <button
            type="button"
            onClick={() =>
              onAskAI("How do I prepare ORS for dehydration at home?")
            }
            className="rounded-xl border border-[#EFE4DC] bg-white px-4 py-2 text-sm font-semibold text-[#6B2545] transition hover:bg-[#FFF3E9]"
          >
            Ask AI about ORS
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-[#FDF3E3] bg-[#FFFBF0] p-4">
        <p className="text-sm font-semibold text-[#8a6d1f]">ORS for diarrhea</p>
        <p className="mt-1 text-xs leading-5 text-[#6B4F3D]">
          Mix 1 litre of clean water with 6 level teaspoons of sugar and 1/2 level
          teaspoon of salt. Give small sips frequently. Continue breastfeeding.
          Seek care if signs of dehydration worsen.
        </p>
      </div>
    </div>
  );
}
