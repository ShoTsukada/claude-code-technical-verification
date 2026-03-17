# Requirements Document

## Project Description (Input)
研究機関、研究テーマ、投資家の登録、関連付けを行うWebアプリ。各画面にコメント・レビュー機能を追加し、改善要望・不具合等を登録できるようにする。登録されたコメント・レビューを集計する画面も追加する。

## Introduction
本アプリケーションは、研究機関・研究テーマ・投資家の3種類のエンティティをそれぞれ登録・管理し、相互の関連付けを通じて研究エコシステムの全体像を把握できるWebアプリケーションである。管理者が各エンティティのCRUD操作と関連付け操作をブラウザから行えることを目的とする。加えて、利用者が各画面からフィードバック（改善要望・不具合報告等）を投稿できるコメント・レビュー機能と、投稿されたフィードバックを集計・分析するダッシュボード画面を提供する。

---

## Requirements

### Requirement 1: 研究機関管理

**Objective:** 管理者として、研究機関の情報を登録・閲覧・編集・削除したい。それにより、研究に関わる組織の情報を一元管理できるようにする。

#### Acceptance Criteria

1. When 管理者が研究機関登録フォームに名称・所在地・設立年・概要を入力して送信する, the Research Management App shall 入力値を検証し、バリデーション通過後にデータベースへ保存して一覧画面へ遷移する
2. If 必須項目（名称）が空の状態で送信される, then the Research Management App shall 該当フィールドにエラーメッセージを表示し、送信を中断する
3. The Research Management App shall 登録済み研究機関の一覧をページネーション付きで表示する
4. When 管理者が一覧から研究機関を選択する, the Research Management App shall 詳細情報と関連付けられた研究テーマ・投資家の一覧を表示する
5. When 管理者が研究機関の編集フォームを送信する, the Research Management App shall 更新内容を検証してデータベースを更新し、詳細画面へ遷移する
6. When 管理者が研究機関の削除を確認する, the Research Management App shall 当該研究機関および関連付けレコードを削除する

---

### Requirement 2: 研究テーマ管理

**Objective:** 管理者として、研究テーマの情報を登録・閲覧・編集・削除したい。それにより、研究内容を体系的に分類・管理できるようにする。

#### Acceptance Criteria

1. When 管理者が研究テーマ登録フォームにタイトル・分野・説明・開始年を入力して送信する, the Research Management App shall 入力値を検証し、バリデーション通過後にデータベースへ保存して一覧画面へ遷移する
2. If 必須項目（タイトル・分野）が空の状態で送信される, then the Research Management App shall 該当フィールドにエラーメッセージを表示し、送信を中断する
3. The Research Management App shall 登録済み研究テーマの一覧をページネーション付きで表示する
4. When 管理者が一覧から研究テーマを選択する, the Research Management App shall 詳細情報と関連付けられた研究機関・投資家の一覧を表示する
5. When 管理者が研究テーマの編集フォームを送信する, the Research Management App shall 更新内容を検証してデータベースを更新し、詳細画面へ遷移する
6. When 管理者が研究テーマの削除を確認する, the Research Management App shall 当該研究テーマおよび関連付けレコードを削除する

---

### Requirement 3: 投資家管理

**Objective:** 管理者として、投資家の情報を登録・閲覧・編集・削除したい。それにより、研究への出資者情報を一元管理できるようにする。

#### Acceptance Criteria

1. When 管理者が投資家登録フォームに氏名/組織名・種別（個人/法人）・連絡先・投資分野を入力して送信する, the Research Management App shall 入力値を検証し、バリデーション通過後にデータベースへ保存して一覧画面へ遷移する
2. If 必須項目（氏名/組織名・種別）が空の状態で送信される, then the Research Management App shall 該当フィールドにエラーメッセージを表示し、送信を中断する
3. The Research Management App shall 登録済み投資家の一覧をページネーション付きで表示する
4. When 管理者が一覧から投資家を選択する, the Research Management App shall 詳細情報と関連付けられた研究機関・研究テーマの一覧を表示する
5. When 管理者が投資家の編集フォームを送信する, the Research Management App shall 更新内容を検証してデータベースを更新し、詳細画面へ遷移する
6. When 管理者が投資家の削除を確認する, the Research Management App shall 当該投資家および関連付けレコードを削除する

---

### Requirement 4: エンティティ間の関連付け管理

**Objective:** 管理者として、研究機関・研究テーマ・投資家を相互に関連付けたい。それにより、「どの研究機関がどのテーマに取り組み、どの投資家が支援しているか」という関係を可視化できるようにする。

#### Acceptance Criteria

1. When 管理者が研究機関の詳細画面で研究テーマの関連付けを追加する, the Research Management App shall 既存の研究テーマ一覧から選択させ、選択後に関連付けをデータベースへ保存する
2. When 管理者が研究機関の詳細画面で投資家の関連付けを追加する, the Research Management App shall 既存の投資家一覧から選択させ、選択後に関連付けをデータベースへ保存する
3. When 管理者が研究テーマの詳細画面で投資家の関連付けを追加する, the Research Management App shall 既存の投資家一覧から選択させ、選択後に関連付けをデータベースへ保存する
4. When 管理者が既存の関連付けを削除する, the Research Management App shall 確認ダイアログを表示し、確認後に関連付けレコードのみを削除する（本体データは削除しない）
5. If 同一ペアの関連付けが既に存在する状態で追加が試みられる, then the Research Management App shall 重複エラーメッセージを表示し、保存を中断する
6. The Research Management App shall 各エンティティの詳細画面に、関連付けられた全エンティティのリストをカード形式で表示する

---

### Requirement 5: 検索・フィルタリング

**Objective:** 管理者として、各エンティティ一覧をキーワードや条件で絞り込みたい。それにより、大量のデータから目的のレコードを素早く見つけられるようにする。

#### Acceptance Criteria

1. When 管理者が一覧画面の検索ボックスにキーワードを入力する, the Research Management App shall 名称・タイトル等の主要フィールドに対して部分一致検索を実行し、結果を即時更新する
2. When 管理者が研究テーマ一覧で分野フィルタを選択する, the Research Management App shall 選択した分野に属する研究テーマのみを表示する
3. When 管理者が投資家一覧で種別フィルタ（個人/法人）を選択する, the Research Management App shall 選択した種別の投資家のみを表示する
4. If 検索・フィルタの結果が0件である, then the Research Management App shall 「該当するデータがありません」等のメッセージを表示する
5. The Research Management App shall 検索条件とフィルタ条件を組み合わせて適用できる

---

### Requirement 6: ナビゲーションとUI共通要件

**Objective:** 管理者として、3種類のエンティティ管理画面へ直感的に移動したい。それにより、操作効率を向上させる。

#### Acceptance Criteria

1. The Research Management App shall グローバルナビゲーションに「研究機関」「研究テーマ」「投資家」「フィードバック」へのリンクを常時表示する
2. The Research Management App shall 各操作（登録・更新・削除・関連付け追加・削除）の成功・失敗をトースト通知またはインラインメッセージでフィードバックする
3. While データ取得中である, the Research Management App shall ローディングインジケーターを表示する
4. If サーバーまたはデータベースへの接続が失敗する, then the Research Management App shall エラーメッセージを表示し、再試行ボタンを提供する
5. The Research Management App shall モバイルおよびデスクトップの両画面サイズでレイアウトが崩れずに表示される（レスポンシブデザイン）

---

### Requirement 7: コメント・レビュー投稿機能

**Objective:** 利用者として、各画面からフィードバック（改善要望・不具合報告・その他コメント）を投稿したい。それにより、アプリの改善に貢献できるようにする。

#### Acceptance Criteria

1. The Research Management App shall アプリ内のすべての画面（研究機関・研究テーマ・投資家の一覧・詳細・登録・編集画面）にフィードバック投稿ボタンまたはフォームを常時表示する
2. When 利用者がフィードバック投稿フォームにカテゴリ・タイトル・内容を入力して送信する, the Research Management App shall 入力値を検証し、バリデーション通過後にデータベースへ保存して完了メッセージを表示する
3. If 必須項目（カテゴリ・タイトル・内容）が空の状態で送信される, then the Research Management App shall 該当フィールドにエラーメッセージを表示し、送信を中断する
4. The Research Management App shall フィードバックのカテゴリとして「改善要望」「不具合報告」「その他」を選択肢として提供する
5. When 利用者がフィードバックを投稿する, the Research Management App shall 投稿元の画面URL・画面名をフィードバックレコードに自動付与して保存する
6. Where 利用者が任意で評価スコア（1〜5の星評価）を入力する機能が含まれる, the Research Management App shall スコアをフィードバックレコードに保存する
7. The Research Management App shall 投稿済みフィードバックの一覧を投稿者向けに確認できる画面を提供する

---

### Requirement 8: フィードバック集計・ダッシュボード

**Objective:** 管理者として、投稿されたフィードバックを一元的に閲覧・集計・分析したい。それにより、改善優先度の判断と対応状況の管理ができるようにする。

#### Acceptance Criteria

1. The Research Management App shall フィードバック集計ダッシュボード画面に、総投稿件数・カテゴリ別件数・平均スコアをサマリーカードとして表示する
2. The Research Management App shall ダッシュボードにカテゴリ別・画面別の投稿件数を棒グラフまたは円グラフで可視化する
3. The Research Management App shall フィードバック一覧をカテゴリ・ステータス・投稿日時・画面名でフィルタリングおよびソートできる
4. When 管理者がフィードバック一覧から1件を選択する, the Research Management App shall 投稿内容・カテゴリ・スコア・投稿元画面・投稿日時の詳細を表示する
5. When 管理者がフィードバックのステータスを更新する, the Research Management App shall ステータス（未対応・対応中・対応済み・却下）を保存し、一覧に反映する
6. When 管理者がフィードバックに対応コメントを入力して保存する, the Research Management App shall 対応コメントをフィードバックレコードに紐付けて保存する
7. If フィードバックが0件である, then the Research Management App shall 「フィードバックはまだありません」等のメッセージを表示する
8. The Research Management App shall ダッシュボードの集計データを最新状態に更新するリフレッシュ機能を提供する
