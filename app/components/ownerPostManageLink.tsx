import Link from "next/link";

interface OwnerPostManageLinkProps {
  postId: string;
  authorId: string;
  sessionUserId: string | null;
}

export function OwnerPostManageLink({
  postId,
  authorId,
  sessionUserId,
}: OwnerPostManageLinkProps) {
  if (!sessionUserId || sessionUserId !== authorId) {
    return null;
  }

  return (
    <Link href={`/me/posts/${postId}/edit`} className="chip chip-accent">
      수정/삭제
    </Link>
  );
}
