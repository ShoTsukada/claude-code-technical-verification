# Research & Design Decisions

---
**Purpose**: Capture discovery findings, architectural investigations, and rationale that inform the technical design.

---

## Summary
- **Feature**: `research-management`
- **Discovery Scope**: New Feature（既存の Next.js + Supabase スターターへの全機能追加）
- **Key Findings**:
  - Next.js App Router の Server/Client Component 分離が既存コード（`app/tests/page.tsx`）で確立済み。同パターンを踏襲する。
  - Supabase クライアントが `lib/supabase.ts` で初期化済み。全テーブル操作はこのシングルトンを経由する。
  - フィードバック集計グラフは外部チャートライブラリが必要。軽量な Recharts（Next.js 対応）を採用する。

---

## Research Log

### 既存コードパターンの分析
- **Context**: 設計が既存実装と整合するよう、現行コードの構造を確認した。
- **Sources Consulted**: `app/tests/page.tsx`、`lib/supabase.ts`、CLAUDE.md
- **Findings**:
  - データ取得は `useEffect` + `useState` + Supabase JS Client の直接呼び出しパターン。
  - フォームバリデーションはクライアントサイドのインライン実装。
  - エラー表示はインライン `div`（赤背景）でフィードバック。
  - `"use client"` ディレクティブでクライアントコンポーネントを明示。
  - スタイルは Tailwind CSS 4.x のユーティリティクラスのみ。設定ファイルなし。
- **Implications**: 新規コンポーネントも同一パターンに従う。Server Component はデータ初期フェッチに使い、インタラクションが必要な部分を Client Component に分離する。

### チャートライブラリ選定
- **Context**: フィードバック集計ダッシュボードにグラフ表示（要件 8.2）が必要。
- **Sources Consulted**: npm registry、Next.js 公式ドキュメント
- **Findings**:
  - **Recharts**: React ネイティブ、Server Component 非対応（Client Component 限定）、バンドルサイズ中程度（~200KB gzip）、Next.js での実績多数。
  - **Chart.js + react-chartjs-2**: 同様に Client Component 限定。設定が冗長。
  - **Tremor**: Tailwind ベース、UI コンポーネントも含む。過剰。
- **Implications**: Recharts を採用。ダッシュボードページ全体を `"use client"` にする。

### Supabase 多対多リレーション設計
- **Context**: 3エンティティ間の多対多関係（要件 4）を Supabase/PostgreSQL で実現する方法を検討。
- **Sources Consulted**: Supabase 公式ドキュメント（Joins and Nesting）
- **Findings**:
  - 中間テーブル方式（junction table）が PostgreSQL の標準アプローチ。
  - Supabase JS Client の `.select("*, related_table(*)")` で JOIN 取得可能。
  - `UNIQUE(col_a, col_b)` 制約をDBレベルで設定することで重複関連付けを防止できる（要件 4.5）。
- **Implications**: 3本の中間テーブル（`institution_themes`、`institution_investors`、`theme_investors`）を作成。重複はDB制約＋アプリ側エラーハンドリングで二重対応。

### ページネーション戦略
- **Context**: 要件 1.3, 2.3, 3.3 でページネーション付き一覧が必要。
- **Findings**:
  - Supabase の `.range(from, to)` でサーバーサイドページネーション実現可能。
  - URL クエリパラメータ（`?page=2`）で状態管理するとブラウザ履歴と整合。
- **Implications**: ページ番号を URL searchParams で管理。Server Component でデータ取得。

---

## Architecture Pattern Evaluation

| Option | Description | Strengths | Risks / Limitations | Notes |
|--------|-------------|-----------|---------------------|-------|
| Pure Client Component | 全画面を `"use client"` で実装 | 既存コードとの完全一致 | 初期表示が遅い、SEO 不利 | 小規模なら許容範囲 |
| Server + Client Component 混在 | データ取得を Server Component、インタラクションを Client Component に分離 | パフォーマンス最適、Next.js 推奨 | コンポーネント境界の設計が必要 | **採用** |
| Route Handlers (API Routes) | DB 操作を `/api/*` エンドポイントに集約 | 関心分離が明確 | 実装量が増加 | 今回は Server Actions / 直接 Supabase 呼び出しで代替 |

---

## Design Decisions

### Decision: フィードバックボタンのUI配置
- **Context**: 全画面にフィードバック投稿機能を常時表示する（要件 7.1）
- **Alternatives Considered**:
  1. フローティングアクションボタン（右下固定）— モーダルで投稿
  2. 各ページのヘッダー内ボタン — ページ遷移で投稿フォームへ
  3. グローバルナビゲーション内リンク — 専用ページで投稿
- **Selected Approach**: フローティングアクションボタン（右下固定） + モーダルフォーム
- **Rationale**: 現在のページを離れずに投稿でき、投稿元URL・画面名の自動付与（要件 7.5）が容易。レイアウトコンポーネントに1回実装するだけで全画面対応。
- **Trade-offs**: モバイルでコンテンツと重なるリスクあり → z-index と余白で対応。
- **Follow-up**: スマートフォンでのボタン視認性を実装時に確認。

### Decision: フィードバックステータス管理をアプリ側で完結
- **Context**: 要件 8.5 で管理者がステータスを更新できる必要がある。
- **Alternatives Considered**:
  1. DB の `status` カラムを直接更新（anon key）— 簡易だが権限管理が甘い
  2. Supabase RLS（Row Level Security）でロール別アクセス制御 — 本格的だが設定複雑
- **Selected Approach**: 現フェーズでは anon key で直接更新。RLS は将来課題とする。
- **Rationale**: 本リポジトリは学習・検証目的のプロジェクトであり、認証基盤の実装は要件スコープ外。
- **Trade-offs**: セキュリティは低い → 将来的に Supabase Auth + RLS で補強。
- **Follow-up**: プロダクション化の際は RLS を必ず実装。

---

## Risks & Mitigations
- **Supabase anon key の公開** — クライアントサイドに API キーが露出するが、これは Supabase の設計上の想定挙動。RLS 未設定のため本番利用は不可。学習プロジェクトとして許容。
- **Recharts の SSR 非対応** — ダッシュボードページを `"use client"` で実装することで対応。
- **多対多削除時の整合性** — エンティティ削除時に中間テーブルのレコードが残存するリスクあり。PostgreSQL の `ON DELETE CASCADE` 制約で自動削除。
- **フィードバックフォームのスパム** — 認証不要のため悪用リスクあり。現フェーズでは未対応。将来的にレートリミットまたは認証で対策。
