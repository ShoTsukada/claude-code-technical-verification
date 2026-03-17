import Link from "next/link";
import { ChevronLeft, Pencil, Users, Tag, Phone, Briefcase } from "lucide-react";
import { notFound } from "next/navigation";
import { getEntity } from "../../../lib/services/entityService";
import type { Investor } from "../../../lib/types";
import DeleteButton from "../_components/DeleteButton";
import AssociationSection from "../../components/AssociationSection";

const typeLabel: Record<string, string> = {
  individual: "個人",
  corporate: "法人",
};

const typeBadgeClass: Record<string, string> = {
  individual: "bg-[#E8F7EE] text-[#006E28]",
  corporate: "bg-[#E6E8FB] text-[#0017C1]",
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  try {
    const investor = await getEntity<Investor>("investors", id);
    return { title: `${investor.name} | 研究管理システム` };
  } catch {
    return { title: "投資家詳細 | 研究管理システム" };
  }
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvestorDetailPage({ params }: PageProps) {
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
        href="/investors"
        className="inline-flex items-center gap-1 text-[#0017C1] text-sm hover:underline mb-4 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        一覧へ戻る
      </Link>

      {/* ページヘッダー */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-[#1A1A1C] flex items-center gap-2">
          <Users size={28} aria-hidden="true" />
          {investor.name}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/investors/${id}/edit`}
            className="inline-flex items-center justify-center gap-1 h-9 px-4 text-sm font-bold rounded-md border-2 border-[#0017C1] text-[#0017C1] bg-white hover:bg-[#E6E8FB] transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]"
          >
            <Pencil size={14} aria-hidden="true" />
            編集
          </Link>
          <DeleteButton id={investor.id} name={investor.name} redirectTo="/investors" size="sm" />
        </div>
      </div>

      {/* 詳細情報カード */}
      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-6 mb-6">
        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <Tag size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">種別</dt>
              <dd className="mt-1">
                <span className={`inline-block px-2 py-0.5 text-sm font-bold rounded-sm ${typeBadgeClass[investor.type] ?? ""}`}>
                  {typeLabel[investor.type] ?? investor.type}
                </span>
              </dd>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Phone size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">連絡先</dt>
              <dd className="text-base text-[#1A1A1C]">{investor.contact ?? "未登録"}</dd>
            </div>
          </div>
          <div className="flex items-start gap-2 md:col-span-2">
            <Briefcase size={18} className="text-[#595959] mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <dt className="text-sm text-[#595959]">投資分野</dt>
              <dd className="text-base text-[#1A1A1C]">{investor.investment_field ?? "未登録"}</dd>
            </div>
          </div>
        </dl>
      </div>

      {/* 関連する研究機関 */}
      <AssociationSection
        sectionId="institutions-heading"
        title="関連する研究機関"
        parentId={investor.id}
        parentIdColumn="investor_id"
        relatedIdColumn="institution_id"
        associationTable="institution_investors"
        entityTable="institutions"
        displayColumn="name"
        detailPath="/institutions"
        selectorTitle="研究機関を追加"
      />

      {/* 関連する研究テーマ */}
      <AssociationSection
        sectionId="themes-heading"
        title="関連する研究テーマ"
        parentId={investor.id}
        parentIdColumn="investor_id"
        relatedIdColumn="theme_id"
        associationTable="theme_investors"
        entityTable="research_themes"
        displayColumn="title"
        badgeColumn="field"
        detailPath="/themes"
        selectorTitle="研究テーマを追加"
      />
    </div>
  );
}
