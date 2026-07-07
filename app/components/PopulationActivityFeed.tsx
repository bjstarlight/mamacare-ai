"use client";

import {
  Ambulance,
  Baby,
  ShieldCheck,
  Pill,
  FileText,
  BrainCircuit,
  Hospital,
  HeartPulse,
} from "lucide-react";

const activities = [
  {
    icon: Ambulance,
    color: "text-red-600",
    bg: "bg-red-100",
    title: "Emergency SOS Activated",
    description: "Amina Yusuf • Jos North",
    time: "1 min ago",
  },
  {
    icon: ShieldCheck,
    color: "text-green-600",
    bg: "bg-green-100",
    title: "Medical Record Verified",
    description: "BOT Chain verification successful",
    time: "3 mins ago",
  },
  {
    icon: Baby,
    color: "text-pink-600",
    bg: "bg-pink-100",
    title: "Safe Delivery Recorded",
    description: "Healthy Baby Girl • 3.2kg",
    time: "12 mins ago",
  },
  {
    icon: Pill,
    color: "text-blue-600",
    bg: "bg-blue-100",
    title: "Prescription Issued",
    description: "Iron + Folic Acid Therapy",
    time: "18 mins ago",
  },
  {
    icon: BrainCircuit,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    title: "AI Risk Assessment",
    description: "High Risk Pregnancy Identified",
    time: "24 mins ago",
  },
  {
    icon: Hospital,
    color: "text-orange-600",
    bg: "bg-orange-100",
    title: "Referral Accepted",
    description: "Jos University Teaching Hospital",
    time: "31 mins ago",
  },
  {
    icon: HeartPulse,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
    title: "Vital Signs Updated",
    description: "Blood Pressure Improved",
    time: "48 mins ago",
  },
  {
    icon: FileText,
    color: "text-gray-700",
    bg: "bg-gray-100",
    title: "Clinical Summary Generated",
    description: "AI Consultation Complete",
    time: "1 hour ago",
  },
];

export default function PopulationActivityFeed() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center justify-between mb-6">

        <div>

          <h2 className="text-xl font-bold">
            Live Hospital Activity
          </h2>

          <p className="text-sm text-gray-500">
            Real-Time Clinical Events
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>

          <span className="text-sm font-medium text-green-700">
            Live
          </span>

        </div>

      </div>

      <div className="space-y-4">

        {activities.map((activity, index) => {

          const Icon = activity.icon;

          return (

            <div
              key={index}
              className="flex items-start gap-4 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition"
            >

              <div
                className={`h-12 w-12 rounded-xl flex items-center justify-center ${activity.bg}`}
              >

                <Icon className={`h-6 w-6 ${activity.color}`} />

              </div>

              <div className="flex-1">

                <h3 className="font-semibold text-slate-800">
                  {activity.title}
                </h3>

                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>

              </div>

              <div className="text-xs text-gray-400 whitespace-nowrap">

                {activity.time}

              </div>

            </div>

          );

        })}

      </div>

    </div>
  );
}