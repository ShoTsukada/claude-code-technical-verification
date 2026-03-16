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

## コーディング規約

- ファイル内のコメントはすべて日本語で記述する
