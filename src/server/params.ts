export const parsePositiveInt = (
  value: string | null,
  fallback: number,
): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
};

export interface PaginationParams {
  limit: number;
  offset: number;
  page: number;
}

export const parsePaginationParams = (
  searchParams: URLSearchParams,
  defaults?: {
    limit?: number;
    page?: number;
  },
): PaginationParams => {
  const defaultLimit = defaults?.limit ?? 20;
  const defaultPage = defaults?.page ?? 1;

  const limit = parsePositiveInt(searchParams.get("limit"), defaultLimit);
  const rawPage = parsePositiveInt(searchParams.get("page"), defaultPage);
  const page = rawPage < 1 ? 1 : rawPage;
  const defaultOffset = (page - 1) * limit;
  const offset = parsePositiveInt(searchParams.get("offset"), defaultOffset);

  return { limit, offset, page };
};

export const parseBooleanFlag = (
  searchParams: URLSearchParams,
  key: string,
): boolean => searchParams.get(key) === "true";

export const parseSearchKeyword = (
  searchParams: URLSearchParams,
): string | undefined => {
  const raw = searchParams.get("search") ?? searchParams.get("q");
  if (!raw) {
    return undefined;
  }
  const keyword = raw.trim();
  if (!keyword) {
    return undefined;
  }
  return keyword;
};
