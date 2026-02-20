import Link from "next/link";
import { POST_STATUSES } from "@/src/domain/enums";
import type { PostStatus } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePaginationParams, parseSearchKeyword } from "@/src/server/params";
import { MyPostActions } from "./postActions";

interface PageProps {
  searchParams: {
    q?: string;
    search?: string;
    status?: string;
    page?: string;
    limit?: string;
  };
}

export default async function MyPostsPage({ searchParams }: PageProps) {
  const status = POST_STATUSES.includes(
    searchParams.status as (typeof POST_STATUSES)[number],
  )
    ? (searchParams.status as PostStatus)
    : undefined;

  const query = new URLSearchParams();
  if (searchParams.q) {
    query.set("q", searchParams.q);
  }
  if (searchParams.search) {
    query.set("search", searchParams.search);
  }
  if (searchParams.status) {
    query.set("status", searchParams.status);
  }
  if (searchParams.page) {
    query.set("page", searchParams.page);
  }
  if (searchParams.limit) {
    query.set("limit", searchParams.limit);
  }

  const { limit, offset, page } = parsePaginationParams(query, { limit: 10 });
  const keyword = parseSearchKeyword(query);

  const [sessionResult, listResult] = await Promise.all([
    mockApi.getSession(),
    mockApi.listPosts({
      status,
      search: keyword,
      sort: "newest",
      limit: 1000,
      offset: 0,
    }),
  ]);

  const currentUserId = sessionResult.ok ? sessionResult.data.user_id : "";
  const allMyPosts =
    listResult.ok && currentUserId
      ? listResult.data.items.filter((post) => post.author_id === currentUserId)
      : [];
  const total = allMyPosts.length;
  const posts = allMyPosts.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const selectedLimit = String(limit);

  return (
    <>
      <section className="hero">
        <h1>내 게시글 관리</h1>
        <p>게시글 상태 변경 및 삭제(소프트 삭제)를 수행할 수 있습니다.</p>
      </section>

      <form className="toolbar" method="GET" style={{ marginTop: 16 }}>
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? searchParams.search ?? ""}
          className="input"
          placeholder="내 게시글 검색"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="select"
          style={{ maxWidth: 160 }}
        >
          <option value="">전체 상태</option>
          {POST_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="row-2" style={{ maxWidth: 280 }}>
          <select
            name="limit"
            defaultValue={selectedLimit}
            className="select"
            style={{ maxWidth: 120 }}
          >
            <option value="10">10개씩</option>
            <option value="20">20개씩</option>
            <option value="50">50개씩</option>
          </select>
          <button className="btn" type="submit">
            적용
          </button>
        </div>
        <input type="hidden" name="page" value="1" />
      </form>

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

      <div className="post-meta" style={{ marginTop: 16, justifyContent: "space-between" }}>
        <span>
          총 {total.toLocaleString()}건 · {page}페이지
        </span>
        <div className="row-2" style={{ maxWidth: 280 }}>
          {page > 1 ? (
            <Link
              href={buildMyPostsHref({
                q: searchParams.q ?? searchParams.search ?? "",
                status,
                page: page - 1,
                limit,
              })}
              className="btn"
            >
              이전
            </Link>
          ) : (
            <button type="button" className="btn" disabled>
              이전
            </button>
          )}
          {hasMore ? (
            <Link
              href={buildMyPostsHref({
                q: searchParams.q ?? searchParams.search ?? "",
                status,
                page: page + 1,
                limit,
              })}
              className="btn"
            >
              다음
            </Link>
          ) : (
            <button type="button" className="btn" disabled>
              다음
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const buildMyPostsHref = ({
  q,
  status,
  page,
  limit,
}: {
  q: string;
  status?: PostStatus;
  page: number;
  limit: number;
}): string => {
  const params = new URLSearchParams();
  if (q.trim()) {
    params.set("q", q.trim());
  }
  if (status) {
    params.set("status", status);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  if (limit !== 10) {
    params.set("limit", String(limit));
  }
  const query = params.toString();
  return query ? `/me/posts?${query}` : "/me/posts";
};
