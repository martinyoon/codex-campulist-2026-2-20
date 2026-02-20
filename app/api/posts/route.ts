import { NextRequest, NextResponse } from "next/server";
import { POST_CATEGORIES, POST_SORT_OPTIONS } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePositiveInt } from "@/src/server/params";
import { toNextResponse } from "@/src/server/apiResponse";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");
  const statusParam = searchParams.get("status");

  if (
    categoryParam &&
    !POST_CATEGORIES.includes(categoryParam as (typeof POST_CATEGORIES)[number])
  ) {
    return NextResponse.json(
      {
        ok: false,
        status: 400,
        error: { code: "BAD_REQUEST", message: "Invalid category query." },
      },
      { status: 400 },
    );
  }

  if (
    sortParam &&
    !POST_SORT_OPTIONS.includes(sortParam as (typeof POST_SORT_OPTIONS)[number])
  ) {
    return NextResponse.json(
      {
        ok: false,
        status: 400,
        error: { code: "BAD_REQUEST", message: "Invalid sort query." },
      },
      { status: 400 },
    );
  }

  const result = await mockApi.listPosts({
    category: categoryParam
      ? (categoryParam as (typeof POST_CATEGORIES)[number])
      : undefined,
    status: statusParam ? (statusParam as never) : undefined,
    search: searchParams.get("search") ?? searchParams.get("q") ?? undefined,
    sort: sortParam ? (sortParam as (typeof POST_SORT_OPTIONS)[number]) : undefined,
    promoted_only: searchParams.get("promoted_only") === "true",
    include_hidden: searchParams.get("include_hidden") === "true",
    limit: parsePositiveInt(searchParams.get("limit"), 20),
    offset: parsePositiveInt(searchParams.get("offset"), 0),
  });

  return toNextResponse(result);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const result = await mockApi.createPost(payload);
  return toNextResponse(result);
}
