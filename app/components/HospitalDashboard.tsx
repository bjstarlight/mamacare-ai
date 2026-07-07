"use client";

import {
  Users,
  HeartPulse,
  ShieldCheck,
  CalendarDays,
  Bell,
  Activity,
  AlertTriangle,
  Baby,
  Clock,
} from "lucide-react";


export default function HospitalDashboard() {

  return (

<div className="space-y-8">

{/* HEADER */}

<div className="flex justify-between items-center">

<div>

<h1 className="text-3xl font-bold">
Hospital Command Center
</h1>

<p className="text-gray-500">
Live Maternal Health Monitoring
</p>

</div>

<div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">

BOT Chain Connected

</div>

</div>

{/* TOP STATS */}

<div className="grid md:grid-cols-4 gap-5">

<div className="bg-white rounded-xl shadow p-6">

<Users className="text-blue-600 mb-2"/>

<p className="text-gray-500 text-sm">

Registered Mothers

</p>

<h2 className="text-3xl font-bold">

2,481

</h2>

</div>

<div className="bg-white rounded-xl shadow p-6">

<Baby className="text-pink-600 mb-2"/>

<p className="text-gray-500 text-sm">

Babies Tracked

</p>

<h2 className="text-3xl font-bold">

1,927

</h2>

</div>

<div className="bg-white rounded-xl shadow p-6">

<HeartPulse className="text-red-600 mb-2"/>

<p className="text-gray-500 text-sm">

High Risk Pregnancies

</p>

<h2 className="text-3xl font-bold">

37

</h2>

</div>

<div className="bg-white rounded-xl shadow p-6">

<ShieldCheck className="text-green-600 mb-2"/>

<p className="text-gray-500 text-sm">

Protected Records

</p>

<h2 className="text-3xl font-bold">

8,421

</h2>

</div>

</div>

{/* ALERTS */}

<div className="bg-white rounded-xl shadow p-6">

<div className="flex items-center gap-3 mb-4">

<AlertTriangle className="text-orange-500"/>

<h2 className="font-bold">

Clinical Alerts

</h2>

</div>

<div className="space-y-3">

<div className="border-l-4 border-red-500 pl-4">

Patient MC-2A19XF

Blood Pressure Critical

</div>

<div className="border-l-4 border-yellow-500 pl-4">

Patient MC-981KAL

Missed Appointment

</div>

<div className="border-l-4 border-blue-500 pl-4">

Patient MC-31GHQA

AI recommends ultrasound review

</div>

</div>

</div>

{/* TODAY */}

<div className="grid md:grid-cols-2 gap-6">

<div className="bg-white rounded-xl shadow p-6">

<div className="flex gap-2 items-center mb-4">

<CalendarDays/>

<h2 className="font-bold">

Today's Appointments

</h2>

</div>

<div className="space-y-3">

<div>

09:00 AM

Prenatal Consultation

</div>

<div>

10:30 AM

Growth Scan

</div>

<div>

12:00 PM

Vaccination

</div>

<div>

03:00 PM

Postpartum Review

</div>

</div>

</div>

<div className="bg-white rounded-xl shadow p-6">

<div className="flex gap-2 items-center mb-4">

<Bell/>

<h2 className="font-bold">

Pending Reviews

</h2>

</div>

<div className="space-y-3">

<div>12 AI summaries awaiting doctor approval</div>

<div>5 laboratory reports pending</div>

<div>3 prescriptions require signature</div>

</div>

</div>

</div>

{/* LIVE SYSTEM */}

<div className="bg-white rounded-xl shadow p-6">

<div className="flex gap-2 items-center mb-4">

<Activity/>

<h2 className="font-bold">

Live Hospital Status

</h2>

</div>

<div className="grid md:grid-cols-4 gap-4">

<div>

Patients Online

<h3 className="text-2xl font-bold text-blue-600">

184

</h3>

</div>

<div>

Doctors Active

<h3 className="text-2xl font-bold text-green-600">

26

</h3>

</div>

<div>

Emergency Cases

<h3 className="text-2xl font-bold text-red-600">

2

</h3>

</div>

<div>

Average Response

<h3 className="text-2xl font-bold text-purple-600">

4 min

</h3>

</div>

</div>

</div>

</div>

  );

}