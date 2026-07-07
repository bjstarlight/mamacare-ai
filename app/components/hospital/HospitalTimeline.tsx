"use client";

import {
  ClipboardCheck,
  Hospital,
  Ambulance,
  Navigation,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

const timeline = [
  {
    title: "Referral Created",
    description: "Community Health Worker or Doctor creates referral.",
    icon: ClipboardCheck,
    color: "bg-blue-600",
  },
  {
    title: "Hospital Accepted",
    description: "Receiving hospital accepts referral.",
    icon: Hospital,
    color: "bg-green-600",
  },
  {
    title: "Ambulance Dispatched",
    description: "Nearest ambulance assigned.",
    icon: Ambulance,
    color: "bg-red-600",
  },
  {
    title: "Patient En Route",
    description: "Live tracking begins.",
    icon: Navigation,
    color: "bg-orange-500",
  },
  {
    title: "Treatment Started",
    description: "Doctor begins emergency care.",
    icon: HeartPulse,
    color: "bg-purple-600",
  },
  {
    title: "BOT Chain Verified",
    description: "Entire emergency journey permanently logged.",
    icon: ShieldCheck,
    color: "bg-emerald-600",
  },
];

export default function HospitalTimeline() {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-2xl font-bold mb-8">
        Emergency Care Journey
      </h2>

      <div className="relative">

        <div className="absolute left-6 top-2 bottom-2 w-1 bg-gray-200" />

        <div className="space-y-8">

          {timeline.map((step, index) => {
            const Icon = step.icon;

            return (
              <div
                key={index}
                className="relative flex gap-5 items-start"
              >

                <div
                  className={`${step.color} w-12 h-12 rounded-full flex items-center justify-center text-white z-10`}
                >
                  <Icon size={22} />
                </div>

                <div className="pt-1">

                  <h3 className="font-bold text-lg">
                    {step.title}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {step.description}
                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
}