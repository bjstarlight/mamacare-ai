import { writeHashedRecord, readTotalRecords, getRecord, getRecordId, verifyRecord } from "./blockchain/service";

export async function getTotalRecords() {
  return readTotalRecords();
}

export { getRecord, verifyRecord, getRecordId };

export async function addMedicalRecord(recordHash: string, category: string) {
  const result = await writeHashedRecord(recordHash, category);

  if (!result.success || !result.transactionHash) {
    throw new Error(result.error ?? "Unable to add medical record.");
  }

  return result.transactionHash;
}