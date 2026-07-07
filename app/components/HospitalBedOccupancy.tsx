"use client";

import {
  Bed,
  HeartPulse,
  Baby,
  ShieldPlus,
  Activity,
} from "lucide-react";

export default function HospitalBedOccupancy() {

  const wards = [
    {
      name: "Labour Ward",
      occupied: 18,
      total: 20,
      icon: HeartPulse,
      color: "bg-red-500",
    },
    {
      name: "NICU",
      occupied: 9,
      total: 12,
      icon: Baby,
      color: "bg-pink-500",
    },
    {
      name: "ICU",
      occupied: 6,
      total: 8,
      icon: ShieldPlus,
      color: "bg-orange-500",
    },
    {
      name: "General Ward",
      occupied: 41,
      total: 60,
      icon: Bed,
      color: "bg-blue-500",
    },
    {
      name: "Maternity Ward",
      occupied: 32,
      total: 40,
      icon: Activity,
      color: "bg-green-500",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">

      <div className="flex items-center gap-3 mb-6">

        <Bed className="h-7 w-7 text-blue-700" />

        <div>

          <h2 className="text-xl font-bold">
            Hospital Bed Occupancy
          </h2>

          <p className="text-sm text-gray-500">
            Real-Time Capacity Monitoring
          </p>

        </div>

      </div>

      <div className="space-y-5">

        {wards.map((ward) => {

          const Icon = ward.icon;

          const percent = Math.round(
            (ward.occupied / ward.total) * 100
          );

          return (

            <div key={ward.name}>

              <div className="flex justify-between mb-2">

                <div className="flex items-center gap-2">

                  <Icon className="h-5 w-5 text-blue-700" />

                  <span className="font-medium">
                    {ward.name}
                  </span>

                </div>

                <span className="font-semibold">

                  {ward.occupied}/{ward.total}

                </span>

              </div>

              <div className="h-3 rounded-full bg-gray-200 overflow-hidden">

                <div
                  className={`${ward.color} h-3`}
                  style={{
                    width: `${percent}%`,
                  }}
                />

              </div>

              <p className="mt-1 text-sm text-gray-500">

                {percent}% Occupied

              </p>

            </div>

          );

        })}

      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="rounded-xl bg-green-50 p-4">

          <p className="text-sm text-gray-600">
            Available Beds
          </p>

          <h3 className="text-3xl font-bold text-green-700">
            34
          </h3>

        </div>

        <div className="rounded-xl bg-red-50 p-4">

          <p className="text-sm text-gray-600">
            Occupancy Rate
          </p>

          <h3 className="text-3xl font-bold text-red-700">
            81%
          </h3>

        </div>

      </div>

    </div>
  );
}