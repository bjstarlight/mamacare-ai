export interface AIMemoryRecord {
  id: string;
  type: string;
  title: string;
  details: string;
  timestamp: string;
}

export function saveMemory(
  type: string,
  title: string,
  details: string
) {
  const memory: AIMemoryRecord[] = JSON.parse(
    localStorage.getItem("aiMemory") || "[]"
  );

  memory.unshift({
    id: crypto.randomUUID(),
    type,
    title,
    details,
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(
    "aiMemory",
    JSON.stringify(memory)
  );
}

export function getMemory() {
  return JSON.parse(
    localStorage.getItem("aiMemory") || "[]"
  );
}