import type {
  ChatThreadStatus,
  PostCategory,
  PostSortOption,
  PostStatus,
  ReportReason,
  ReportStatus,
  ReportTargetType,
  StudentType,
  UserRole,
} from "./enums";

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Campus extends BaseEntity {
  slug: string;
  name_ko: string;
  name_en: string;
  city: string;
  is_active: boolean;
}

export interface User extends BaseEntity {
  campus_id: string;
  role: UserRole;
  student_type: StudentType | null;
  display_name: string;
  nickname: string;
  trust_score: number;
  is_verified_school_email: boolean;
  is_verified_phone: boolean;
}

export interface Post extends BaseEntity {
  campus_id: string;
  category: PostCategory;
  author_id: string;
  author_role_snapshot: UserRole | null;
  author_student_type_snapshot: StudentType | null;
  show_affiliation_prefix: boolean;
  title: string;
  body: string;
  price_krw: number | null;
  tags: string[];
  location_hint: string | null;
  status: PostStatus;
  is_promoted: boolean;
  promotion_until: string | null;
  view_count: number;
}

export interface ChatThread extends BaseEntity {
  campus_id: string;
  post_id: string;
  participant_ids: string[];
  status: ChatThreadStatus;
  last_message_at: string | null;
}

export interface ChatMessage extends BaseEntity {
  campus_id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
}

export interface Report extends BaseEntity {
  campus_id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string;
  status: ReportStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  action_note: string | null;
}

export interface SessionContext {
  user_id: string;
  role: UserRole;
  student_type: StudentType | null;
  campus_id: string;
}

export interface ListResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface PostListQuery {
  campus_id?: string;
  category?: PostCategory;
  status?: PostStatus;
  search?: string;
  sort?: PostSortOption;
  promoted_only?: boolean;
  include_hidden?: boolean;
  limit?: number;
  offset?: number;
}

export interface CreatePostInput {
  campus_id?: string;
  category: PostCategory;
  title: string;
  body: string;
  show_affiliation_prefix?: boolean;
  price_krw?: number | null;
  tags?: string[];
  location_hint?: string | null;
  is_promoted?: boolean;
  promotion_until?: string | null;
}

export interface UpdatePostInput {
  category?: PostCategory;
  title?: string;
  body?: string;
  price_krw?: number | null;
  tags?: string[];
  location_hint?: string | null;
  status?: PostStatus;
}

export interface StartChatInput {
  post_id: string;
}

export interface SendMessageInput {
  body: string;
}

export interface CreateReportInput {
  target_type: ReportTargetType;
  target_id: string;
  reason: ReportReason;
  details: string;
}

export interface ReportListQuery {
  campus_id?: string;
  status?: ReportStatus;
  limit?: number;
  offset?: number;
}

export interface ResolveReportInput {
  status: Exclude<ReportStatus, "pending">;
  action_note: string;
  hide_target?: boolean;
}

export interface MockLoginInput {
  role: UserRole;
  student_type?: StudentType;
  campus_id?: string;
  user_id?: string;
}
