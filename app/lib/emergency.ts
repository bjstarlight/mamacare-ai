export const emergencyWords = [
  "convulsion",
  "convulsions",
  "seizure",
  "not breathing",
  "difficulty breathing",
  "unconscious",
  "heavy bleeding",
  "severe bleeding",
  "blue lips",
  "cannot wake",
];

export function isEmergency(message: string) {
  return emergencyWords.some((word) =>
    message.toLowerCase().includes(word)
  );
}