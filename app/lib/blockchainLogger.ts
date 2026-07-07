export interface BlockchainLog {
  id: string;
  hash: string;
  type: string;
  patient: string;
  timestamp: string;
  status: string;
  actor: string;
  details: string;
}

export function logBlockchainRecord({
  hash,
  type,
  patient,
  actor,
  details,
}: {
  hash: string;
  type: string;
  patient: string;
  actor: string;
  details: string;
}) {
  const existing: BlockchainLog[] =
    JSON.parse(localStorage.getItem("blockchainRecords") || "[]");

  const record: BlockchainLog = {
    id: crypto.randomUUID(),
    hash,
    type,
    patient,
    actor,
    details,
    status: "Verified",
    timestamp: new Date().toLocaleString(),
  };

  existing.unshift(record);

  localStorage.setItem(
    "blockchainRecords",
    JSON.stringify(existing)
  );

  return record;
}