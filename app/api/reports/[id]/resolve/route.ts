import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toNextResponse } from "@/src/server/apiResponse";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const payload = await request.json();
  const result = await mockApi.resolveReport(context.params.id, payload);
  return toNextResponse(result);
}
