import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="hero">
      <h1>페이지를 찾을 수 없습니다.</h1>
      <p>요청하신 게시글이나 경로가 존재하지 않습니다.</p>
      <div style={{ marginTop: 12 }}>
        <Link href="/" className="btn">
          홈으로 이동
        </Link>
      </div>
    </section>
  );
}
