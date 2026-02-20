import Link from "next/link";
import { notFound } from "next/navigation";
import { POST_CATEGORIES, POST_SORT_OPTIONS } from "@/src/domain/enums";
import type { PostSortOption } from "@/src/domain/enums";
import { mockApi } from "@/src/server/mockApiSingleton";

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

  const result = await mockApi.listPosts({
    category: params.category as (typeof POST_CATEGORIES)[number],
    search: searchParams.q,
    sort,
    limit: 40,
  });

  const list = result.ok ? result.data.items : [];

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
        <button className="btn" type="submit">
          적용
        </button>
      </form>

      <section className="grid">
        {list.map((post) => (
          <article className="post-item" key={post.id}>
            <h4>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h4>
            <p className="muted">{post.body.slice(0, 140)}</p>
            <div className="post-meta">
              <span className="chip">{post.status}</span>
              {post.is_promoted ? <span className="chip chip-accent">상단노출</span> : null}
              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
              {post.price_krw !== null ? <span>{post.price_krw.toLocaleString()}원</span> : null}
              <span>조회 {post.view_count}</span>
            </div>
          </article>
        ))}
        {list.length === 0 ? (
          <article className="post-item">
            <p className="muted">조건에 맞는 게시글이 없습니다.</p>
          </article>
        ) : null}
      </section>
    </>
  );
}
