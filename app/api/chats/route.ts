import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";

export async function GET(_request: NextRequest) {
  try {
    const result = await mockApi.listMyChats();
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
