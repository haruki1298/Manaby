import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// 環境変数を読み込み
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.log('必要な環境変数:');
  console.log('- VITE_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Service Role Keyを使用してSupabaseクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * サンプルノートデータをインポート
 */
async function importSampleNotes() {
  console.log('📝 サンプルノートをインポート中...');

  const sampleNotes = [
    {
      title: 'Welcome to Notion Clone',
      content: JSON.stringify([
        {
          id: "1",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "このNotionクローンアプリへようこそ！",
              styles: {}
            }
          ]
        },
        {
          id: "2",
          type: "heading",
          props: { level: 2 },
          content: [
            {
              type: "text",
              text: "主な機能",
              styles: {}
            }
          ]
        },
        {
          id: "3",
          type: "bulletListItem",
          content: [
            {
              type: "text",
              text: "リッチテキストエディター",
              styles: {}
            }
          ]
        },
        {
          id: "4",
          type: "bulletListItem",
          content: [
            {
              type: "text",
              text: "階層構造ノート",
              styles: {}
            }
          ]
        },
        {
          id: "5",
          type: "bulletListItem",
          content: [
            {
              type: "text",
              text: "公開・非公開設定",
              styles: {}
            }
          ]
        }
      ]),
      is_public: true,
      creator_name: 'System',
      user_id: '00000000-0000-0000-0000-000000000000' // システムユーザー
    },
    {
      title: 'プロジェクト計画',
      content: JSON.stringify([
        {
          id: "1",
          type: "heading",
          props: { level: 1 },
          content: [
            {
              type: "text",
              text: "プロジェクト計画",
              styles: {}
            }
          ]
        },
        {
          id: "2",
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "このプロジェクトの目標と計画を記載します。",
              styles: {}
            }
          ]
        }
      ]),
      is_public: false,
      creator_name: 'System',
      user_id: '00000000-0000-0000-0000-000000000000'
    },
    {
      title: '技術仕様書',
      content: JSON.stringify([
        {
          id: "1",
          type: "heading",
          props: { level: 1 },
          content: [
            {
              type: "text",
              text: "技術仕様書",
              styles: {}
            }
          ]
        },
        {
          id: "2",
          type: "heading",
          props: { level: 2 },
          content: [
            {
              type: "text",
              text: "使用技術",
              styles: {}
            }
          ]
        },
        {
          id: "3",
          type: "bulletListItem",
          content: [
            {
              type: "text",
              text: "React + TypeScript",
              styles: {}
            }
          ]
        },
        {
          id: "4",
          type: "bulletListItem",
          content: [
            {
              type: "text",
              text: "Supabase",
              styles: {}
            }
          ]
        },
        {
          id: "5",
          type: "bulletListItem",
          content: [
            {
              type: "text",
              text: "BlockNote Editor",
              styles: {}
            }
          ]
        }
      ]),
      is_public: true,
      creator_name: 'System',
      user_id: '00000000-0000-0000-0000-000000000000'
    }
  ];

  try {
    const { data, error } = await supabase
      .from('notes')
      .insert(sampleNotes)
      .select();

    if (error) {
      console.error('❌ ノートのインポートに失敗:', error);
      return false;
    }

    console.log('✅ ノートのインポート完了:', data.length, '件');
    return true;
  } catch (err) {
    console.error('❌ エラー:', err);
    return false;
  }
}

/**
 * サンプルコメントデータをインポート
 */
async function importSampleComments() {
  console.log('💬 サンプルコメントをインポート中...');

  // まず最初のノートを取得
  const { data: notes } = await supabase
    .from('notes')
    .select('id')
    .limit(1);

  if (!notes || notes.length === 0) {
    console.log('⚠️ ノートが存在しないため、コメントをスキップします');
    return true;
  }

  const noteId = notes[0].id;

  const sampleComments = [
    {
      note_id: noteId,
      user_id: '00000000-0000-0000-0000-000000000000',
      content: 'とても素晴らしいノートですね！',
      parent_comment_id: null
    },
    {
      note_id: noteId,
      user_id: '00000000-0000-0000-0000-000000000000',
      content: 'ありがとうございます！',
      parent_comment_id: null
    }
  ];

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert(sampleComments)
      .select();

    if (error) {
      console.error('❌ コメントのインポートに失敗:', error);
      return false;
    }

    console.log('✅ コメントのインポート完了:', data.length, '件');
    return true;
  } catch (err) {
    console.error('❌ エラー:', err);
    return false;
  }
}

/**
 * 既存データをクリア
 */
async function clearExistingData() {
  console.log('🗑️ 既存データをクリア中...');

  try {
    // コメントを削除（外部キー制約のため先に削除）
    await supabase.from('comments').delete().neq('id', '');
    
    // 共同編集者を削除
    await supabase.from('note_collaborators').delete().neq('id', '');
    
    // ノートを削除
    await supabase.from('notes').delete().neq('id', '');

    console.log('✅ 既存データのクリア完了');
    return true;
  } catch (err) {
    console.error('❌ データクリアエラー:', err);
    return false;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  console.log('🚀 Supabaseデータインポートを開始します\n');

  // コマンドライン引数をチェック
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear');

  try {
    // 既存データをクリア（オプション）
    if (shouldClear) {
      const cleared = await clearExistingData();
      if (!cleared) {
        process.exit(1);
      }
      console.log('');
    }

    // データをインポート
    const notesImported = await importSampleNotes();
    if (!notesImported) {
      process.exit(1);
    }

    const commentsImported = await importSampleComments();
    if (!commentsImported) {
      process.exit(1);
    }

    console.log('\n🎉 すべてのインポートが完了しました！');
    console.log('ブラウザでアプリを確認してください。');

  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
    process.exit(1);
  }
}

// スクリプト実行
main().catch(console.error);
