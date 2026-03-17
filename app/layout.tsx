import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import GlobalNav from "./components/GlobalNav";
import ToastContainer from "./components/Toast";
import { ToastProvider } from "./contexts/ToastContext";
import FeedbackButton from "./components/FeedbackButton";

const notoSansJP = Noto_Sans_JP({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "研究管理システム",
  description: "研究機関・研究テーマ・投資家の管理アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased bg-[#F5F5F5]`}>
        <ToastProvider>
          {/* デスクトップ: サイドバー + メインの2カラム */}
          <div className="flex min-h-screen">
            <GlobalNav />
            <main className="flex-1 min-w-0 px-4 py-4 md:px-8 md:py-6">
              <div className="max-w-[960px] mx-auto pb-20">
                {children}
              </div>
            </main>
          </div>
          {/* フィードバックボタン（全画面共通） */}
          <FeedbackButton />
          {/* トースト通知（全画面共通） */}
          <ToastContainer />
        </ToastProvider>
      </body>
    </html>
  );
}
