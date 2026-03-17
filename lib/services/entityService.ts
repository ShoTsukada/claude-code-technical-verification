import { supabase } from "../supabase";
import {
  Entity,
  EntityTable,
  Institution,
  ResearchTheme,
  Investor,
  ListOptions,
  PaginatedResult,
  ServiceError,
} from "../types";

// Supabase エラーをサービスエラーに変換
function toServiceError(error: { message: string; code?: string }): ServiceError {
  return new ServiceError(error.message, error.code);
}

// 検索キーワード列の解決（テーブルごとに主要フィールドが異なる）
function getSearchColumn(table: EntityTable): string {
  if (table === "research_themes") return "title";
  return "name";
}

// 一覧取得（ページネーション・キーワード検索・フィールドフィルタ対応）
export async function listEntities<T extends Entity>(
  table: EntityTable,
  options: ListOptions
): Promise<PaginatedResult<T>> {
  const { page, pageSize, keyword, field, investorType } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from(table).select("*", { count: "exact" });

  // キーワード部分一致検索
  if (keyword) {
    const col = getSearchColumn(table);
    query = query.ilike(col, `%${keyword}%`);
  }

  // 研究テーマ：分野フィルタ
  if (field && table === "research_themes") {
    query = query.eq("field", field);
  }

  // 投資家：種別フィルタ
  if (investorType && table === "investors") {
    query = query.eq("type", investorType);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, error, count } = await query;

  if (error) throw toServiceError(error);

  return {
    data: (data ?? []) as T[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

// 単件取得
export async function getEntity<T extends Entity>(
  table: EntityTable,
  id: string
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw toServiceError(error);
  return data as T;
}

// 登録
export async function createEntity<T extends Entity>(
  table: EntityTable,
  input: Omit<T, "id" | "created_at">
): Promise<T> {
  // 必須フィールド空チェック
  validateRequiredFields(table, input);

  const { data, error } = await supabase
    .from(table)
    .insert(input)
    .select()
    .single();

  if (error) throw toServiceError(error);
  return data as T;
}

// 更新
export async function updateEntity<T extends Entity>(
  table: EntityTable,
  id: string,
  input: Partial<Omit<T, "id" | "created_at">>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) throw toServiceError(error);
  return data as T;
}

// 削除（ON DELETE CASCADE で中間テーブルも自動削除）
export async function deleteEntity(
  table: EntityTable,
  id: string
): Promise<void> {
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw toServiceError(error);
}

// 必須フィールドの空チェック（サービス層境界で検証）
function validateRequiredFields(
  table: EntityTable,
  input: Record<string, unknown>
): void {
  const requiredMap: Record<EntityTable, string[]> = {
    institutions: ["name"],
    research_themes: ["title", "field"],
    investors: ["name", "type"],
  };

  for (const field of requiredMap[table]) {
    const value = input[field];
    if (!value || (typeof value === "string" && value.trim() === "")) {
      throw new ServiceError(`${field} は必須です`, "VALIDATION_ERROR");
    }
  }
}

// 研究機関の型ガード
export function isInstitution(entity: Entity): entity is Institution {
  return "location" in entity && "founded_year" in entity;
}

// 研究テーマの型ガード
export function isResearchTheme(entity: Entity): entity is ResearchTheme {
  return "title" in entity && "field" in entity;
}

// 投資家の型ガード
export function isInvestor(entity: Entity): entity is Investor {
  return "type" in entity && "investment_field" in entity;
}
