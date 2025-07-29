// src/components/comments/CommentForm.tsx (修正)
import { useState, useEffect } from 'react';

interface CommentFormProps {
  onSubmit: (content: string, parentId?: string) => Promise<boolean | void>;
  parentId?: string | null; 
  onCancelReply?: () => void; 
  isSubmitting?: boolean;
  
  initialContent?: string; 
  onCancelEdit?: () => void;
  isEditing?: boolean; 
}

export function CommentForm({
  onSubmit,
  parentId,
  onCancelReply,
  isSubmitting,
  initialContent = '',
  onCancelEdit,
  isEditing = false,
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);

  // 編集モードや返信モードが切り替わったときに、フォームの内容を更新する
  useEffect(() => {
    setContent(initialContent || ''); // 編集モードで初期値をセット、そうでなければクリア
  }, [initialContent, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    // isEditingがtrueなら、onSubmitにparentIdを渡さない（編集処理として扱う）
    const success = await onSubmit(content, isEditing ? undefined : parentId || undefined);

    if (success !== false) {
      setContent('');
      // 編集モードのキャンセルは親コンポーネントで行うので、ここでは何もしない
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 md:mb-6">
      <textarea
        id="comment-form-textarea"
        className="w-full p-2 md:p-3 border border-gray-300 rounded-md min-h-[80px] md:min-h-[100px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-70 text-sm md:text-base"
        placeholder={parentId ? "返信コメントを入力..." : (isEditing ? "コメントを編集..." : "コメントを入力...")}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSubmitting}
        rows={3}
      />
      <div className="mt-2 md:mt-3 flex flex-col sm:flex-row sm:justify-end sm:items-center gap-2">
        {/* 返信モード or 編集モードの場合にキャンセルボタンを表示 */}
        {(parentId && onCancelReply) && (
             <button type="button" onClick={onCancelReply} className="px-3 md:px-4 py-2 rounded-md text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500" disabled={isSubmitting}>
               返信をキャンセル
             </button>
        )}
        {(isEditing && onCancelEdit) && (
             <button type="button" onClick={onCancelEdit} className="px-3 md:px-4 py-2 rounded-md text-xs md:text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500" disabled={isSubmitting}>
               編集をキャンセル
             </button>
        )}
        <button
          type="submit"
          className="px-3 md:px-4 py-2 rounded-md text-xs md:text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? '送信中...' : (isEditing ? '更新する' : (parentId ? '返信する' : 'コメントする'))}
        </button>
      </div>
    </form>
  );
}