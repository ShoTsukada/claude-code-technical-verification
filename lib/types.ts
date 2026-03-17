// ===== エンティティ型 =====

export interface Institution {
  id: string;
  name: string;
  location: string | null;
  founded_year: number | null;
  description: string | null;
  created_at: string;
}

export interface ResearchTheme {
  id: string;
  title: string;
  field: string;
  description: string | null;
  start_year: number | null;
  created_at: string;
}

export interface Investor {
  id: string;
  name: string;
  type: "individual" | "corporate";
  contact: string | null;
  investment_field: string | null;
  created_at: string;
}

export type EntityTable = "institutions" | "research_themes" | "investors";
export type Entity = Institution | ResearchTheme | Investor;

// ===== 中間テーブル型 =====

export interface InstitutionTheme {
  id: string;
  institution_id: string;
  theme_id: string;
  created_at: string;
}

export interface InstitutionInvestor {
  id: string;
  institution_id: string;
  investor_id: string;
  created_at: string;
}

export interface ThemeInvestor {
  id: string;
  theme_id: string;
  investor_id: string;
  created_at: string;
}

export type AssociationTable =
  | "institution_themes"
  | "institution_investors"
  | "theme_investors";

export type AssociationRecord = InstitutionTheme | InstitutionInvestor | ThemeInvestor;

// ===== フィードバック型 =====

export type FeedbackCategory = "improvement" | "bug" | "other";
export type FeedbackStatus = "pending" | "in_progress" | "resolved" | "rejected";

export interface Feedback {
  id: string;
  category: FeedbackCategory;
  title: string;
  content: string;
  score: number | null;
  source_url: string;
  source_page: string;
  status: FeedbackStatus;
  admin_comment: string | null;
  created_at: string;
}

export interface FeedbackCreateInput {
  category: FeedbackCategory;
  title: string;
  content: string;
  score?: number;
  source_url: string;
  source_page: string;
}

export interface FeedbackListOptions {
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  source_page?: string;
  keyword?: string;
  sortBy?: "created_at" | "score";
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface FeedbackSummary {
  total: number;
  byCategory: Record<FeedbackCategory, number>;
  byPage: Record<string, number>;
  averageScore: number | null;
}

// ===== 共通型 =====

export interface ListOptions {
  page: number;
  pageSize: number;
  keyword?: string;
  field?: string;
  investorType?: "individual" | "corporate";
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// サービス層の共通エラー型
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ServiceError";
  }
}
