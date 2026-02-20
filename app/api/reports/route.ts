import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePositiveInt } from "@/src/server/params";
import { toNextResponse } from "@/src/server/apiResponse";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await mockApi.listReports({
    status: (searchParams.get("status") as never) ?? undefined,
    limit: parsePositiveInt(searchParams.get("limit"), 20),
    offset: parsePositiveInt(searchParams.get("offset"), 0),
  });
  return toNextResponse(result);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const result = await mockApi.createReport(payload);
  return toNextResponse(result);
}
