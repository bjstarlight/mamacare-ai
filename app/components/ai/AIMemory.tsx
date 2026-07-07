export interface MotherMemory {
  id: string;

  name?: string;

  age?: number;

  gestationalAge?: number;

  gravida?: number;

  parity?: number;

  bloodGroup?: string;

  allergies?: string[];

  chronicConditions?: string[];

  previousCS?: boolean;

  previousMiscarriage?: boolean;

  highRisk?: boolean;

  lastSymptoms?: string;

  lastDiagnosis?: string;

  lastVisit?: string;

  conversationHistory?: string[];
}

export function loadMemory(): MotherMemory {
  return JSON.parse(
    localStorage.getItem("motherMemory") ||
      JSON.stringify({
        id: "current-user",
        conversationHistory: [],
      })
  );
}

export function saveMemory(memory: MotherMemory) {
  localStorage.setItem(
    "motherMemory",
    JSON.stringify(memory)
  );
}

export function rememberConversation(message: string) {
  const memory = loadMemory();

  memory.conversationHistory ??= [];

  memory.conversationHistory.push(message);

  if (memory.conversationHistory.length > 20) {
    memory.conversationHistory.shift();
  }

  saveMemory(memory);
}

export function updateDiagnosis(
  diagnosis: string,
  symptoms: string
) {
  const memory = loadMemory();

  memory.lastDiagnosis = diagnosis;

  memory.lastSymptoms = symptoms;

  memory.lastVisit = new Date().toISOString();

  saveMemory(memory);
}