import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePaginationParams } from "@/src/server/params";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseCreateReportInput,
  parseJsonObjectBody,
  parseReportStatusQuery,
} from "@/src/server/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { limit, offset } = parsePaginationParams(searchParams, { limit: 20 });

    const result = await mockApi.listReports({
      status: parseReportStatusQuery(searchParams.get("status")),
      limit,
      offset,
    });
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonObjectBody(request);
    const payload = parseCreateReportInput(body);
    const result = await mockApi.createReport(payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
