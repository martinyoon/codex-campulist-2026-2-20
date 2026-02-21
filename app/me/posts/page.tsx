import Link from "next/link";
import { POST_STATUSES } from "@/src/domain/enums";
import type { PostStatus } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";
import { parsePaginationParams, parseSearchKeyword } from "@/src/server/params";
import { MyPostActions } from "./postActions";
import { EmptyState, ErrorState } from "@/app/stateBlocks";
import { getPostStatusLabel } from "@/src/ui/labelMap";
import { StatusBadge } from "@/app/components/statusBadge";
import { formatDisplayPostTitle } from "@/src/ui/postDisplayTitle";

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

  if (!sessionResult.ok) {
    return (
      <>
        <section className="hero">
          <h1>내 게시글 관리</h1>
          <p>게시글 수정/삭제를 수행할 수 있습니다. 상태 변경은 수정 화면에서 처리됩니다.</p>
        </section>
        <ErrorState
          title="세션 정보를 확인할 수 없습니다."
          description={sessionResult.error.message}
          action_href="/login"
          action_label="역할 전환하기"
        />
      </>
    );
  }

  if (!listResult.ok) {
    return (
      <>
        <section className="hero">
          <h1>내 게시글 관리</h1>
          <p>게시글 수정/삭제를 수행할 수 있습니다. 상태 변경은 수정 화면에서 처리됩니다.</p>
        </section>
        <ErrorState
          title="내 게시글 목록을 불러오지 못했습니다."
          description={listResult.error.message}
          action_href="/me/posts"
          action_label="다시 시도"
        />
      </>
    );
  }

  const currentUserId = sessionResult.data.user_id;
  const allMyPosts = listResult.data.items.filter(
    (post) => post.author_id === currentUserId,
  );
  const total = allMyPosts.length;
  const posts = allMyPosts.slice(offset, offset + limit);
  const hasMore = offset + limit < total;
  const selectedLimit = String(limit);

  return (
    <>
      <section className="hero">
        <h1>내 게시글 관리</h1>
        <p>게시글 수정/삭제를 수행할 수 있습니다. 상태 변경은 수정 화면에서 처리됩니다.</p>
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
              {getPostStatusLabel(item)}
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
        <Link className="btn" href="/me/posts">
          초기화
        </Link>
        <input type="hidden" name="page" value="1" />
      </form>

      <section className="grid" style={{ marginTop: 16 }}>
        {posts.map((post) => (
          <article key={post.id} className="post-item">
            <h4>
              <Link href={`/posts/${post.id}`}>{formatDisplayPostTitle(post)}</Link>
            </h4>
            <p className="muted">{post.body.slice(0, 140)}</p>
            <div className="post-meta">
              <StatusBadge kind="post" value={post.status} />
              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
              {post.price_krw !== null ? <span>{post.price_krw.toLocaleString()}원</span> : null}
            </div>
            <MyPostActions postId={post.id} />
          </article>
        ))}

        {posts.length === 0 ? (
          <EmptyState
            title="작성한 게시글이 없습니다."
            description="첫 글을 작성하고 거래/모집/홍보를 시작해 보세요."
            action_href="/write"
            action_label="글 작성하기"
          />
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
