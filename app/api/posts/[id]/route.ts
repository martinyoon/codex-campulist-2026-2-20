import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseJsonObjectBody,
  parseUpdatePostInput,
  parseUuidParam,
} from "@/src/server/validation";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const postId = parseUuidParam(context.params.id, "post_id");
    const result = await mockApi.getPost(postId);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const postId = parseUuidParam(context.params.id, "post_id");
    const body = await parseJsonObjectBody(request);
    const payload = parseUpdatePostInput(body);
    const result = await mockApi.updatePost(postId, payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const postId = parseUuidParam(context.params.id, "post_id");
    const result = await mockApi.deletePost(postId);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
