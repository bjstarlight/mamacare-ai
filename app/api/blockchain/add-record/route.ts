import { NextRequest, NextResponse } from "next/server";
import { addMedicalRecord } from "../../../lib/medicalRecordService";
import { hashRecord } from "../../../lib/hash";

export async function POST(req: NextRequest) {
  try {
   const medicalRecord = await req.json();

const recordHash = hashRecord(medicalRecord);

const category =
  medicalRecord.category ?? "General";
  
    if (!recordHash || !category) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing recordHash or category",
        },
        { status: 400 }
      );
    }

    const txHash = await addMedicalRecord(recordHash, category);

 return NextResponse.json({
    success: true,
    recordHash,
    transactionHash: txHash,
});
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to write to blockchain",
      },
      { status: 500 }
    );
  }
}