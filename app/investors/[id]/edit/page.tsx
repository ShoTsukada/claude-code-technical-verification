import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getEntity } from "../../../../lib/services/entityService";
import type { Investor } from "../../../../lib/types";
import InvestorForm from "../../_components/InvestorForm";

export const metadata = {
  title: "投資家を編集 | 研究管理システム",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvestorPage({ params }: PageProps) {
  const { id } = await params;

  let investor: Investor;
  try {
    investor = await getEntity<Investor>("investors", id);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/investors/${id}`}
        className="inline-flex items-center gap-1 text-[#0017C1] text-sm hover:underline mb-4 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        詳細へ戻る
      </Link>

      <h1 className="text-3xl font-bold text-[#1A1A1C] mb-6">投資家を編集</h1>

      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-6">
        <InvestorForm defaultValues={investor} investorId={id} />
      </div>
    </div>
  );
}
