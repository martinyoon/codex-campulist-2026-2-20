import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toNextResponse } from "@/src/server/apiResponse";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  const payload = await request.json();
  const promotionUntil = String(payload?.promotion_until ?? "");
  const result = await mockApi.promotePost(context.params.id, promotionUntil);
  return toNextResponse(result);
}
