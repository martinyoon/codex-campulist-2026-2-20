import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseJsonObjectBody,
  parseStartChatInput,
} from "@/src/server/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonObjectBody(request);
    const payload = parseStartChatInput(body);
    const result = await mockApi.startChat(payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
