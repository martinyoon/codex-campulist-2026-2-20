import { AppError } from "@/src/domain/errors";
import {
  type PostSortOption,
  type PostStatus,
  POST_CATEGORIES,
  POST_SORT_OPTIONS,
  POST_STATUSES,
  type ReportStatus,
  REPORT_REASONS,
  REPORT_STATUSES,
  REPORT_TARGET_TYPES,
  USER_ROLES,
} from "@/src/domain/enums";
import type {
  CreatePostInput,
  CreateReportInput,
  MockLoginInput,
  ResolveReportInput,
  SendMessageInput,
  StartChatInput,
  UpdatePostInput,
} from "@/src/domain/types";
import type { NextRequest } from "next/server";

type JsonRecord = Record<string, unknown>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const toRecord = (value: unknown, label: string): JsonRecord => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new AppError("BAD_REQUEST", `${label} must be a JSON object.`);
  }
  return value as JsonRecord;
};

const ensureKnownKeys = (
  value: JsonRecord,
  keys: readonly string[],
  label: string,
) => {
  const allowed = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) {
      throw new AppError("BAD_REQUEST", `${label}.${key} is not allowed.`);
    }
  }
};

const readRequiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string") {
    throw new AppError("BAD_REQUEST", `${field} must be a string.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError("BAD_REQUEST", `${field} cannot be empty.`);
  }
  return trimmed;
};

const readOptionalString = (
  value: unknown,
  field: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    throw new AppError("BAD_REQUEST", `${field} cannot be null.`);
  }
  return readRequiredString(value, field);
};

const readOptionalNullableString = (
  value: unknown,
  field: string,
): string | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return readRequiredString(value, field);
};

const readOptionalBoolean = (
  value: unknown,
  field: string,
): boolean | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== "boolean") {
    throw new AppError("BAD_REQUEST", `${field} must be a boolean.`);
  }
  return value;
};

const readOptionalNullableNumber = (
  value: unknown,
  field: string,
): number | null | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new AppError("BAD_REQUEST", `${field} must be a finite number.`);
  }
  if (value < 0) {
    throw new AppError("BAD_REQUEST", `${field} must be zero or positive.`);
  }
  return value;
};

const readOptionalStringArray = (
  value: unknown,
  field: string,
): string[] | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (!Array.isArray(value)) {
    throw new AppError("BAD_REQUEST", `${field} must be an array.`);
  }
  return value.map((item, index) =>
    readRequiredString(item, `${field}[${index}]`),
  );
};

const readEnumValue = <T extends readonly string[]>(
  value: unknown,
  options: T,
  field: string,
): T[number] => {
  if (typeof value !== "string") {
    throw new AppError("BAD_REQUEST", `${field} must be a string.`);
  }
  if (!options.includes(value as T[number])) {
    throw new AppError("BAD_REQUEST", `${field} is invalid.`);
  }
  return value as T[number];
};

const readOptionalEnumValue = <T extends readonly string[]>(
  value: unknown,
  options: T,
  field: string,
): T[number] | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return readEnumValue(value, options, field);
};

const readUuidString = (value: unknown, field: string): string => {
  const normalized = readRequiredString(value, field);
  if (!UUID_RE.test(normalized)) {
    throw new AppError("BAD_REQUEST", `${field} must be a UUID.`);
  }
  return normalized.toLowerCase();
};

const readOptionalUuidString = (
  value: unknown,
  field: string,
): string | undefined => {
  if (value === undefined) {
    return undefined;
  }
  return readUuidString(value, field);
};

const readIsoDateString = (value: unknown, field: string): string => {
  const iso = readRequiredString(value, field);
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    throw new AppError("BAD_REQUEST", `${field} must be a valid ISO datetime.`);
  }
  return date.toISOString();
};

export const parseJsonObjectBody = async (
  request: NextRequest,
): Promise<JsonRecord> => {
  try {
    const payload = await request.json();
    return toRecord(payload, "Request body");
  } catch {
    throw new AppError("BAD_REQUEST", "Invalid JSON body.");
  }
};

export const parseUuidParam = (value: string, label: string): string => {
  if (!UUID_RE.test(value)) {
    throw new AppError("BAD_REQUEST", `${label} must be a UUID.`);
  }
  return value.toLowerCase();
};

export const parsePostSortQuery = (
  value: string | null,
): PostSortOption | undefined => {
  if (value === null) {
    return undefined;
  }
  return readEnumValue(value, POST_SORT_OPTIONS, "sort");
};

export const parsePostCategoryQuery = (
  value: string | null,
): CreatePostInput["category"] | undefined => {
  if (value === null) {
    return undefined;
  }
  return readEnumValue(value, POST_CATEGORIES, "category");
};

export const parsePostStatusQuery = (
  value: string | null,
): PostStatus | undefined => {
  if (value === null) {
    return undefined;
  }
  return readEnumValue(value, POST_STATUSES, "status");
};

export const parseReportStatusQuery = (
  value: string | null,
): ReportStatus | undefined => {
  if (value === null) {
    return undefined;
  }
  return readEnumValue(value, REPORT_STATUSES, "status");
};

export const parseMockLoginInput = (value: unknown): MockLoginInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(body, ["role", "campus_id", "user_id"], "body");

  return {
    role: readEnumValue(body.role, USER_ROLES, "role"),
    campus_id: readOptionalUuidString(body.campus_id, "campus_id"),
    user_id: readOptionalUuidString(body.user_id, "user_id"),
  };
};

export const parseCreatePostInput = (value: unknown): CreatePostInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(
    body,
    [
      "campus_id",
      "category",
      "title",
      "body",
      "price_krw",
      "tags",
      "location_hint",
      "is_promoted",
      "promotion_until",
    ],
    "body",
  );

  const isPromoted = readOptionalBoolean(body.is_promoted, "is_promoted");
  const promotionUntilRaw = readOptionalNullableString(
    body.promotion_until,
    "promotion_until",
  );

  let promotionUntil: string | null | undefined = promotionUntilRaw;
  if (promotionUntilRaw && promotionUntilRaw.length > 0) {
    promotionUntil = readIsoDateString(promotionUntilRaw, "promotion_until");
    if (new Date(promotionUntil).getTime() <= Date.now()) {
      throw new AppError(
        "BAD_REQUEST",
        "promotion_until must be a future datetime.",
      );
    }
  }

  if (isPromoted === true && !promotionUntil) {
    throw new AppError(
      "BAD_REQUEST",
      "promotion_until is required when is_promoted is true.",
    );
  }

  if (isPromoted !== true) {
    if (promotionUntil) {
      throw new AppError(
        "BAD_REQUEST",
        "promotion_until requires is_promoted to be true.",
      );
    }
    promotionUntil = null;
  }

  return {
    campus_id: readOptionalUuidString(body.campus_id, "campus_id"),
    category: readEnumValue(body.category, POST_CATEGORIES, "category"),
    title: readRequiredString(body.title, "title"),
    body: readRequiredString(body.body, "body"),
    price_krw: readOptionalNullableNumber(body.price_krw, "price_krw"),
    tags: readOptionalStringArray(body.tags, "tags"),
    location_hint: readOptionalNullableString(body.location_hint, "location_hint"),
    is_promoted: isPromoted,
    promotion_until: promotionUntil,
  };
};

export const parseUpdatePostInput = (value: unknown): UpdatePostInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(
    body,
    ["category", "title", "body", "price_krw", "tags", "location_hint", "status"],
    "body",
  );

  const input: UpdatePostInput = {
    category: readOptionalEnumValue(body.category, POST_CATEGORIES, "category"),
    title: readOptionalString(body.title, "title"),
    body: readOptionalString(body.body, "body"),
    price_krw: readOptionalNullableNumber(body.price_krw, "price_krw"),
    tags: readOptionalStringArray(body.tags, "tags"),
    location_hint: readOptionalNullableString(body.location_hint, "location_hint"),
    status: readOptionalEnumValue(body.status, POST_STATUSES, "status"),
  };

  const hasAnyValue = Object.values(input).some((entry) => entry !== undefined);
  if (!hasAnyValue) {
    throw new AppError("BAD_REQUEST", "At least one field must be provided.");
  }

  return input;
};

export const parsePromotionUntil = (value: unknown): string => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(body, ["promotion_until"], "body");

  const promotionUntil = readIsoDateString(body.promotion_until, "promotion_until");
  if (new Date(promotionUntil).getTime() <= Date.now()) {
    throw new AppError(
      "BAD_REQUEST",
      "promotion_until must be a future datetime.",
    );
  }

  return promotionUntil;
};

export const parseStartChatInput = (value: unknown): StartChatInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(body, ["post_id"], "body");

  return {
    post_id: readUuidString(body.post_id, "post_id"),
  };
};

export const parseSendMessageInput = (value: unknown): SendMessageInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(body, ["body"], "body");

  return {
    body: readRequiredString(body.body, "body"),
  };
};

export const parseCreateReportInput = (value: unknown): CreateReportInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(
    body,
    ["target_type", "target_id", "reason", "details"],
    "body",
  );

  return {
    target_type: readEnumValue(body.target_type, REPORT_TARGET_TYPES, "target_type"),
    target_id: readUuidString(body.target_id, "target_id"),
    reason: readEnumValue(body.reason, REPORT_REASONS, "reason"),
    details: readRequiredString(body.details, "details"),
  };
};

export const parseResolveReportInput = (
  value: unknown,
): ResolveReportInput => {
  const body = toRecord(value, "Request body");
  ensureKnownKeys(body, ["status", "action_note", "hide_target"], "body");

  const status = readEnumValue(body.status, REPORT_STATUSES, "status");
  if (status === "pending") {
    throw new AppError(
      "BAD_REQUEST",
      "status cannot be pending for report resolution.",
    );
  }

  return {
    status,
    action_note: readRequiredString(body.action_note, "action_note"),
    hide_target: readOptionalBoolean(body.hide_target, "hide_target"),
  };
};
