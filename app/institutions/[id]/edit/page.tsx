import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getEntity } from "../../../../lib/services/entityService";
import type { Institution } from "../../../../lib/types";
import InstitutionForm from "../../_components/InstitutionForm";

export const metadata = {
  title: "研究機関を編集 | 研究管理システム",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInstitutionPage({ params }: PageProps) {
  const { id } = await params;

  let institution: Institution;
  try {
    institution = await getEntity<Institution>("institutions", id);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link
        href={`/institutions/${id}`}
        className="inline-flex items-center gap-1 text-[#0017C1] text-sm hover:underline mb-4 focus-visible:outline-none focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C] rounded"
      >
        <ChevronLeft size={16} aria-hidden="true" />
        詳細へ戻る
      </Link>

      <h1 className="text-3xl font-bold text-[#1A1A1C] mb-6">研究機関を編集</h1>

      <div className="bg-white rounded-lg border border-[#EBEBEB] shadow-[var(--shadow-1)] p-6">
        <InstitutionForm defaultValues={institution} institutionId={id} />
      </div>
    </div>
  );
}
