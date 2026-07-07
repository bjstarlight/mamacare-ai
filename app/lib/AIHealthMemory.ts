export interface HealthMemory {

  id: string;

  type: string;

  value: any;

  createdAt: string;

}

export function saveHealthMemory(
  type: string,
  value: any
) {

  const history = JSON.parse(
    localStorage.getItem("healthMemory") || "[]"
  );

  history.push({

    id: crypto.randomUUID(),

    type,

    value,

    createdAt: new Date().toISOString(),

  });

  localStorage.setItem(
    "healthMemory",
    JSON.stringify(history)
  );

}

export function getHealthMemory() {

  return JSON.parse(
    localStorage.getItem("healthMemory") || "[]"
  );

}
