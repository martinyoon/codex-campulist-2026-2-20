import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseJsonObjectBody,
  parseSendMessageInput,
  parseUuidParam,
} from "@/src/server/validation";

interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const threadId = parseUuidParam(context.params.id, "thread_id");
    const result = await mockApi.listMessages(threadId);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const threadId = parseUuidParam(context.params.id, "thread_id");
    const body = await parseJsonObjectBody(request);
    const payload = parseSendMessageInput(body);
    const result = await mockApi.sendMessage(threadId, payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
