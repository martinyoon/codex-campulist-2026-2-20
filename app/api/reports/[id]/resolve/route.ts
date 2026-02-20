import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseJsonObjectBody,
  parseResolveReportInput,
  parseUuidParam,
} from "@/src/server/validation";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const reportId = parseUuidParam(context.params.id, "report_id");
    const body = await parseJsonObjectBody(request);
    const payload = parseResolveReportInput(body);
    const result = await mockApi.resolveReport(reportId, payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
