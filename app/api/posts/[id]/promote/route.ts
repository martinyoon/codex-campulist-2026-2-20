import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseJsonObjectBody,
  parsePromotionUntil,
  parseUuidParam,
} from "@/src/server/validation";

interface RouteContext {
  params: { id: string };
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const postId = parseUuidParam(context.params.id, "post_id");
    const body = await parseJsonObjectBody(request);
    const promotionUntil = parsePromotionUntil(body);
    const result = await mockApi.promotePost(postId, promotionUntil);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
