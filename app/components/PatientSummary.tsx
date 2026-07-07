"use client";

import { useEffect, useState } from "react";

export default function PatientSummary() {
  const [mother, setMother] = useState<any>({});
  const [baby, setBaby] = useState<any>({});
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    setMother(
      JSON.parse(localStorage.getItem("motherProfile") || "{}")
    );

    setBaby(
      JSON.parse(localStorage.getItem("babyProfile") || "{}")
    );

    setAppointments(
      JSON.parse(localStorage.getItem("appointments") || "[]")
    );
  }, []);

  return (
    <div className="rounded-2xl bg-white shadow-lg p-6 border">

      <h2 className="text-2xl font-bold text-pink-600">
        🩺 Patient Summary
      </h2>

      <div className="mt-6 space-y-3">

        <p><strong>Mother:</strong> {mother.name || "Not set"}</p>

        <p><strong>Blood Group:</strong> {mother.bloodGroup || "Unknown"}</p>

        <p><strong>Pregnancy Week:</strong> {mother.pregnancyWeek || "--"}</p>

        <hr />

        <p><strong>Baby:</strong> {baby.name || "Not added"}</p>

        <p><strong>Gender:</strong> {baby.gender || "--"}</p>

        <p><strong>Date of Birth:</strong> {baby.dob || "--"}</p>

        <hr />

        <p>
          <strong>Appointments:</strong>{" "}
          {appointments.length}
        </p>

        <p>
          <strong>Latest Appointment:</strong>{" "}
          {appointments.length
            ? appointments[appointments.length - 1].date
            : "None"}
        </p>

      </div>

    </div>
  );
}