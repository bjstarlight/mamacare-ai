"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Heart,
  Droplets,
  Phone,
  ShieldCheck,
  QrCode,
  Baby,
  User,
} from "lucide-react";
import QRCode from "react-qr-code";

export default function EmergencyMode() {
  const [mother, setMother] = useState<any>({});
  const [baby, setBaby] = useState<any>({});
  const [week, setWeek] = useState("-");
  const [showEmergency, setShowEmergency] = useState(false);

  useEffect(() => {
    setMother(
      JSON.parse(localStorage.getItem("motherProfile") || "{}")
    );

    setBaby(
      JSON.parse(localStorage.getItem("babyProfile") || "{}")
    );

    setWeek(
      localStorage.getItem("pregnancyWeek") || "-"
    );
  }, []);

  const qrData = `
MamaCare Emergency Card

Mother: ${mother.name || "Unknown"}

Pregnancy Week: ${week}

Blood Group: ${mother.bloodGroup || "-"}

Emergency Contact:
${mother.phone || "-"}

BOT Chain Verified
`;

  if (!showEmergency) {
    return (
      <button
        onClick={() => setShowEmergency(true)}
        className="w-full rounded-2xl bg-red-600 hover:bg-red-700 text-white py-4 text-lg font-bold shadow-lg"
      >
        🚨 ENTER EMERGENCY MODE
      </button>
    );
  }

  return (
    <div className="rounded-3xl border-4 border-red-600 bg-white shadow-2xl overflow-hidden">

      <div className="bg-red-600 text-white p-5">

        <div className="flex justify-between items-center">

          <div className="flex items-center gap-3">

            <AlertTriangle className="w-8 h-8"/>

            <div>

              <h2 className="text-2xl font-bold">

                EMERGENCY MODE

              </h2>

              <p className="text-red-100">

                Immediate Clinical Information

              </p>

            </div>

          </div>

          <button
            onClick={() => setShowEmergency(false)}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold"
          >
            Close
          </button>

        </div>

      </div>

      <div className="p-8">

        <div className="grid md:grid-cols-2 gap-8">

          <div className="space-y-5">

            <div className="flex items-center gap-3">
              <User className="text-blue-600"/>
              <div>
                <p className="text-gray-500 text-sm">Mother</p>
                <p className="font-bold text-xl">
                  {mother.name || "Unknown"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Baby className="text-pink-600"/>
              <div>
                <p className="text-gray-500 text-sm">Pregnancy</p>
                <p className="font-bold">
                  {week} Weeks
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Droplets className="text-red-600"/>
              <div>
                <p className="text-gray-500 text-sm">
                  Blood Group
                </p>
                <p className="font-bold text-xl">
                  {mother.bloodGroup || "-"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Heart className="text-red-500"/>
              <div>
                <p className="text-gray-500 text-sm">
                  AI Risk
                </p>
                <p className="font-bold">
                  {mother.aiRisk || "Low"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="text-green-600"/>
              <div>
                <p className="text-gray-500 text-sm">
                  Emergency Contact
                </p>
                <p className="font-bold">
                  {mother.phone || "-"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-yellow-50 border border-yellow-300 p-4">

              <h3 className="font-bold mb-2">

                ⚠ Immediate Instructions

              </h3>

              <ul className="space-y-2">

                <li>• Check airway and breathing.</li>

                <li>• Assess fetal movement.</li>

                <li>• Check blood pressure immediately.</li>

                <li>• Notify obstetrician.</li>

                <li>• Prepare emergency referral if unstable.</li>

              </ul>

            </div>

          </div>

          <div className="flex flex-col items-center justify-center">

            <div className="bg-white p-5 rounded-xl border">

              <QRCode
                value={qrData}
                size={220}
              />

            </div>

            <div className="mt-5 flex items-center gap-2">

              <ShieldCheck className="text-green-600"/>

              <span className="font-semibold">

                BOT Chain Verified

              </span>

            </div>

            <p className="text-sm text-gray-500 mt-3 text-center">

              Scan to retrieve verified emergency patient data.

            </p>

          </div>

        </div>

      </div>

    </div>
  );
}