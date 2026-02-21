import type { PostCategory, UserRole } from "./enums";
import type { Post, SessionContext } from "./types";

const CATEGORY_ACCESS_BY_ROLE: Record<UserRole, readonly PostCategory[]> = {
  student: ["market", "housing", "jobs"],
  professor: ["market", "housing", "jobs"],
  staff: ["market", "housing", "jobs"],
  merchant: ["store", "jobs"],
  admin: ["market", "housing", "jobs", "store"],
};

export const getAllowedCategoriesForRole = (role: UserRole): PostCategory[] => [
  ...CATEGORY_ACCESS_BY_ROLE[role],
];

export const isAdmin = (session: SessionContext): boolean =>
  session.role === "admin";

export const canCreateInCategory = (
  session: SessionContext,
  category: PostCategory,
): boolean => getAllowedCategoriesForRole(session.role).includes(category);

export const canReadPost = (session: SessionContext, post: Post): boolean => {
  if (isAdmin(session)) {
    return true;
  }
  if (session.campus_id !== post.campus_id) {
    return false;
  }
  if (post.deleted_at !== null) {
    return false;
  }
  if (post.status === "hidden") {
    return false;
  }
  if (post.status === "draft") {
    return session.user_id === post.author_id;
  }
  return true;
};

export const canMutatePost = (session: SessionContext, post: Post): boolean => {
  if (isAdmin(session)) {
    return true;
  }
  return session.user_id === post.author_id && session.campus_id === post.campus_id;
};

export const canModerateReports = (session: SessionContext): boolean =>
  session.role === "admin";
