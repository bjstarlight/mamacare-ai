"use client";

import { useEffect, useState } from "react";

type Props = {
  motherName: string;
  babyName: string;
  pregnancyWeek: string;
  babyAge: string;
};

export default function SmartDashboard({
  motherName = "",
  babyName = "",
  pregnancyWeek = "",
  babyAge = "",
}: Partial<Props>) {

  // -----------------------
  // STATE (ALL HOOKS HERE)
  // -----------------------
  const [nextAppointment, setNextAppointment] = useState("");
  const [protectedRecords, setProtectedRecords] = useState(0);
  const [lastVerified, setLastVerified] = useState("Never");
  const [blockchainConnected, setBlockchainConnected] = useState(false);

  // -----------------------
  // DATE + TIPS
  // -----------------------
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const tips = [
    "Drink at least 8 glasses of water today.",
    "Take your prenatal vitamins.",
    "Sleep for at least 8 hours.",
    "Eat fruits and vegetables today.",
    "Attend every clinic appointment.",
  ];

  const tip = tips[new Date().getDate() % tips.length];

  // -----------------------
  // LOAD DATA (LOCAL + BLOCKCHAIN)
  // -----------------------
  useEffect(() => {
    async function loadDashboard() {
      try {
        // -------- LOCAL STORAGE (appointments)
        const appointments = localStorage.getItem("appointments");

        if (appointments) {
          const data = JSON.parse(appointments);

          if (Array.isArray(data) && data.length > 0) {
            setNextAppointment(
              `${data[0].type} - ${data[0].date}`
            );
          }
        }

        // -------- BLOCKCHAIN DATA
        try {
          const res = await fetch("/api/blockchain");
          const blockchainData = await res.json();

          if (blockchainData.success) {
            setProtectedRecords(
              Number(blockchainData.totalRecords)
            );
            setBlockchainConnected(true);
          } else {
            setBlockchainConnected(false);
          }
        } catch (err) {
          console.error("Blockchain error:", err);
          setBlockchainConnected(false);
        }

        // -------- LAST VERIFIED
        setLastVerified(
          localStorage.getItem("lastVerified") || "Never"
        );

      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }

    loadDashboard();
  }, []);

  // -----------------------
  // PROGRESS CALC
  // -----------------------
  const weekNum = Math.max(
    0,
    Math.min(40, Number(pregnancyWeek) || 0)
  );

  const progressPct = (weekNum / 40) * 100;

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="space-y-6">

      {/* TODAY + TIP — compact strip instead of a second hero banner,
          since page.tsx already greets the user and shows pregnancy
          progress in its own hero. This just adds the day and a tip. */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-2xl bg-white border border-[#EFE4DC] px-5 py-4">
        <p className="text-sm text-[#8a7a6d]">
          {today}
          {motherName ? ` · Tracking for ${motherName}` : ""}
        </p>
        <p className="text-sm font-medium text-[#6B2545]">
          Tip: {tip}
        </p>
      </div>

      {/* MAIN STATS — fixed: this grid was missing, so all four cards
          used to stack full-width instead of showing as a row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {/* Baby Age */}
        <div className="rounded-2xl bg-white shadow-sm border border-[#EFE4DC] p-5 text-center">
          <h3 className="text-xs uppercase tracking-wide text-[#8a7a6d]">
            {babyName ? babyName : "Baby Age"}
          </h3>
          <p className="mt-2 text-2xl font-semibold text-[#35406B]">
            {babyAge || "--"}
          </p>
        </div>

        {/* Pregnancy */}
        <div className="rounded-2xl bg-white shadow-sm border border-[#EFE4DC] p-5 text-center">
          <h3 className="text-xs uppercase tracking-wide text-[#8a7a6d]">Pregnancy</h3>
          <p className="mt-2 text-2xl font-semibold text-[#E2725B]">
            {pregnancyWeek ? `${pregnancyWeek} Weeks` : "--"}
          </p>

          <div className="mt-3 h-2 rounded-full bg-[#F3E7DE]">
            <div
              className="h-2 rounded-full bg-linear-to-r from-[#E2725B] to-[#F3B091]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Appointments */}
        <div className="rounded-2xl bg-white shadow-sm border border-[#EFE4DC] p-5 text-center">
          <h3 className="text-xs uppercase tracking-wide text-[#8a7a6d]">Appointments</h3>
          <p className="mt-2 text-2xl font-semibold text-[#6B2545]">
            {nextAppointment ? "Scheduled" : "None"}
          </p>
        </div>

        {/* BOT Chain Status — amber for offline rather than red, since
            red is reserved for medical emergencies elsewhere in the app */}
        <div className="rounded-2xl bg-white shadow-sm border border-[#EFE4DC] p-5 text-center">
          <h3 className="text-xs uppercase tracking-wide text-[#8a7a6d]">BOT Chain</h3>
          <p className={`mt-2 text-2xl font-semibold ${blockchainConnected ? "text-emerald-600" : "text-amber-600"}`}>
            {blockchainConnected ? "Connected" : "Offline"}
          </p>
        </div>

      </div>

      {/* BLOCKCHAIN SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="rounded-2xl bg-[#EEF1F9] p-5">
          <h3 className="font-semibold text-[#35406B]">
            Protected Records
          </h3>
          <p className="text-3xl font-bold mt-2 text-[#35406B]">
            {protectedRecords}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 p-5">
          <h3 className="font-semibold text-emerald-700">
            Medical Identity
          </h3>
          <p className="mt-2 font-semibold text-emerald-700">
            Verified
          </p>
        </div>

        <div className="rounded-2xl bg-[#FDF1EC] p-5">
          <h3 className="font-semibold text-[#B5533F]">
            Last Verification
          </h3>
          <p className="mt-2 text-sm text-[#4a3d33]">
            {lastVerified}
          </p>
        </div>

      </div>

    </div>
  );
}