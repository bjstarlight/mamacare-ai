"use client";

import jsPDF from "jspdf";
import { logBlockchainRecord } from "../lib/blockchainLogger";
import { hashRecord } from "../lib/hash";

export default function ExportPDF() {
  function exportPDF() {
    const doc = new jsPDF();

    const mother = JSON.parse(
      localStorage.getItem("motherProfile") || "{}"
    );

    const baby = JSON.parse(
      localStorage.getItem("babyProfile") || "{}"
    );

    const appointments = JSON.parse(
      localStorage.getItem("appointments") || "[]"
    );

    const consultationNotes =
  localStorage.getItem("consultationNotes") || "";

  doc.text("Doctor Consultation Notes", 20, 170);

doc.setFontSize(11);

doc.text(
  consultationNotes || "No consultation notes available.",
  20,
 180
);
const vitals = JSON.parse(
  localStorage.getItem("vitalSigns") || "{}"
);
doc.setFontSize(14);

doc.text("Vital Signs", 20, 210);

doc.setFontSize(11);

doc.text(
  `Blood Pressure: ${vitals.bloodPressure || "N/A"}`,
  20,
 220
);

doc.text(
  `Heart Rate: ${vitals.heartRate || "N/A"}`,
  20,
 230
);

doc.text(
  `Temperature: ${vitals.temperature || "N/A"}`,
  20,
 240
);

doc.text(
  `Oxygen Saturation: ${vitals.oxygen || "N/A"}`,
  20,
 250
);

doc.text(
  `Weight: ${vitals.weight || "N/A"}`,
  20,
 260
);

doc.text(
  `Blood Sugar: ${vitals.bloodSugar || "N/A"}`,
  20,
 270
);
    doc.setFontSize(22);
    doc.text("MamaCare Health Record", 20, 20);

    

    doc.setFontSize(14);

    doc.text("Mother Information", 20, 40);
    doc.text(`Name: ${mother.name || "N/A"}`, 20, 50);

    doc.text("Baby Information", 20, 70);
    doc.text(`Name: ${baby.name || "N/A"}`, 20, 80);
    doc.text(`DOB: ${baby.dob || "N/A"}`, 20, 90);
    doc.text(`Gender: ${baby.gender || "N/A"}`, 20, 100);

    doc.text("Appointments", 20, 120);

    if (appointments.length === 0) {
      doc.text("No appointments saved.", 20, 130);
    } else {
      appointments.forEach((item: any, index: number) => {
        doc.text(
          `${index + 1}. ${item.type} - ${item.date}`,
          20,
          130 + index * 10
        );
      });
    }

    doc.save("MamaCare-Health-Record.pdf");

    logBlockchainRecord({
      hash: hashRecord({
        type: "Medical Pass Export",
        patient: mother.name || "Unknown Patient",
        timestamp: new Date().toISOString(),
      }),
      type: "Medical Pass Export",
      patient: mother.name || "Unknown Patient",
      actor: "Patient",
      details: "Health record PDF exported",
    });
  }

  return (
    <button
      onClick={exportPDF}
      className="rounded-xl bg-red-600 px-6 py-3 text-white hover:bg-red-700"
    >
      📄 Export Health Record (PDF)
    </button>
  );
}