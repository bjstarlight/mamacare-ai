"use client";

import { Test } from "mocha";

export default function TestPage() {
  async function testBlockchain() {
    const response = await fetch("/api/blockchain/add-record", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
    patientName: "Mary John",
    age: 28,
    category: "Antenatal",
    bloodPressure: "120/80",
    weight: "68kg",
    diagnosis: "Healthy Pregnancy",
    doctor: "Dr Musa",
    visitDate: new Date().toISOString(),
}),
      
    });

    const data = await response.json();

    console.log(data);

    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>BOT Chain Test</h1>

      <button onClick={testBlockchain}>
        Send Test Record
      </button>
    </div>
  );
}