import type { UserRole } from "@/src/domain/enums";
import type { Post } from "@/src/domain/types";
import { getCampusNameById } from "@/src/ui/campuses";
import { getUserRoleLabel } from "@/src/ui/labelMap";

interface DisplayTitleInput {
  title: string;
  campus_id: string;
  author_role_snapshot: UserRole | null;
  show_affiliation_prefix: boolean;
}

export const formatDisplayPostTitle = (post: Pick<
  Post,
  "title" | "campus_id" | "author_role_snapshot" | "show_affiliation_prefix"
>): string => {
  return formatDisplayTitle({
    title: post.title,
    campus_id: post.campus_id,
    author_role_snapshot: post.author_role_snapshot,
    show_affiliation_prefix: post.show_affiliation_prefix,
  });
};

export const formatDisplayTitle = ({
  title,
  campus_id,
  author_role_snapshot,
  show_affiliation_prefix,
}: DisplayTitleInput): string => {
  const normalizedTitle = title.trim();
  if (!show_affiliation_prefix || !author_role_snapshot || !campus_id) {
    return normalizedTitle;
  }

  const campusLabel = getCampusNameById(campus_id);
  const roleLabel = getUserRoleLabel(author_role_snapshot);
  return `[${campusLabel}][${roleLabel}] ${normalizedTitle}`;
};
