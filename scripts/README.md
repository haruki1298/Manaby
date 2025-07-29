# Supabaseデータインポートスクリプト

## 📋 概要

このスクリプトは、ManabyアプリのSupabaseデータベースにサンプルデータをインポートするためのNode.jsスクリプトです。

## 🔧 セットアップ

### 1. 環境変数の設定

`.env`ファイルに以下の環境変数を追加してください：

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_API_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**重要:** `SUPABASE_SERVICE_ROLE_KEY`はSupabaseダッシュボードの「Settings > API」から取得してください。

### 2. 依存関係のインストール

```bash
npm install
```

## 🚀 使用方法

### サンプルデータをインポート

```bash
npm run import-sample
```

### 既存データをクリアしてからインポート

```bash
npm run import-sample:clear
```

## 📊 インポートされるデータ

### Notes（ノート）
- Welcome to Manaby（公開ノート）
- プロジェクト計画（非公開ノート）
- 技術仕様書（公開ノート）

### Comments（コメント）
- 各ノートに対するサンプルコメント

## ⚠️ 注意事項

1. **Service Role Key**: このスクリプトはSupabaseのService Role Keyを使用するため、RLS（Row Level Security）をバイパスできます。本番環境では十分注意してください。

2. **データのクリア**: `--clear`オプションを使用すると、既存のすべてのノート、コメント、共同編集者データが削除されます。

3. **システムユーザー**: インポートされるデータは特別なシステムユーザーID (`00000000-0000-0000-0000-000000000000`) で作成されます。

## 🔍 トラブルシューティング

### エラー: 環境変数が設定されていません
- `.env`ファイルに必要な環境変数がすべて設定されているか確認してください

### エラー: 認証に失敗しました
- `SUPABASE_SERVICE_ROLE_KEY`が正しく設定されているか確認してください
- Supabaseプロジェクトのダッシュボードで確認できます

### エラー: テーブルが存在しません
- Supabaseでテーブルが正しく作成されているか確認してください
- `database.types.ts`と実際のテーブル構造が一致しているか確認してください

## 📝 スクリプトのカスタマイズ

`scripts/importSample.mjs`を編集して、独自のサンプルデータを追加できます：

```javascript
const sampleNotes = [
  {
    title: 'あなたのカスタムノート',
    content: JSON.stringify([/* BlockNote形式のコンテンツ */]),
    is_public: true,
    creator_name: 'Custom User',
    user_id: '00000000-0000-0000-0000-000000000000'
  }
  // 他のノートを追加...
];
```

## 🔗 関連リンク

- [Supabase Documentation](https://supabase.com/docs)
- [BlockNote Documentation](https://www.blocknotejs.org/)
- [Node.js ES Modules](https://nodejs.org/api/esm.html)
