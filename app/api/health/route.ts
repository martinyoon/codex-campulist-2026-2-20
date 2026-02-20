import { NextResponse } from "next/server";
import { toErrorResponse } from "@/src/server/apiResponse";
import { resolveProviderState } from "@/src/server/providerState";

export async function GET() {
  try {
    const provider = resolveProviderState();
    const statusCode = provider.ready ? 200 : 503;

    return NextResponse.json(
      {
        ok: provider.ready,
        service: "campulist-prototype",
        timestamp: new Date().toISOString(),
        provider,
      },
      { status: statusCode },
    );
  } catch (error) {
    return toErrorResponse(error);
  }
}
