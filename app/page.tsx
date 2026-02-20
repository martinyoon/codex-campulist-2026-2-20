import Link from "next/link";
import { mockApi } from "@/src/server/mockApiSingleton";

const categories = [
  { slug: "market", title: "중고거래", desc: "교재, 전자기기, 생활용품 거래" },
  { slug: "housing", title: "주거", desc: "원룸, 하숙, 룸메, 단기양도" },
  { slug: "jobs", title: "일자리", desc: "알바, 과외, TA/RA, 단기업무" },
  { slug: "store", title: "상점홍보", desc: "쿠폰, 이벤트, 상인 채용" },
];

export default async function HomePage() {
  const promotedResult = await mockApi.listPosts({
    promoted_only: true,
    limit: 3,
  });
  const latestResult = await mockApi.listPosts({
    sort: "newest",
    limit: 8,
  });

  const promoted = promotedResult.ok ? promotedResult.data.items : [];
  const latest = latestResult.ok ? latestResult.data.items : [];

  return (
    <>
      <section className="hero">
        <h1>
          KAIST 대전 본원
          <br />
          파일럿 게시판 시제품
        </h1>
        <p>
          Supabase 미연결 단계에서 핵심 흐름(목록/상세/작성/채팅시작/신고)을
          검증하기 위한 CampuList 프로토타입입니다.
        </p>
      </section>

      <h2 className="section-title">핵심 카테고리</h2>
      <section className="grid grid-4">
        {categories.map((category) => (
          <Link
            key={category.slug}
            className="card"
            href={`/boards/${category.slug}`}
          >
            <h3>{category.title}</h3>
            <p className="muted">{category.desc}</p>
          </Link>
        ))}
      </section>

      <h2 className="section-title">상단노출 게시글</h2>
      <section className="grid grid-2">
        {promoted.map((post) => (
          <article key={post.id} className="post-item">
            <h4>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h4>
            <p className="muted">{post.body.slice(0, 80)}</p>
            <div className="post-meta">
              <span className="chip chip-accent">상단노출</span>
              <span>조회 {post.view_count}</span>
              {post.price_krw !== null ? <span>{post.price_krw.toLocaleString()}원</span> : null}
            </div>
          </article>
        ))}
        {promoted.length === 0 ? (
          <article className="post-item">
            <p className="muted">현재 상단노출 게시글이 없습니다.</p>
          </article>
        ) : null}
      </section>

      <h2 className="section-title">최신 게시글</h2>
      <section className="grid">
        {latest.map((post) => (
          <article key={post.id} className="post-item">
            <h4>
              <Link href={`/posts/${post.id}`}>{post.title}</Link>
            </h4>
            <p className="muted">{post.body.slice(0, 100)}</p>
            <div className="post-meta">
              <span className="chip">{post.category}</span>
              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
              <span>조회 {post.view_count}</span>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
