import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import ThemeForm from "../_components/ThemeForm";

export const metadata = {
  title: "研究テーマを登録 | 研究管理システム",
};

export default function NewThemePage() {
  return (
    <div>
      <Link
        href="/themes"
        className="inline-flex items-center gap-1 text-[#0017C1] text-sm hover:underline mb-4 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        一覧へ戻る
      </Link>

      <h1 className="text-3xl font-bold text-[#1A1A1C] mb-6">研究テーマを登録</h1>

      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-6">
        <ThemeForm />
      </div>
    </div>
  );
}
