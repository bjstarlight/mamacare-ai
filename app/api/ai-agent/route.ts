import { NextResponse } from "next/server";
import { buildAIContext, runAICore } from "../../lib/AICoreEngine";

/** Server-side AI agent analysis — mirrors client engine for API consumers */
export async function GET() {
  const context = buildAIContext();
  const result = runAICore(context);
  return NextResponse.json({ context, result });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const context = {
    ...buildAIContext(),
    ...(body.context ?? {}),
  };
  const result = runAICore(context);
  return NextResponse.json({ context, result });
}
