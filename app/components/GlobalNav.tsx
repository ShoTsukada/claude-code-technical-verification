"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  FlaskConical,
  Users,
  MessageSquare,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

// ナビゲーションリンク定義
const navLinks = [
  { href: "/institutions", label: "研究機関", icon: Building2 },
  { href: "/themes", label: "研究テーマ", icon: FlaskConical },
  { href: "/investors", label: "投資家", icon: Users },
  { href: "/feedback", label: "フィードバック", icon: MessageSquare },
  { href: "/admin/feedback", label: "フィードバック管理", icon: LayoutDashboard },
];

// NavLinks をコンポーネント外部に定義してレンダー時の再生成を防ぐ
function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  const linkClass = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")
      ? "flex items-center gap-3 px-4 py-3 rounded-md text-[#0017C1] font-bold bg-[#E6E8FB] border-l-4 border-[#0017C1] transition-colors duration-150"
      : "flex items-center gap-3 px-4 py-3 rounded-md text-[#1A1A1C] hover:bg-[#F5F5F5] transition-colors duration-150";

  return (
    <nav aria-label="メインナビゲーション">
      <ul className="space-y-1">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className={linkClass(href)}
              onClick={onLinkClick}
            >
              <Icon size={20} aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function GlobalNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      {/* デスクトップ用サイドバー（768px以上） */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 h-screen sticky top-0 bg-white border-r border-[#EBEBEB] px-3 py-6">
        <div className="mb-6 px-4">
          <span className="text-lg font-bold text-[#0017C1]">研究管理システム</span>
        </div>
        <NavLinks />
      </aside>

      {/* モバイル用ヘッダー（768px未満） */}
      <header className="md:hidden flex items-center justify-between h-14 px-4 bg-[#0017C1] text-white sticky top-0 z-40">
        <span className="font-bold">研究管理システム</span>
        <button
          type="button"
          aria-label="メニューを開く"
          aria-expanded={drawerOpen}
          aria-controls="mobile-drawer"
          onClick={() => setDrawerOpen(true)}
          className="p-2 rounded-md focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:text-[#1A1A1C] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
      </header>

      {/* モバイル用ドロワー */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="ナビゲーション"
          id="mobile-drawer"
        >
          {/* オーバーレイ */}
          <div
            className="absolute inset-0 bg-[rgba(0,0,0,0.45)]"
            onClick={closeDrawer}
          />
          {/* ドロワーパネル */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white px-3 py-6 shadow-[var(--shadow-4)]">
            <div className="flex items-center justify-between mb-6 px-4">
              <span className="font-bold text-[#0017C1]">研究管理システム</span>
              <button
                type="button"
                aria-label="メニューを閉じる"
                onClick={closeDrawer}
                className="p-1 rounded-md focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <NavLinks onLinkClick={closeDrawer} />
          </div>
        </div>
      )}
    </>
  );
}
