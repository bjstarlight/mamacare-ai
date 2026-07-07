export interface AnalysisResult {
  severity: "Low" | "Moderate" | "High" | "Critical";
  confidence: number;
  diagnosis: string;
  recommendedAction: string;
  destinationUnit: string;
  triggerSOS: boolean;
  notifyCHW: boolean;
  notifyHospital: boolean;
}

export function analyzeSymptoms(message: string): AnalysisResult {

  const text = message.toLowerCase();

  if (
    text.includes("bleeding") ||
    text.includes("hemorrhage")
  ) {
    return {
      severity: "Critical",
      confidence: 98,
      diagnosis: "Possible Obstetric Hemorrhage",
      recommendedAction: "Immediate hospital referral",
      destinationUnit: "Obstetric Emergency Unit",
      triggerSOS: true,
      notifyCHW: true,
      notifyHospital: true,
    };
  }

  if (
    text.includes("convulsion") ||
    text.includes("seizure")
  ) {
    return {
      severity: "Critical",
      confidence: 99,
      diagnosis: "Possible Eclampsia",
      recommendedAction: "Immediate emergency response",
      destinationUnit: "ICU",
      triggerSOS: true,
      notifyCHW: true,
      notifyHospital: true,
    };
  }

  if (
    text.includes("baby not moving") ||
    text.includes("reduced movement")
  ) {
    return {
      severity: "High",
      confidence: 94,
      diagnosis: "Reduced Fetal Movement",
      recommendedAction: "Visit hospital today",
      destinationUnit: "Labour Ward",
      triggerSOS: false,
      notifyCHW: true,
      notifyHospital: true,
    };
  }

  if (
    text.includes("headache") &&
    text.includes("blurred")
  ) {
    return {
      severity: "High",
      confidence: 91,
      diagnosis: "Possible Pre-eclampsia",
      recommendedAction: "Blood pressure assessment",
      destinationUnit: "Obstetric Emergency Unit",
      triggerSOS: false,
      notifyCHW: true,
      notifyHospital: true,
    };
  }

  if (
    text.includes("fever")
  ) {
    return {
      severity: "Moderate",
      confidence: 80,
      diagnosis: "Possible Infection",
      recommendedAction: "Hospital review within 24 hours",
      destinationUnit: "General Maternity",
      triggerSOS: false,
      notifyCHW: false,
      notifyHospital: false,
    };
  }

  return {
    severity: "Low",
    confidence: 60,
    diagnosis: "General Pregnancy Complaint",
    recommendedAction: "Continue monitoring",
    destinationUnit: "ANC Clinic",
    triggerSOS: false,
    notifyCHW: false,
    notifyHospital: false,
  };
}