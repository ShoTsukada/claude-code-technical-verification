# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

研究機関・研究テーマ・投資家を管理し、エンティティ間の関連付けとフィードバック収集を提供する Next.js 16 + Supabase の Web アプリ。

## コマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド（型チェックも実行される）
npm run lint     # ESLint 実行
```

テスト設定は未導入。追加する場合は Vitest + Testing Library を推奨。

## アーキテクチャ

### レイヤー構成

```
app/                   # Next.js App Router（ルーティング・UI）
  layout.tsx           # ルートレイアウト：ToastProvider → GlobalNav + main + FeedbackButton + ToastContainer
  components/          # 全画面共通コンポーネント
  contexts/            # React Context（ToastContext）
  institutions/        # 研究機関ルート群
  themes/              # 研究テーマルート群
  investors/           # 投資家ルート群
  feedback/            # 投稿者向けフィードバック一覧
  admin/feedback/      # 管理者向けダッシュボード
lib/
  supabase.ts          # Supabase クライアント（シングルトン）
  types.ts             # 全型定義（エンティティ・中間テーブル・フィードバック・ServiceError）
  services/
    entityService.ts       # Institution / ResearchTheme / Investor の CRUD
    associationService.ts  # 中間テーブル（institution_themes 等）の CRUD
    feedbackService.ts     # フィードバック投稿・一覧・集計
```

### Server Component vs Client Component

- **一覧・詳細ページ**（`institutions/page.tsx` 等）は Server Component。`listEntities()` / `getEntity()` を直接 `await` して props に渡す。
- **フォーム・削除ボタン・関連付けセクション**（`_components/` 配下）はすべて `"use client"`。
- `searchParams` は Next.js 16 で `Promise<{...}>` 型になるため `await` が必要。

### 共通コンポーネントのパターン

| コンポーネント | 役割 |
|---|---|
| `SearchFilterBar` | URL searchParams でキーワード・フィルタを管理（300ms デバウンス、page を 1 リセット） |
| `Pagination` | URL searchParams ベースのページ遷移 |
| `AssociationSection` | 関連付け一覧の表示・追加・解除を自己完結で管理。`associationTable` / `parentIdColumn` / `relatedIdColumn` / `entityTable` の 4 props でどのエンティティペアにも対応 |
| `AssociationSelector` | モーダル検索セレクタ。親側で `{selectorOpen && <AssociationSelector />}` の条件レンダリングにより、閉じ時のアンマウントで state が自動リセットされる |
| `ConfirmDialog` | `aria-modal`, Escape キー対応の削除確認ダイアログ |
| `FeedbackButton` | 全画面固定のフローティングボタン。`usePathname()` と `document.title` を自動取得 |

### サービス層の規約

- Supabase エラーは `ServiceError` クラスに変換して throw。呼び出し元は `instanceof ServiceError` で判定。
- 重複関連付け（PostgreSQL error code `23505`）は `ServiceError("すでに関連付けられています", "DUPLICATE_ASSOCIATION")` として返す。
- フィードバックのスコアは 1〜5 の範囲チェックをサービス層で行う。

## データベーススキーマ

| テーブル | 概要 |
|---|---|
| `institutions` | 研究機関（name, location, founded_year, description） |
| `research_themes` | 研究テーマ（title, field, description, start_year） |
| `investors` | 投資家（name, type: `individual\|corporate`, contact, investment_field） |
| `institution_themes` | 研究機関 ↔ 研究テーマ（UNIQUE + CASCADE） |
| `institution_investors` | 研究機関 ↔ 投資家（UNIQUE + CASCADE） |
| `theme_investors` | 研究テーマ ↔ 投資家（UNIQUE + CASCADE） |
| `feedbacks` | フィードバック（category, title, content, score 1-5, source_url, source_page, status, admin_comment） |

## スタイル規約

- **Tailwind CSS 4.x**: `tailwind.config.*` 不要。`postcss.config.mjs` の `@tailwindcss/postcss` 経由。カスタムトークンは `app/globals.css` の `@theme` ブロックで定義。
- **デザインシステム**: デジタル庁デザインシステム（DADS）準拠。行政ブルー `#0017C1`、フォーカスリングは `focus-visible:bg-[#FFD700] focus-visible:ring-2 focus-visible:ring-[#1A1A1C]`。
- **フォント**: Noto Sans JP（400/700）、`--font-noto-sans-jp` 変数経由。
- ファイル内のコメントはすべて日本語で記述する。

## Supabase 連携

- クライアント: `lib/supabase.ts`（環境変数 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`）
- 接続先プロジェクト: `tyngthitmwazseosvums.supabase.co`

## ルート一覧

| パス | Server/Client | 説明 |
|---|---|---|
| `/institutions` | Server | 研究機関一覧（keyword 検索・ページネーション） |
| `/institutions/new` | Server + Client Form | 研究機関登録 |
| `/institutions/[id]` | Server | 詳細（AssociationSection で関連テーマ・投資家） |
| `/institutions/[id]/edit` | Server + Client Form | 編集 |
| `/themes` | Server | 研究テーマ一覧（field フィルタ・検索） |
| `/themes/[id]` | Server | 詳細（AssociationSection で関連機関・投資家） |
| `/investors` | Server | 投資家一覧（type フィルタ・検索） |
| `/investors/[id]` | Server | 詳細（AssociationSection で関連機関・テーマ） |
| `/feedback` | Client | 投稿者向けフィードバック一覧 |
| `/admin/feedback` | Client | 集計ダッシュボード（Recharts）+ ステータス管理 |

## 外部ライブラリの注意点

- **Recharts**: SSR 非対応のため `next/dynamic({ ssr: false })` で遅延ロード（`FeedbackCharts.tsx`）。
- **lucide-react**: アイコンはすべて `lucide-react` を使用し、絵文字は使わない。

# AI-DLC and Spec-Driven Development

Kiro-style Spec Driven Development implementation on AI-DLC (AI Development Life Cycle)

## Project Context

### Paths
- Steering: `.kiro/steering/`
- Specs: `.kiro/specs/`

### Steering vs Specification

**Steering** (`.kiro/steering/`) - Guide AI with project-wide rules and context
**Specs** (`.kiro/specs/`) - Formalize development process for individual features

### Active Specifications
- Check `.kiro/specs/` for active specifications
- Use `/kiro:spec-status [feature-name]` to check progress

## Development Guidelines
- Think in English, generate responses in Japanese. All Markdown content written to project files (e.g., requirements.md, design.md, tasks.md, research.md, validation reports) MUST be written in the target language configured for this specification (see spec.json.language).

## Minimal Workflow
- Phase 0 (optional): `/kiro:steering`, `/kiro:steering-custom`
- Phase 1 (Specification):
  - `/kiro:spec-init "description"`
  - `/kiro:spec-requirements {feature}`
  - `/kiro:validate-gap {feature}` (optional: for existing codebase)
  - `/kiro:spec-design {feature} [-y]`
  - `/kiro:validate-design {feature}` (optional: design review)
  - `/kiro:spec-tasks {feature} [-y]`
- Phase 2 (Implementation): `/kiro:spec-impl {feature} [tasks]`
  - `/kiro:validate-impl {feature}` (optional: after implementation)
- Progress check: `/kiro:spec-status {feature}` (use anytime)

## Development Rules
- 3-phase approval workflow: Requirements → Design → Tasks → Implementation
- Human review required each phase; use `-y` only for intentional fast-track
- Keep steering current and verify alignment with `/kiro:spec-status`
- Follow the user's instructions precisely, and within that scope act autonomously: gather the necessary context and complete the requested work end-to-end in this run, asking questions only when essential information is missing or the instructions are critically ambiguous.

## Steering Configuration
- Load entire `.kiro/steering/` as project memory
- Default files: `product.md`, `tech.md`, `structure.md`
- Custom files are supported (managed via `/kiro:steering-custom`)
