# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 のスターターアプリ。`create-next-app` で生成されたベースから機能を追加していくプロジェクト。

## コマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint 実行
```

## アーキテクチャ

- **ルーティング**: Next.js App Router (`app/` ディレクトリ)
- **エントリーポイント**: `app/layout.tsx`（ルートレイアウト・フォント設定）→ `app/page.tsx`（ホームページ）
- **スタイル**: Tailwind CSS 4.x (`app/globals.css`、PostCSS 経由)
- **フォント**: Geist / Geist Mono（`next/font/google` で最適化）

## 重要な注意事項

### Tailwind CSS 4.x
Tailwind CSS 4.x は設定ファイル（`tailwind.config.*`）が不要。`postcss.config.mjs` の `@tailwindcss/postcss` プラグイン経由で動作する。カスタムテーマは `globals.css` 内の `@theme` ブロックで定義する。

### Next.js App Router
`app/` 配下のファイルはデフォルトで Server Component。クライアント側の状態・イベントが必要なコンポーネントは先頭に `"use client"` を付ける。

## Supabase 連携

- クライアント: `lib/supabase.ts`（`@supabase/supabase-js` で初期化済み）
- 接続先: `tyngthitmwazseosvums.supabase.co`
- 使用例: `app/tests/page.tsx` — `tests` テーブルに対して SELECT / UPDATE を行う Client Component

### tests テーブルのスキーマ

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | PK |
| name | text | NOT NULL |
| description | text | nullable |
| created_at | timestamptz | |

## ルート一覧

| パス | ファイル | 説明 |
|---|---|---|
| `/` | `app/page.tsx` | ホームページ（create-next-app デフォルト） |
| `/tests` | `app/tests/page.tsx` | `tests` テーブルの一覧・インライン編集 UI |

## テスト

現時点でテスト設定は未導入。テストを追加する場合は Vitest + Testing Library を推奨（他のサブプロジェクトとの一貫性のため）。

## コーディング規約

- ファイル内のコメントはすべて日本語で記述する
