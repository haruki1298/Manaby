import { ChevronUp, ChevronDown, Menu, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { 
  saveCategoryOrder,
  addCustomCategory,
  removeCustomCategory,
  getOrderedCategoriesWithCustom
} from '@/modules/settings/category-order';

interface CategoryOrderManagerProps {
  categoryOrder: string[];
  onOrderChange: (newOrder: string[]) => void;
}

export function CategoryOrderManager({ 
  categoryOrder, 
  onOrderChange 
}: CategoryOrderManagerProps) {
  const { t } = useTranslation();
  
  // 新しいカテゴリ追加用の状態
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDisplayName, setNewCategoryDisplayName] = useState('');
  
  // カテゴリを上に移動
  const moveUp = (index: number) => {
    if (index <= 0) return;
    
    const newOrder = [...categoryOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index - 1];
    newOrder[index - 1] = temp;
    
    onOrderChange(newOrder);
    saveCategoryOrder(newOrder);
  };
  
  // カテゴリを下に移動
  const moveDown = (index: number) => {
    if (index >= categoryOrder.length - 1) return;
    
    const newOrder = [...categoryOrder];
    const temp = newOrder[index];
    newOrder[index] = newOrder[index + 1];
    newOrder[index + 1] = temp;
    
    onOrderChange(newOrder);
    saveCategoryOrder(newOrder);
  };
  
  // 新しいカテゴリを追加
  const handleAddCategory = () => {
    if (!newCategoryName.trim() || !newCategoryDisplayName.trim()) return;
    
    try {
      const newCategory = addCustomCategory({
        name: newCategoryName.trim(),
        translationKey: newCategoryDisplayName.trim(), // 表示名をそのまま使用
        defaultOrder: categoryOrder.length
      });
      
      // カテゴリ順序に新しいカテゴリを追加
      const updatedOrder = [...categoryOrder, newCategory.id];
      onOrderChange(updatedOrder);
      saveCategoryOrder(updatedOrder);
      
      // フォームをリセット
      setNewCategoryName('');
      setNewCategoryDisplayName('');
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };
  
  // カテゴリを削除
  const handleRemoveCategory = (categoryId: string) => {
    if (!categoryId.startsWith('custom_')) {
      alert('デフォルトカテゴリは削除できません');
      return;
    }
    
    if (!confirm('このカテゴリを削除しますか？')) return;
    
    try {
      removeCustomCategory(categoryId);
      
      // カテゴリ順序からも削除
      const updatedOrder = categoryOrder.filter(id => id !== categoryId);
      onOrderChange(updatedOrder);
      saveCategoryOrder(updatedOrder);
    } catch (error) {
      console.error('Failed to remove category:', error);
    }
  };
  
  // カテゴリを表示順に取得（カスタムカテゴリ対応）
  const orderedCategories = getOrderedCategoriesWithCustom(categoryOrder);
  
  return (
    <div className="mb-6 border rounded-md p-3 bg-gray-50 dark:bg-gray-800">
      <h3 className="font-medium mb-2 text-sm">カテゴリ表示順序</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        上下ボタンを使って順序を変更できます
      </p>
      
      {/* カテゴリ追加ボタン */}
      <div className="mb-4">
        {!isAddingCategory ? (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
          >
            <Plus className="h-4 w-4" />
            新しいカテゴリを追加
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-700 rounded border p-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                カテゴリ名（内部ID用）
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="例: my-notes"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                表示名
              </label>
              <input
                type="text"
                value={newCategoryDisplayName}
                onChange={(e) => setNewCategoryDisplayName(e.target.value)}
                placeholder="例: マイノート"
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || !newCategoryDisplayName.trim()}
                className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setIsAddingCategory(false);
                  setNewCategoryName('');
                  setNewCategoryDisplayName('');
                }}
                className="px-3 py-1 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        {orderedCategories.map((category, index) => (
          <div 
            key={category.id} 
            className="flex items-center bg-white dark:bg-gray-700 rounded border p-2"
          >
            <Menu className="h-4 w-4 mr-2 text-gray-400" />
            <div className="flex-1">
              <span className="text-sm">{category.translationKey.startsWith('home.') ? t(category.translationKey) : category.translationKey}</span>
              {category.id.startsWith('custom_') && (
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(カスタム)</span>
              )}
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => moveDown(index)}
                disabled={index === orderedCategories.length - 1}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-40"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {category.id.startsWith('custom_') && (
                <button
                  onClick={() => handleRemoveCategory(category.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
