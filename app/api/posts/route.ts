import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePositiveInt } from "@/src/server/params";
import { toErrorResponse, toNextResponse } from "@/src/server/apiResponse";
import {
  parseCreatePostInput,
  parseJsonObjectBody,
  parsePostCategoryQuery,
  parsePostSortQuery,
  parsePostStatusQuery,
} from "@/src/server/validation";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await mockApi.listPosts({
      category: parsePostCategoryQuery(searchParams.get("category")),
      status: parsePostStatusQuery(searchParams.get("status")),
      search: searchParams.get("search") ?? searchParams.get("q") ?? undefined,
      sort: parsePostSortQuery(searchParams.get("sort")),
      promoted_only: searchParams.get("promoted_only") === "true",
      include_hidden: searchParams.get("include_hidden") === "true",
      limit: parsePositiveInt(searchParams.get("limit"), 20),
      offset: parsePositiveInt(searchParams.get("offset"), 0),
    });

    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonObjectBody(request);
    const payload = parseCreatePostInput(body);
    const result = await mockApi.createPost(payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
