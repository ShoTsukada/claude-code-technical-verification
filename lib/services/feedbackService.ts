import { supabase } from "../supabase";
import {
  Feedback,
  FeedbackCategory,
  FeedbackCreateInput,
  FeedbackListOptions,
  FeedbackSummary,
  PaginatedResult,
  ServiceError,
} from "../types";

// Supabase エラーをサービスエラーに変換
function toServiceError(error: { message: string; code?: string }): ServiceError {
  return new ServiceError(error.message, error.code);
}

// フィードバック投稿
export async function submitFeedback(input: FeedbackCreateInput): Promise<Feedback> {
  // スコア範囲バリデーション（1〜5）
  if (input.score !== undefined && (input.score < 1 || input.score > 5)) {
    throw new ServiceError("スコアは1〜5の範囲で入力してください", "VALIDATION_ERROR");
  }

  const { data, error } = await supabase
    .from("feedbacks")
    .insert({
      category: input.category,
      title: input.title,
      content: input.content,
      score: input.score ?? null,
      source_url: input.source_url,
      source_page: input.source_page,
      status: "pending",
    })
    .select()
    .single();

  if (error) throw toServiceError(error);
  return data as Feedback;
}

// フィードバック一覧取得（フィルタ・ソート・ページネーション対応）
export async function listFeedbacks(
  options: FeedbackListOptions
): Promise<PaginatedResult<Feedback>> {
  const {
    category,
    status,
    source_page,
    keyword,
    sortBy = "created_at",
    sortOrder = "desc",
    page,
    pageSize,
  } = options;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase.from("feedbacks").select("*", { count: "exact" });

  if (category) query = query.eq("category", category);
  if (status) query = query.eq("status", status);
  if (source_page) query = query.eq("source_page", source_page);
  if (keyword) query = query.ilike("title", `%${keyword}%`);

  query = query
    .order(sortBy, { ascending: sortOrder === "asc" })
    .range(from, to);

  const { data, error, count } = await query;

  if (error) throw toServiceError(error);

  return {
    data: (data ?? []) as Feedback[],
    total: count ?? 0,
    page,
    pageSize,
  };
}

// フィードバック単件取得
export async function getFeedback(id: string): Promise<Feedback> {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw toServiceError(error);
  return data as Feedback;
}

// ステータス更新（対応コメント任意）
export async function updateFeedbackStatus(
  id: string,
  status: Feedback["status"],
  adminComment?: string
): Promise<void> {
  const payload: Partial<Feedback> = { status };
  if (adminComment !== undefined) payload.admin_comment = adminComment;

  const { error } = await supabase
    .from("feedbacks")
    .update(payload)
    .eq("id", id);

  if (error) throw toServiceError(error);
}

// 集計データ取得（総件数・カテゴリ別・画面別・平均スコア）
export async function getFeedbackSummary(): Promise<FeedbackSummary> {
  const { data, error } = await supabase
    .from("feedbacks")
    .select("category, source_page, score");

  if (error) throw toServiceError(error);

  const rows = data ?? [];

  // カテゴリ別件数
  const byCategory: Record<FeedbackCategory, number> = {
    improvement: 0,
    bug: 0,
    other: 0,
  };
  // 画面別件数
  const byPage: Record<string, number> = {};
  // スコア集計用
  let scoreSum = 0;
  let scoreCount = 0;

  for (const row of rows) {
    // カテゴリ別
    const cat = row.category as FeedbackCategory;
    if (cat in byCategory) byCategory[cat]++;

    // 画面別
    const page = row.source_page as string;
    byPage[page] = (byPage[page] ?? 0) + 1;

    // スコア
    if (row.score !== null && typeof row.score === "number") {
      scoreSum += row.score;
      scoreCount++;
    }
  }

  return {
    total: rows.length,
    byCategory,
    byPage,
    averageScore: scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : null,
  };
}
