import Link from "next/link";
import { mockApi } from "@/src/server/mockApiSingleton";
import { MyPostActions } from "./postActions";

export default async function MyPostsPage() {
  const [sessionResult, listResult] = await Promise.all([
    mockApi.getSession(),
    mockApi.listPosts({
      sort: "newest",
      limit: 200,
      offset: 0,
    }),
  ]);

  const currentUserId = sessionResult.ok ? sessionResult.data.user_id : "";
  const posts =
    listResult.ok && currentUserId
      ? listResult.data.items.filter((post) => post.author_id === currentUserId)
      : [];

  return (
    <>
      <section className="hero">
        <h1>내 게시글 관리</h1>
        <p>게시글 상태 변경 및 삭제(소프트 삭제)를 수행할 수 있습니다.</p>
      </section>

      <section className="grid" style={{ marginTop: 16 }}>
        {posts.map((post) => (
          <article key={post.id} className="post-item">
            <h4>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h4>
            <p className="muted">{post.body.slice(0, 140)}</p>
            <div className="post-meta">
              <span className="chip">{post.status}</span>
              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
              {post.price_krw !== null ? <span>{post.price_krw.toLocaleString()}원</span> : null}
            </div>
            <MyPostActions postId={post.id} currentStatus={post.status} />
          </article>
        ))}

        {posts.length === 0 ? (
          <article className="post-item">
            <p className="muted">작성한 게시글이 없습니다.</p>
          </article>
        ) : null}
      </section>
    </>
  );
}
