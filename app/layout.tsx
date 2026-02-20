import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { mockApi } from "@/src/server/mockApiSingleton";
import { ThemeModeToggle } from "@/app/themeModeToggle";

export const metadata: Metadata = {
  title: "캠퍼스리스트 | CampuList Prototype",
  description:
    "KAIST 대전 본원 파일럿을 위한 게시판 중심 CampuList 시제품",
};

const themeInitScript = `
  (function () {
    try {
      var key = "campulist-theme";
      var saved = localStorage.getItem(key);
      var theme = saved === "light" || saved === "dark" ? saved : "dark";
      document.documentElement.setAttribute("data-theme", theme);
    } catch (e) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  })();
`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const sessionResult = await mockApi.getSession();
  const sessionText = sessionResult.ok
    ? `${sessionResult.data.role} · ${sessionResult.data.campus_id}`
    : "guest";

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <div className="site-shell">
          <header className="site-header">
            <Link href="/">
              <strong className="brand">
                캠퍼스리스트
                <span className="brand-sub">CampuList · campulist.com</span>
              </strong>
            </Link>
            <nav className="nav">
              <Link href="/boards/market">중고거래</Link>
              <Link href="/boards/housing">주거</Link>
              <Link href="/boards/jobs">일자리</Link>
              <Link href="/boards/store">상점홍보</Link>
              <Link href="/chats">채팅</Link>
              <Link href="/me/posts">내 글</Link>
              <Link href="/admin/reports">신고관리</Link>
              <Link href="/write">글쓰기</Link>
              <Link href="/login">역할변경</Link>
            </nav>
            <div className="header-actions">
              <ThemeModeToggle />
              <div className="session-badge">{sessionText}</div>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
