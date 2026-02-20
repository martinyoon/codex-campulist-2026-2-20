import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toNextResponse } from "@/src/server/apiResponse";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const result = await mockApi.getPost(context.params.id);
  return toNextResponse(result);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const payload = await request.json();
  const result = await mockApi.updatePost(context.params.id, payload);
  return toNextResponse(result);
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const result = await mockApi.deletePost(context.params.id);
  return toNextResponse(result);
}
