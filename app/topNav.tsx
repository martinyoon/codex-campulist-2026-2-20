"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/src/domain/enums";

interface TopNavProps {
  sessionRole: UserRole | null;
}

interface NavItem {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/boards/market",
    label: "중고거래",
    match: (pathname) => pathname === "/boards/market",
  },
  {
    href: "/boards/housing",
    label: "주거",
    match: (pathname) => pathname === "/boards/housing",
  },
  {
    href: "/boards/jobs",
    label: "일자리",
    match: (pathname) => pathname === "/boards/jobs",
  },
  {
    href: "/boards/store",
    label: "상점홍보",
    match: (pathname) => pathname === "/boards/store",
  },
  {
    href: "/chats",
    label: "채팅",
    match: (pathname) => pathname === "/chats" || pathname.startsWith("/chats/"),
  },
  {
    href: "/me/posts",
    label: "내 글",
    match: (pathname) => pathname === "/me/posts",
  },
  {
    href: "/write",
    label: "글쓰기",
    match: (pathname) => pathname === "/write",
  },
  {
    href: "/login",
    label: "역할변경",
    match: (pathname) => pathname === "/login",
  },
];

export function TopNav({ sessionRole }: TopNavProps) {
  const pathname = usePathname();
  const items = sessionRole === "admin"
    ? [
        ...NAV_ITEMS.slice(0, 6),
        {
          href: "/admin/reports",
          label: "신고관리",
          match: (currentPathname: string) => currentPathname === "/admin/reports",
        },
        ...NAV_ITEMS.slice(6),
      ]
    : NAV_ITEMS;

  return (
    <nav className="nav" aria-label="주요 메뉴">
      {items.map((item) => {
        const active = item.match(pathname);
        return (
          <Link
            href={item.href}
            key={item.href}
            className={active ? "nav-link is-active" : "nav-link"}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
