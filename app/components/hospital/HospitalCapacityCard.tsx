"use client";

import { Bed, HeartPulse, Baby, Activity } from "lucide-react";

interface Hospital {
  id: number;
  name: string;
  capacity: number;
  labour: number;
  nicu: number;
  icu: number;
  emergency: string;
}

interface Props {
  hospitals: Hospital[];
}

export default function HospitalCapacityCard({ hospitals }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-6">
        Hospital Capacity Monitor
      </h2>

      <div className="space-y-6">

        {hospitals.map((hospital) => (

          <div
            key={hospital.id}
            className="border rounded-xl p-5"
          >

            <div className="flex justify-between items-center">

              <h3 className="font-semibold text-lg">
                {hospital.name}
              </h3>

              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  hospital.capacity > 80
                    ? "bg-red-100 text-red-700"
                    : hospital.capacity > 60
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {hospital.capacity}% Occupied
              </span>

            </div>

            <div className="w-full bg-gray-200 rounded-full h-3 mt-4">

              <div
                className={`h-3 rounded-full ${
                  hospital.capacity > 80
                    ? "bg-red-600"
                    : hospital.capacity > 60
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
                style={{ width: `${hospital.capacity}%` }}
              />

            </div>

            <div className="grid md:grid-cols-4 gap-4 mt-5">

              <div className="flex items-center gap-2">
                <Bed className="text-blue-600" size={18}/>
                <span>Labour: {hospital.labour}</span>
              </div>

              <div className="flex items-center gap-2">
                <Baby className="text-pink-600" size={18}/>
                <span>NICU: {hospital.nicu}</span>
              </div>

              <div className="flex items-center gap-2">
                <HeartPulse className="text-red-600" size={18}/>
                <span>ICU: {hospital.icu}</span>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="text-green-600" size={18}/>
                <span>{hospital.emergency}</span>
              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}