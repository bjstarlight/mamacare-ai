"use client";

import { useEffect, useState } from "react";

export default function CHWDashboard() {

  const [highRisk,setHighRisk]=useState(0);

  const [vaccinesDue,setVaccinesDue]=useState(0);

  const [emergencies,setEmergencies]=useState(0);

  const [pregnancies,setPregnancies]=useState(0);

  useEffect(()=>{

    const mothers=
      JSON.parse(localStorage.getItem("mothers")||"[]");

    const emergency=
      JSON.parse(localStorage.getItem("EmergencySOS")||"[]");

    const vaccines=
      JSON.parse(localStorage.getItem("babyVaccinations")||"[]");

    setPregnancies(mothers.length);

    setHighRisk(
      mothers.filter((m:any)=>m.highRisk).length
    );

    setEmergencies(emergency.length);

    setVaccinesDue(
      vaccines.filter(
        (v:any)=>v.status==="Due"||v.status==="Overdue"
      ).length
    );

  },[]);

  return(

<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

<div className="rounded-xl bg-red-100 p-5">

<h2 className="font-bold text-red-700">

🚨 High Risk Mothers

</h2>

<p className="text-4xl font-bold mt-3">

{highRisk}

</p>

</div>

<div className="rounded-xl bg-green-100 p-5">

<h2 className="font-bold text-green-700">

🤰 Pregnant Mothers

</h2>

<p className="text-4xl font-bold mt-3">

{pregnancies}

</p>

</div>

<div className="rounded-xl bg-yellow-100 p-5">

<h2 className="font-bold text-yellow-700">

💉 Vaccines Due

</h2>

<p className="text-4xl font-bold mt-3">

{vaccinesDue}

</p>

</div>

<div className="rounded-xl bg-blue-100 p-5">

<h2 className="font-bold text-blue-700">

🚑 Emergencies

</h2>

<p className="text-4xl font-bold mt-3">

{emergencies}

</p>

</div>

</div>

  );
  <div className="mt-8 rounded-xl bg-white border p-6">

<h2 className="text-xl font-bold text-blue-700">

🤖 AI Community Health Insights

</h2>

<ul className="mt-4 space-y-3">

<li>
• Prioritize home visits for high-risk pregnancies.
</li>

<li>
• Follow up babies with overdue vaccinations.
</li>

<li>
• Review emergency referrals from the last 24 hours.
</li>

<li>
• Monitor mothers without recent BP recordings.
</li>

</ul>

</div>

}