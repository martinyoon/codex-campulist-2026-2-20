import type { StudentType, UserRole } from "@/src/domain/enums";
import type { Post } from "@/src/domain/types";
import { getCampusNameById } from "@/src/ui/campuses";
import { getUserRoleDisplayLabel } from "@/src/ui/labelMap";

interface AffiliationPrefixInput {
  campus_id: string;
  author_role_snapshot: UserRole | null;
  author_student_type_snapshot: StudentType | null;
}

interface DisplayTitleInput {
  title: string;
  campus_id: string;
  author_role_snapshot: UserRole | null;
  author_student_type_snapshot: StudentType | null;
  show_affiliation_prefix: boolean;
}

export const formatDisplayPostTitle = (post: Pick<
  Post,
  | "title"
  | "campus_id"
  | "author_role_snapshot"
  | "author_student_type_snapshot"
  | "show_affiliation_prefix"
>): string => {
  return formatDisplayTitle({
    title: post.title,
    campus_id: post.campus_id,
    author_role_snapshot: post.author_role_snapshot,
    author_student_type_snapshot: post.author_student_type_snapshot,
    show_affiliation_prefix: post.show_affiliation_prefix,
  });
};

export const formatAffiliationPrefix = ({
  campus_id,
  author_role_snapshot,
  author_student_type_snapshot,
}: AffiliationPrefixInput): string => {
  if (!author_role_snapshot || !campus_id) {
    return "";
  }
  const campusLabel = getCampusNameById(campus_id);
  const roleLabel = getUserRoleDisplayLabel(
    author_role_snapshot,
    author_student_type_snapshot,
  );
  return `[${campusLabel}][${roleLabel}]`;
};

export const formatDisplayTitle = ({
  title,
  campus_id,
  author_role_snapshot,
  author_student_type_snapshot,
  show_affiliation_prefix,
}: DisplayTitleInput): string => {
  const normalizedTitle = title.trim();
  if (!show_affiliation_prefix || !author_role_snapshot || !campus_id) {
    return normalizedTitle;
  }

  const affiliationPrefix = formatAffiliationPrefix({
    campus_id,
    author_role_snapshot,
    author_student_type_snapshot,
  });
  return `${affiliationPrefix} ${normalizedTitle}`;
};
