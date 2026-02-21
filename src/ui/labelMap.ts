import type {
  ChatThreadStatus,
  PostCategory,
  PostStatus,
  ReportReason,
  ReportStatus,
  StudentType,
  UserRole,
} from "@/src/domain/enums";

const USER_ROLE_LABELS: Record<UserRole, string> = {
  student: "학생",
  professor: "교수",
  staff: "교직원",
  merchant: "인근상인",
  admin: "관리자",
};

const STUDENT_TYPE_LABELS: Record<StudentType, string> = {
  undergrad: "학부생",
  graduate: "대학원생",
};

const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  market: "중고거래",
  housing: "주거",
  jobs: "일자리",
  store: "상점홍보",
};

const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft: "임시저장",
  active: "게시중",
  reserved: "예약중",
  closed: "마감",
  hidden: "숨김",
};

const POST_STATUS_DESCRIPTIONS: Partial<Record<PostStatus, string>> = {
  active: "글이 공개되어 있고, 거래/문의(채팅)를 받는 상태",
  reserved: "거래 상대가 잠정 확정되어, 다른 문의를 사실상 멈춘 상태",
  closed: "거래/모집이 끝나서 더 이상 진행하지 않는 종료 상태",
};

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: "스팸/도배",
  fraud: "사기 의심",
  abuse: "욕설/혐오",
  prohibited_item: "금지품목",
  other: "기타",
};

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "대기",
  reviewed: "검토완료",
  actioned: "조치완료",
  rejected: "반려",
};

const CHAT_THREAD_STATUS_LABELS: Record<ChatThreadStatus, string> = {
  open: "진행중",
  closed: "종료",
};

export const getUserRoleLabel = (value: UserRole): string => USER_ROLE_LABELS[value];

export const getStudentTypeLabel = (value: StudentType): string =>
  STUDENT_TYPE_LABELS[value];

export const getUserRoleDisplayLabel = (
  role: UserRole,
  studentType: StudentType | null,
): string => {
  if (role !== "student") {
    return getUserRoleLabel(role);
  }
  if (!studentType) {
    return getUserRoleLabel(role);
  }
  return getStudentTypeLabel(studentType);
};

export const getPostCategoryLabel = (value: PostCategory): string =>
  POST_CATEGORY_LABELS[value];

export const getPostStatusLabel = (value: PostStatus): string =>
  POST_STATUS_LABELS[value];

export const getPostStatusDescription = (value: PostStatus): string =>
  POST_STATUS_DESCRIPTIONS[value] ?? "게시글 진행 상태";

export const getReportReasonLabel = (value: ReportReason): string =>
  REPORT_REASON_LABELS[value];

export const getReportStatusLabel = (value: ReportStatus): string =>
  REPORT_STATUS_LABELS[value];

export const getChatThreadStatusLabel = (value: ChatThreadStatus): string =>
  CHAT_THREAD_STATUS_LABELS[value];
