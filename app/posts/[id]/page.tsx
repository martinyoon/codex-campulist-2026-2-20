import Link from "next/link";
import { notFound } from "next/navigation";
import { mockApi } from "@/src/server/mockApiSingleton";
import { PostActions } from "./postActions";
import { getPostCategoryLabel } from "@/src/ui/labelMap";
import { StatusBadge } from "@/app/components/statusBadge";
import { OwnerPostManageLink } from "@/app/components/ownerPostManageLink";

interface PageProps {
  params: { id: string };
}

export default async function PostDetailPage({ params }: PageProps) {
  const [sessionResult, result] = await Promise.all([
    mockApi.getSession(),
    mockApi.getPost(params.id),
  ]);

  if (!result.ok || !result.data) {
    notFound();
  }

  const post = result.data;
  const sessionUserId = sessionResult.ok ? sessionResult.data.user_id : null;
  const isOwner = sessionUserId === post.author_id;

  return (
    <>
      <section className="hero">
        <div className="chip">{getPostCategoryLabel(post.category)}</div>
        <h1 style={{ marginTop: 10 }}>{post.title}</h1>
        <p>
          {post.location_hint ? `거래/활동 위치: ${post.location_hint} · ` : ""}
          조회 {post.view_count + 1}
        </p>
      </section>

      <article className="card" style={{ marginTop: 16 }}>
        <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>{post.body}</p>
        <div className="post-meta">
          <span>작성: {new Date(post.created_at).toLocaleString("ko-KR")}</span>
          <StatusBadge kind="post" value={post.status} />
          {post.price_krw !== null ? <span>가격: {post.price_krw.toLocaleString()}원</span> : null}
          {post.is_promoted ? <span className="chip chip-accent">상단노출중</span> : null}
          <OwnerPostManageLink
            postId={post.id}
            authorId={post.author_id}
            sessionUserId={sessionUserId}
          />
        </div>
        {post.tags.length > 0 ? (
          <div className="post-meta">
            {post.tags.map((tag) => (
              <span key={tag} className="chip">
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      {isOwner ? null : <PostActions postId={post.id} />}

      <div className="row-2" style={{ marginTop: 16 }}>
        <Link href={`/boards/${post.category}`} className="btn">
          목록으로
        </Link>
        <Link href="/write" className="btn">
          새 글 쓰기
        </Link>
      </div>
    </>
  );
}
