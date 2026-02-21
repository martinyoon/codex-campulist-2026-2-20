export const USER_ROLES = [
  "student",
  "professor",
  "staff",
  "merchant",
  "admin",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const STUDENT_TYPES = ["undergrad", "graduate"] as const;

export type StudentType = (typeof STUDENT_TYPES)[number];

export const POST_CATEGORIES = [
  "market",
  "housing",
  "jobs",
  "store",
] as const;

export type PostCategory = (typeof POST_CATEGORIES)[number];

export const POST_STATUSES = [
  "draft",
  "active",
  "reserved",
  "closed",
  "hidden",
] as const;

export type PostStatus = (typeof POST_STATUSES)[number];

export const POST_SORT_OPTIONS = [
  "newest",
  "oldest",
  "price_asc",
  "price_desc",
  "popular",
] as const;

export type PostSortOption = (typeof POST_SORT_OPTIONS)[number];

export const CHAT_THREAD_STATUSES = ["open", "closed"] as const;

export type ChatThreadStatus = (typeof CHAT_THREAD_STATUSES)[number];

export const REPORT_TARGET_TYPES = ["post"] as const;

export type ReportTargetType = (typeof REPORT_TARGET_TYPES)[number];

export const REPORT_REASONS = [
  "spam",
  "fraud",
  "abuse",
  "prohibited_item",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_STATUSES = [
  "pending",
  "reviewed",
  "actioned",
  "rejected",
] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];
