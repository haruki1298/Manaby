// src/components/comments/CommentForm.tsx
import React, { useState, useEffect } from 'react';
// import { useCurrentUserStore } from "@/modules/auth/current-user.state"; // ダミー版では直接使わない

interface CommentFormProps {
  onSubmit: (content: string, parentId?: string) => Promise<boolean | void>; // 投稿処理。成功したらtrueを返す想定
  parentId?: string | null; // 返信先のコメントID。トップレベル投稿ならnull/undefined
  onCancelReply?: () => void; // 返信モードをキャンセルする関数
  isSubmitting?: boolean; // 親コンポーネントが管理する投稿中のローディング状態
  // initialContent?: string; // 将来的な編集機能のために残しておく (今回は未使用)
}

export function CommentForm({
  onSubmit,
  parentId,
  onCancelReply,
  isSubmitting,
  // initialContent = '', // 編集時の初期値
}: CommentFormProps) {
  const [content, setContent] = useState('');
  // const { currentUser } = useCurrentUserStore(); // ダミー版ではPublicNote側でログイン状態を管理

  // 編集モードのために initialContent を監視 (今回はコメントアウト)
  // useEffect(() => {
  //   setContent(initialContent);
  // }, [initialContent]);

  // 返信モードが切り替わったときに、入力内容をクリアする (任意)
  useEffect(() => {
    if (parentId) { // 新しい返信対象が設定された
      // setContent(''); // 必要なら入力内容をクリア
    } else { // 返信モードが解除された
      // setContent('');
    }
  }, [parentId]);


  // ダミー版なので、ログインチェックは PublicNote.tsx の DUMMY_CURRENT_USER で行う
  // if (!DUMMY_CURRENT_USER) { // from PublicNote.tsx
  //   return (
  //     <div className="p-4 mb-6 border rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center">
  //       コメントを投稿するにはログインが必要です。
  //     </div>
  //   );
  // }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) {
      return;
    }
    const success = await onSubmit(content, parentId || undefined); // parentIdがnullならundefinedを渡す
    if (success !== false) { // 投稿成功またはvoidなら入力内容をクリア
      setContent('');
      // 返信モードの解除は親コンポーネント (PublicNote) が行う
      // if (parentId && onCancelReply) {
      //   onCancelReply();
      // }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <textarea
        id="comment-form-textarea" // PublicNoteからフォーカスするためにID付与
        className="w-full p-3 border border-gray-300 rounded-md min-h-[100px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70"
        placeholder={parentId ? `返信コメントを入力... (返信先ID: ${parentId})` : "コメントを入力..."}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting} // 投稿中は無効化
        rows={3}
        aria-label={parentId ? "返信コメント入力" : "コメント入力"}
      />
      <div className="mt-3 flex justify-end items-center gap-2">
        {parentId && onCancelReply && ( // 返信モードで、かつキャンセル関数が提供されていれば表示
             <button
             type="button"
             onClick={onCancelReply}
             className="px-4 py-2 rounded-md text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
             disabled={isSubmitting} // 投稿中は無効化
           >
             返信をキャンセル
           </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={!content.trim() || isSubmitting} // 内容が空か投稿中は無効化
        >
          {isSubmitting ? '投稿中...' : parentId ? '返信する' : 'コメントする'}
        </button>
      </div>
    </form>
  );
}