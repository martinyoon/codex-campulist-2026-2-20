import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toNextResponse } from "@/src/server/apiResponse";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const result = await mockApi.login(payload);
  return toNextResponse(result);
}
