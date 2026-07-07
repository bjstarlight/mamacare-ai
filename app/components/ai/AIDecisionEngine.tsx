export interface Hospital {
  id: string;
  name: string;
  occupancy: number;
  labourBeds: number;
  nicuBeds: number;
  icuBeds: number;
  distance: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  available: boolean;
  activePatients: number;
}

export interface Ambulance {
  id: string;
  available: boolean;
  distance: number;
  fuel: number;
}

export interface AIRecommendation {
  hospital: Hospital | null;
  doctor: Doctor | null;
  ambulance: Ambulance | null;
  confidence: number;
  reasoning: string[];
}

export function generateRecommendation(
  severity: string,
  diagnosis: string
): AIRecommendation {

  const hospitals: Hospital[] = JSON.parse(
    localStorage.getItem("hospitalDirectory") || "[]"
  );

  const doctors: Doctor[] = JSON.parse(
    localStorage.getItem("doctorDirectory") || "[]"
  );

  const ambulances: Ambulance[] = JSON.parse(
    localStorage.getItem("ambulanceDirectory") || "[]"
  );

  // -------------------------
  // Best Hospital
  // -------------------------

  const hospital =
    hospitals
      .filter(
        h =>
          h.labourBeds > 0 &&
          h.occupancy < 90
      )
      .sort((a, b) => {

        const scoreA =
          a.distance +
          a.occupancy -
          a.labourBeds * 5 -
          a.nicuBeds * 3 -
          a.icuBeds * 4;

        const scoreB =
          b.distance +
          b.occupancy -
          b.labourBeds * 5 -
          b.nicuBeds * 3 -
          b.icuBeds * 4;

        return scoreA - scoreB;

      })[0] || null;

  // -------------------------
  // Best Doctor
  // -------------------------

  const doctor =
    doctors
      .filter(
        d =>
          d.available &&
          d.specialty === "Obstetrics"
      )
      .sort(
        (a, b) =>
          a.activePatients -
          b.activePatients
      )[0] || null;

  // -------------------------
  // Best Ambulance
  // -------------------------

  const ambulance =
    ambulances
      .filter(
        a =>
          a.available &&
          a.fuel > 20
      )
      .sort(
        (a, b) =>
          a.distance - b.distance
      )[0] || null;



  // -------------------------
  // AI Reasoning
  // -------------------------

 const reasoning: string[] = [];

let confidence = 50;

// Severity scoring
if (severity === "Critical") {
  confidence += 20;
  reasoning.push("Critical symptoms detected.");
}

if (severity === "High") {
  confidence += 15;
  reasoning.push("High-risk pregnancy symptoms.");
}

if (severity === "Moderate") {
  confidence += 10;
}

if (severity === "Low") {
  confidence += 5;
}

// Hospital scoring
if (hospital) {
  confidence += 10;

  reasoning.push(
    `${hospital.name} has capacity for emergency care.`
  );
}

// Doctor scoring
if (doctor) {
  confidence += 8;

  reasoning.push(
    `${doctor.name} is available for immediate review.`
  );
}

// Ambulance scoring
if (ambulance) {
  confidence += 7;

  reasoning.push(
    `${ambulance.id} is the nearest available ambulance.`
  );
}

// Keep confidence between 0 and 100
confidence = Math.min(confidence, 100);

return {
  hospital,
  doctor,
  ambulance,
  confidence,
  reasoning,
};
}