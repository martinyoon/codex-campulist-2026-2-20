import { NextResponse } from "next/server";
import { AppError } from "@/src/domain/errors";
import type { ApiResult } from "@/src/mock/api";

export const toNextResponse = <T>(result: ApiResult<T>) =>
  NextResponse.json(result, { status: result.status });

export const toErrorResponse = (error: unknown) => {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        ok: false,
        status: error.status,
        error: {
          status: error.status,
          code: error.code,
          message: error.message,
        },
      } satisfies ApiResult<never>,
      { status: error.status },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      status: 500,
      error: {
        status: 500,
        code: "INTERNAL_ERROR",
        message: "Unexpected server error.",
      },
    } satisfies ApiResult<never>,
    { status: 500 },
  );
};
