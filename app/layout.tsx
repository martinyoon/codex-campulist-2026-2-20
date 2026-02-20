import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { mockApi } from "@/src/server/mockApiSingleton";
import { ThemeModeToggle } from "@/app/themeModeToggle";
import { TopNav } from "@/app/topNav";
import { ToastProvider } from "@/app/components/toastProvider";
import { getUserRoleLabel } from "@/src/ui/labelMap";

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
  const sessionRole = sessionResult.ok ? sessionResult.data.role : null;
  const sessionText = sessionResult.ok
    ? `${getUserRoleLabel(sessionResult.data.role)} · ${sessionResult.data.campus_id.slice(
        0,
        8,
      )}`
    : "게스트";

  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ToastProvider>
          <div className="site-shell">
            <header className="site-header">
              <Link href="/">
                <strong className="brand">
                  캠퍼스리스트
                  <span className="brand-sub">CampuList · campulist.com</span>
                </strong>
              </Link>
              <TopNav sessionRole={sessionRole} />
              <div className="header-actions">
                <ThemeModeToggle />
                <div className="session-badge">{sessionText}</div>
              </div>
            </header>
            <main>{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
