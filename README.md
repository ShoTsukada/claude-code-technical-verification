# 研究管理システム

研究機関・研究テーマ・投資家を一元管理し、エンティティ間の関連付けとフィードバック収集を提供する Web アプリです。

**技術スタック**: Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · Supabase

## 機能

- **研究機関 / 研究テーマ / 投資家** の CRUD（一覧・登録・編集・削除）
- エンティティ間の **関連付け管理**（機関 ↔ テーマ ↔ 投資家）
- 全画面共通の **フィードバック投稿**（スコア・カテゴリ付き）
- 管理者向け **フィードバックダッシュボード**（集計グラフ・ステータス管理）

## セットアップ

```bash
npm install
```

`.env.local` に Supabase の接続情報を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## コマンド

```bash
npm run dev      # 開発サーバー起動 (http://localhost:3000)
npm run build    # 本番ビルド
npm run start    # 本番サーバー起動
npm run lint     # ESLint 実行
```

## 画面一覧

| パス | 説明 |
|---|---|
| `/institutions` | 研究機関一覧・検索 |
| `/institutions/[id]` | 詳細・関連テーマ/投資家の管理 |
| `/themes` | 研究テーマ一覧・分野フィルタ |
| `/investors` | 投資家一覧・種別フィルタ |
| `/feedback` | 自分の投稿フィードバック一覧 |
| `/admin/feedback` | 集計ダッシュボード・ステータス管理 |
