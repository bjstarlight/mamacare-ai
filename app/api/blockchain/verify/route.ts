import { NextRequest, NextResponse } from "next/server";
import { hashRecord } from "../../../lib/hash";
import { verifyRecord } from "../../../lib/medicalRecordService";

export async function POST(req: NextRequest) {
  try {
    const medicalRecord = await req.json();

    const recordHash = hashRecord(medicalRecord);

    const verified = await verifyRecord(recordHash);

    return NextResponse.json({
      success: true,
      verified,
      recordHash,
    });

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: "Verification failed",
      },
      { status: 500 }
    );
  }
}