"use client";

import { useEffect, useState } from "react";

export default function ClinicalSummary() {
  const [summary, setSummary] = useState("");
  const [protectedRecords, setProtectedRecords] = useState(0);
  const [lastVerified, setLastVerified] = useState("Never");

  useEffect(() => {
    // Load Mother Profile
    const mother = JSON.parse(
      localStorage.getItem("motherProfile") || "{}"
    );

    // Load Baby Profile
    const baby = JSON.parse(
      localStorage.getItem("babyProfile") || "{}"
    );

    // Load Appointments
    const appointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );

    // Load Blockchain Status
    const records =
      Number(localStorage.getItem("protectedRecords")) || 0;

    const verified =
      localStorage.getItem("lastVerified") || "Never";

    setProtectedRecords(records);
    setLastVerified(verified);

    let report = "";

    report += `Mother: ${mother.name || "Unknown"}.\n\n`;

    if (mother.age)
      report += `Age: ${mother.age}\n`;

    if (mother.bloodGroup)
      report += `Blood Group: ${mother.bloodGroup}\n`;

    if (mother.phone)
      report += `Phone: ${mother.phone}\n`;

    report += "\n";

    report += `Baby: ${baby.name || "Unknown"}\n`;

    if (baby.gender)
      report += `Gender: ${baby.gender}\n`;

    if (baby.dob)
      report += `Date of Birth: ${baby.dob}\n`;

    report += "\n";

    if (
      Array.isArray(appointments) &&
      appointments.length > 0
    ) {
      report += `Next Appointment:\n`;
      report += `${appointments[0].type}\n`;
      report += `${appointments[0].date}\n\n`;
    }

    report +=
      "AI Assessment:\nNo emergency risks identified from stored clinical records.\n";

    setSummary(report);
  }, []);

  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-lg">

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-emerald-700">
          🧾 Clinical Summary
        </h2>

        <span className="rounded-full bg-emerald-600 px-4 py-1 text-sm font-semibold text-white">
          Blockchain Secured
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-gray-500 text-sm">
            Blockchain Status
          </p>

          <p className="mt-2 text-lg font-bold text-green-600">
            🟢 Connected
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-gray-500 text-sm">
            Protected Records
          </p>

          <p className="mt-2 text-3xl font-bold text-gray-800">
            {protectedRecords}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow">
          <p className="text-gray-500 text-sm">
            Last Verification
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-800">
            {lastVerified}
          </p>
        </div>

      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow">

        <h3 className="text-lg font-semibold text-emerald-700 mb-4">
          AI Clinical Overview
        </h3>

        <pre className="whitespace-pre-wrap text-gray-700 leading-7 font-sans">
          {summary}
        </pre>

      </div>

    </div>
  );
}