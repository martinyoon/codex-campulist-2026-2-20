import Link from "next/link";
import { notFound } from "next/navigation";
import { POST_CATEGORIES, POST_SORT_OPTIONS } from "@/src/domain/enums";
import type { PostSortOption } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";
import { EmptyState, ErrorState } from "@/app/stateBlocks";
import { StatusBadge } from "@/app/components/statusBadge";

const categoryTitle: Record<string, string> = {
  market: "중고거래",
  housing: "주거",
  jobs: "일자리",
  store: "상점홍보",
};

interface PageProps {
  params: { category: string };
  searchParams: {
    q?: string;
    sort?: string;
    page?: string;
  };
}

export default async function BoardPage({ params, searchParams }: PageProps) {
  if (!POST_CATEGORIES.includes(params.category as (typeof POST_CATEGORIES)[number])) {
    notFound();
  }

  const sort = POST_SORT_OPTIONS.includes(
    searchParams.sort as (typeof POST_SORT_OPTIONS)[number],
  )
    ? (searchParams.sort as PostSortOption)
    : "newest";
  const page = parsePage(searchParams.page);
  const limit = 12;
  const offset = (page - 1) * limit;

  const result = await mockApi.listPosts({
    category: params.category as (typeof POST_CATEGORIES)[number],
    search: searchParams.q,
    sort,
    limit,
    offset,
  });
  if (!result.ok) {
    return (
      <>
        <section className="hero">
          <h1>{categoryTitle[params.category]}</h1>
          <p>
            검색/정렬 기반 목록 검증 페이지입니다. Supabase 전환 시 동일 쿼리
            구조를 유지할 수 있도록 설계했습니다.
          </p>
        </section>

        <form className="toolbar" method="GET">
          <input
            type="text"
            name="q"
            defaultValue={searchParams.q ?? ""}
            className="input"
            placeholder="키워드 검색"
          />
          <select name="sort" defaultValue={sort} className="select">
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="price_asc">가격 낮은순</option>
            <option value="price_desc">가격 높은순</option>
            <option value="popular">조회순</option>
          </select>
          <div className="row-2" style={{ maxWidth: 280 }}>
            <button className="btn" type="submit">
              적용
            </button>
            <Link className="btn" href={`/boards/${params.category}`}>
              초기화
            </Link>
          </div>
        </form>

        <ErrorState
          title="게시글 목록을 불러오지 못했습니다."
          description={result.error.message}
          action_href={`/boards/${params.category}`}
          action_label="다시 시도"
        />
      </>
    );
  }

  const list = result.data.items;
  const total = result.data.total;
  const hasMore = result.data.has_more;

  return (
    <>
      <section className="hero">
        <h1>{categoryTitle[params.category]}</h1>
        <p>
          검색/정렬 기반 목록 검증 페이지입니다. Supabase 전환 시 동일 쿼리
          구조를 유지할 수 있도록 설계했습니다.
        </p>
      </section>

      <form className="toolbar" method="GET">
        <input
          type="text"
          name="q"
          defaultValue={searchParams.q ?? ""}
          className="input"
          placeholder="키워드 검색"
        />
        <select name="sort" defaultValue={sort} className="select">
          <option value="newest">최신순</option>
          <option value="oldest">오래된순</option>
          <option value="price_asc">가격 낮은순</option>
          <option value="price_desc">가격 높은순</option>
          <option value="popular">조회순</option>
        </select>
        <div className="row-2" style={{ maxWidth: 280 }}>
          <button className="btn" type="submit">
            적용
          </button>
          <Link className="btn" href={`/boards/${params.category}`}>
            초기화
          </Link>
        </div>
      </form>

      <section className="grid">
        {list.map((post) => (
          <article className="post-item" key={post.id}>
            <h4>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h4>
            <p className="muted">{post.body.slice(0, 140)}</p>
            <div className="post-meta">
              <StatusBadge kind="post" value={post.status} />
              {post.is_promoted ? <span className="chip chip-accent">상단노출</span> : null}
              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
              {post.price_krw !== null ? <span>{post.price_krw.toLocaleString()}원</span> : null}
              <span>조회 {post.view_count}</span>
            </div>
          </article>
        ))}
        {list.length === 0 ? (
          <EmptyState
            title="조건에 맞는 게시글이 없습니다."
            description="검색어를 바꾸거나 정렬 조건을 초기화해 보세요."
            action_href={`/boards/${params.category}`}
            action_label="조건 초기화"
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
              href={buildPageHref(params.category, searchParams, page - 1)}
              className="btn"
            >
              이전
            </Link>
          ) : (
            <button className="btn" type="button" disabled>
              이전
            </button>
          )}
          {hasMore ? (
            <Link
              href={buildPageHref(params.category, searchParams, page + 1)}
              className="btn"
            >
              다음
            </Link>
          ) : (
            <button className="btn" type="button" disabled>
              다음
            </button>
          )}
        </div>
      </div>
    </>
  );
}

const parsePage = (value: string | undefined): number => {
  if (!value) {
    return 1;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return parsed;
};

const buildPageHref = (
  category: string,
  searchParams: PageProps["searchParams"],
  page: number,
): string => {
  const params = new URLSearchParams();

  if (searchParams.q && searchParams.q.trim().length > 0) {
    params.set("q", searchParams.q);
  }
  if (searchParams.sort && searchParams.sort.trim().length > 0) {
    params.set("sort", searchParams.sort);
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query
    ? `/boards/${category}?${query}`
    : `/boards/${category}`;
};
