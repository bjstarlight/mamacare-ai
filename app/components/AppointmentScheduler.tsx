"use client";

import { useEffect, useState } from "react";
import {
  scheduleAppointment,
  syncAppointmentAgent,
} from "../lib/appointments/appointmentAgent";

type Appointment = {
  id?: string;
  title: string;
  date: string;
  location?: string;
  notes?: string;
  status?: string;
  needsReschedule?: boolean;
};

export default function AppointmentScheduler() {
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const synced = syncAppointmentAgent();
    setAppointments(
      synced.appointments.map(
        ({ id, title, date, location, notes, status, needsReschedule }) => ({
          id,
          title,
          date,
          location,
          notes,
          status,
          needsReschedule,
        })
      )
    );
    if (synced.reschedulePrompts.length > 0) {
      setMessage(synced.reschedulePrompts[0]);
    }
  }, []);

  function saveAppointment() {
    if (!type || !date) return;

    const appointment = scheduleAppointment({
      title: type,
      date: new Date(`${date}T09:00:00`).toISOString(),
      location,
      notes,
    });

    const synced = syncAppointmentAgent();
    setAppointments(
      synced.appointments.map(
        ({ id, title, date, location, notes, status, needsReschedule }) => ({
          id,
          title,
          date,
          location,
          notes,
          status,
          needsReschedule,
        })
      )
    );

    setType("");
    setDate("");
    setLocation("");
    setNotes("");
    setMessage(
      `Saved ${appointment.title}. Reminders were scheduled for 3 days, 1 day, and 2 hours before the visit.`
    );
  }

  return (
    <div className="rounded-2xl border border-[#EFE4DC] bg-[#FFF9F4] p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-[#6B2545]">📅 Appointment Scheduler</h2>
      <p className="mt-2 text-sm text-[#6F6258]">
        Appointments are stored automatically and reminders are generated for each booking.
      </p>

      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        className="mt-4 w-full rounded-xl border border-[#EFE4DC] bg-white p-3"
      >
        <option value="">Select Appointment</option>
        <option>Antenatal Clinic</option>
        <option>Baby Immunization</option>
        <option>Hospital Visit</option>
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="mt-4 w-full rounded-xl border border-[#EFE4DC] bg-white p-3"
      />

      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="mt-4 w-full rounded-xl border border-[#EFE4DC] bg-white p-3"
      />

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes"
        className="mt-4 min-h-24 w-full rounded-xl border border-[#EFE4DC] bg-white p-3"
      />

      <button
        onClick={saveAppointment}
        className="mt-4 rounded-xl bg-[#6B2545] px-6 py-3 font-semibold text-white hover:bg-[#7A2E52]"
      >
        Save Appointment
      </button>

      {message ? (
        <p className="mt-3 rounded-xl border border-[#F2D3C7] bg-[#FFF3E9] p-3 text-sm text-[#8A4A31]">
          {message}
        </p>
      ) : null}

      {appointments.length > 0 && (
        <div className="mt-6 rounded-xl border border-[#EFE4DC] bg-white p-4">
          <h3 className="font-bold text-[#6B2545]">Upcoming Appointments</h3>

          {appointments.map((item) => (
            <div key={item.id} className="mt-3 border-b border-[#EFE4DC] pb-2">
              <p className="font-semibold text-[#2B2118]">📌 {item.title}</p>
              <p className="text-sm text-[#6F6258]">📅 {new Date(item.date).toLocaleDateString()}</p>
              {item.location ? <p className="text-sm text-[#6F6258]">📍 {item.location}</p> : null}
              {item.notes ? <p className="text-sm text-[#6F6258]">📝 {item.notes}</p> : null}
              {item.needsReschedule ? (
                <p className="mt-1 text-sm font-medium text-[#A8462C]">⚠️ Missed — please reschedule</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}