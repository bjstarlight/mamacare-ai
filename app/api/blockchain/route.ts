import { NextResponse } from "next/server";
import { getChainStatus, readTotalRecords } from "../../lib/blockchain/service";

export async function GET() {
  try {
    const [status, total] = await Promise.all([getChainStatus(), readTotalRecords()]);

    return NextResponse.json({
      success: Boolean(status.connected),
      totalRecords: total.toString(),
      network: status.networkName,
      chainId: status.chainId,
      error: status.error ?? null,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Blockchain connection failed",
      },
      { status: 500 }
    );
  }
}