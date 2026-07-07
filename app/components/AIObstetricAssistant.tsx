"use client";

import { useState, useEffect } from "react";
import { Brain, Send } from "lucide-react";

export default function AIObstetricAssistant() {

  const [question,setQuestion]=useState("");
  const [answer,setAnswer]=useState("");

  const [mother,setMother]=useState<any>({});
  const [week,setWeek]=useState("");

  useEffect(()=>{

    setMother(
      JSON.parse(localStorage.getItem("motherProfile")||"{}")
    );

    setWeek(
      localStorage.getItem("pregnancyWeek")||"-"
    );

  },[]);

  function askAI(){

    const q=question.toLowerCase();

    if(q.includes("summary")){

      setAnswer(`
Patient: ${mother.name || "Unknown"}

Pregnancy Week: ${week}

Blood Group: ${mother.bloodGroup || "-"}

Current Risk:
${mother.aiRisk || "Low"}

Recommendation:
Continue routine antenatal care.
      `);

      return;
    }

    if(q.includes("blood pressure")){

      setAnswer(`
Current BP:
${mother.bp || "120/80"}

Recommendation:

Monitor weekly.

Continue routine observation.

Escalate if BP exceeds 140/90.
      `);

      return;
    }

    if(q.includes("clinical note")){

      setAnswer(`
Clinical Note

Patient reviewed today.

Mother stable.

Fetal wellbeing satisfactory.

Continue ANC.

Review after one week.
      `);

      return;
    }

    setAnswer(
      "AI has no recommendation yet for this question."
    );

  }

  return(

<div className="rounded-2xl border bg-white shadow-sm p-6">

<div className="flex items-center gap-3 mb-5">

<Brain className="text-blue-600"/>

<h2 className="font-bold text-xl">

AI Obstetric Assistant

</h2>

</div>

<input

value={question}

onChange={(e)=>setQuestion(e.target.value)}

placeholder="Ask AI about this patient..."

className="w-full rounded-xl border p-3"

/>

<button

onClick={askAI}

className="mt-4 rounded-xl bg-blue-600 text-white px-5 py-3 flex items-center gap-2"

>

<Send className="w-4 h-4"/>

Ask AI

</button>

{answer && (

<div className="mt-6 rounded-xl bg-slate-50 p-5 whitespace-pre-wrap">

{answer}

</div>

)}

</div>

  );

}