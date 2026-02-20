import { NextRequest } from "next/server";
import { mockApi } from "@/src/server/mockApiSingleton";
import {
  parseBooleanFlag,
  parsePaginationParams,
  parseSearchKeyword,
} from "@/src/server/params";
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
    const { limit, offset } = parsePaginationParams(searchParams, { limit: 20 });

    const result = await mockApi.listPosts({
      category: parsePostCategoryQuery(searchParams.get("category")),
      status: parsePostStatusQuery(searchParams.get("status")),
      search: parseSearchKeyword(searchParams),
      sort: parsePostSortQuery(searchParams.get("sort")),
      promoted_only: parseBooleanFlag(searchParams, "promoted_only"),
      include_hidden: parseBooleanFlag(searchParams, "include_hidden"),
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
    const payload = parseCreatePostInput(body);
    const result = await mockApi.createPost(payload);
    return toNextResponse(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
