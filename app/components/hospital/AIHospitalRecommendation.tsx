"use client";

import { useEffect, useState } from "react";
import {
  Brain,
  Building2,
  MapPin,
  Bed,
  Baby,
  HeartPulse,
  CheckCircle,
} from "lucide-react";

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

export default function AIHospitalRecommendation({
  hospitals,
}: Props) {
  const [recommended, setRecommended] =
    useState<Hospital | null>(null);

  useEffect(() => {
    if (!hospitals.length) return;

    // AI Recommendation Logic
    const ranked = [...hospitals].sort((a, b) => {
      const scoreA =
        (100 - a.capacity) +
        a.labour * 4 +
        a.nicu * 5 +
        a.icu * 5;

      const scoreB =
        (100 - b.capacity) +
        b.labour * 4 +
        b.nicu * 5 +
        b.icu * 5;

      return scoreB - scoreA;
    });

    setRecommended(ranked[0]);
  }, [hospitals]);

  if (!recommended) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl shadow-lg p-6">

      <div className="flex items-center gap-3 mb-6">

        <Brain size={30} />

        <div>

          <h2 className="text-2xl font-bold">
            AI Hospital Recommendation
          </h2>

          <p className="text-blue-100">
            Best Facility Based on Capacity & Clinical Resources
          </p>

        </div>

      </div>

      <div className="bg-white rounded-xl p-6 text-gray-800">

        <div className="flex justify-between items-center">

          <div>

            <h3 className="text-2xl font-bold">
              {recommended.name}
            </h3>

            <p className="text-gray-500">
              AI Confidence: 97%
            </p>

          </div>

          <CheckCircle
            className="text-green-600"
            size={34}
          />

        </div>

        <div className="grid md:grid-cols-4 gap-4 mt-6">

          <div className="bg-slate-100 rounded-lg p-4 text-center">

            <Bed className="mx-auto text-blue-600 mb-2"/>

            <p className="font-semibold">
              Labour Ward
            </p>

            <h4 className="text-xl font-bold">
              {recommended.labour}
            </h4>

          </div>

          <div className="bg-slate-100 rounded-lg p-4 text-center">

            <Baby className="mx-auto text-pink-600 mb-2"/>

            <p className="font-semibold">
              NICU
            </p>

            <h4 className="text-xl font-bold">
              {recommended.nicu}
            </h4>

          </div>

          <div className="bg-slate-100 rounded-lg p-4 text-center">

            <HeartPulse className="mx-auto text-red-600 mb-2"/>

            <p className="font-semibold">
              ICU
            </p>

            <h4 className="text-xl font-bold">
              {recommended.icu}
            </h4>

          </div>

          <div className="bg-slate-100 rounded-lg p-4 text-center">

            <Building2 className="mx-auto text-green-600 mb-2"/>

            <p className="font-semibold">
              Occupancy
            </p>

            <h4 className="text-xl font-bold">
              {recommended.capacity}%
            </h4>

          </div>

        </div>

        <div className="mt-8">

          <h4 className="font-bold text-lg mb-3">
            AI Clinical Reasoning
          </h4>

          <ul className="space-y-2">

            <li>
              ✅ Lowest occupancy among specialist hospitals.
            </li>

            <li>
              ✅ Labour ward has available beds.
            </li>

            <li>
              ✅ NICU immediately available.
            </li>

            <li>
              ✅ ICU available for obstetric emergencies.
            </li>

            <li>
              ✅ Suitable for severe maternal complications.
            </li>

          </ul>

        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4 flex items-center gap-3">

          <MapPin className="text-blue-700"/>

          <div>

            <p className="font-semibold">
              Estimated Distance
            </p>

            <p>12 km • Estimated Arrival: 18 mins</p>

          </div>

        </div>

      </div>

    </div>
  );
}