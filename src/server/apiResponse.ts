import { NextResponse } from "next/server";
import type { ApiResult } from "@/src/mock/api";

export const toNextResponse = <T>(result: ApiResult<T>) =>
  NextResponse.json(result, { status: result.status });
