import { AppError } from "../domain/errors";
import type { ListResult } from "../domain/types";

export const nowIso = (): string => new Date().toISOString();

export const createId = (prefix: string): string =>
  `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export const normalizeText = (value: string): string =>
  value.toLowerCase().trim();

export function ensure(
  condition: unknown,
  code: ConstructorParameters<typeof AppError>[0],
  message: string,
): asserts condition {
  if (!condition) {
    throw new AppError(code, message);
  }
}

export const paginate = <T>(
  rows: T[],
  limit = 20,
  offset = 0,
): ListResult<T> => {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  const safeOffset = Math.max(0, offset);
  const items = rows.slice(safeOffset, safeOffset + safeLimit);

  return {
    items,
    total: rows.length,
    limit: safeLimit,
    offset: safeOffset,
    has_more: safeOffset + safeLimit < rows.length,
  };
};
