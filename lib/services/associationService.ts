import { supabase } from "../supabase";
import {
  AssociationTable,
  AssociationRecord,
  ServiceError,
} from "../types";

// Supabase エラーをサービスエラーに変換
// PostgreSQL UNIQUE 制約違反（23505）は専用メッセージに変換
function toServiceError(error: { message: string; code?: string }): ServiceError {
  if (error.code === "23505") {
    return new ServiceError("すでに関連付けられています", "DUPLICATE_ASSOCIATION");
  }
  return new ServiceError(error.message, error.code);
}

// 指定エンティティに紐づく関連付け一覧取得
export async function listAssociations(
  table: AssociationTable,
  column: string,
  entityId: string
): Promise<AssociationRecord[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(column, entityId)
    .order("created_at", { ascending: false });

  if (error) throw toServiceError(error);
  return (data ?? []) as AssociationRecord[];
}

// 関連付けの追加
export async function addAssociation(
  table: AssociationTable,
  payload: Omit<AssociationRecord, "id" | "created_at">
): Promise<void> {
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw toServiceError(error);
}

// 関連付けの削除（本体エンティティには影響しない）
export async function removeAssociation(
  table: AssociationTable,
  id: string
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw toServiceError(error);
}

// 関連付け先エンティティを JOIN して取得するヘルパー
// 研究機関 → 研究テーマ一覧
export async function listThemesByInstitution(institutionId: string) {
  const { data, error } = await supabase
    .from("institution_themes")
    .select("id, theme_id, research_themes(*)")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, error.code);
  return data ?? [];
}

// 研究機関 → 投資家一覧
export async function listInvestorsByInstitution(institutionId: string) {
  const { data, error } = await supabase
    .from("institution_investors")
    .select("id, investor_id, investors(*)")
    .eq("institution_id", institutionId)
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, error.code);
  return data ?? [];
}

// 研究テーマ → 研究機関一覧
export async function listInstitutionsByTheme(themeId: string) {
  const { data, error } = await supabase
    .from("institution_themes")
    .select("id, institution_id, institutions(*)")
    .eq("theme_id", themeId)
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, error.code);
  return data ?? [];
}

// 研究テーマ → 投資家一覧
export async function listInvestorsByTheme(themeId: string) {
  const { data, error } = await supabase
    .from("theme_investors")
    .select("id, investor_id, investors(*)")
    .eq("theme_id", themeId)
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, error.code);
  return data ?? [];
}

// 投資家 → 研究機関一覧
export async function listInstitutionsByInvestor(investorId: string) {
  const { data, error } = await supabase
    .from("institution_investors")
    .select("id, institution_id, institutions(*)")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, error.code);
  return data ?? [];
}

// 投資家 → 研究テーマ一覧
export async function listThemesByInvestor(investorId: string) {
  const { data, error } = await supabase
    .from("theme_investors")
    .select("id, theme_id, research_themes(*)")
    .eq("investor_id", investorId)
    .order("created_at", { ascending: false });

  if (error) throw new ServiceError(error.message, error.code);
  return data ?? [];
}
