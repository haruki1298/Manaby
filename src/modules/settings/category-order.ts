export interface NoteCategory {
  id: string;
  name: string;
  translationKey: string;
  defaultOrder: number;
}

// デフォルトのカテゴリ設定
export const DEFAULT_CATEGORIES: NoteCategory[] = [
  { id: 'private', name: 'privateNotes', translationKey: 'home.privateNotes', defaultOrder: 0 },
  { id: 'public', name: 'publicNotes', translationKey: 'home.publicNotes', defaultOrder: 1 },
  { id: 'favorite', name: 'favoriteNotes', translationKey: 'home.favoriteNotes', defaultOrder: 2 },
];

// カテゴリ順序のローカルストレージキー
export const CATEGORY_ORDER_KEY = 'note-category-order';

// カテゴリ順序を保存
export function saveCategoryOrder(categoryIds: string[]): void {
  localStorage.setItem(CATEGORY_ORDER_KEY, JSON.stringify(categoryIds));
}

// 保存されたカテゴリ順序を取得
export function getSavedCategoryOrder(): string[] {
  try {
    const saved = localStorage.getItem(CATEGORY_ORDER_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to parse saved category order:', error);
  }
  
  // デフォルトの順序を返す
  return DEFAULT_CATEGORIES.sort((a, b) => a.defaultOrder - b.defaultOrder).map(c => c.id);
}

// カテゴリIDに基づいて並べ替えられたカテゴリを取得
export function getOrderedCategories(categoryIds: string[]): NoteCategory[] {
  const categoriesMap = DEFAULT_CATEGORIES.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<string, NoteCategory>);
  
  return categoryIds
    .filter(id => categoriesMap[id]) // 有効なIDのみをフィルタリング
    .map(id => categoriesMap[id]);
}

// カスタムカテゴリのローカルストレージキー
export const CUSTOM_CATEGORIES_KEY = 'custom-note-categories';

// カスタムカテゴリを保存
export function saveCustomCategories(categories: NoteCategory[]): void {
  localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
}

// 保存されたカスタムカテゴリを取得
export function getCustomCategories(): NoteCategory[] {
  try {
    const saved = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to parse custom categories:', error);
  }
  return [];
}

// すべてのカテゴリ（デフォルト + カスタム）を取得
export function getAllCategories(): NoteCategory[] {
  const customCategories = getCustomCategories();
  return [...DEFAULT_CATEGORIES, ...customCategories];
}

// 新しいカスタムカテゴリを追加
export function addCustomCategory(category: Omit<NoteCategory, 'id'>): NoteCategory {
  const customCategories = getCustomCategories();
  const newCategory: NoteCategory = {
    ...category,
    id: `custom_${Date.now()}`, // ユニークなIDを生成
  };
  
  const updatedCategories = [...customCategories, newCategory];
  saveCustomCategories(updatedCategories);
  
  return newCategory;
}

// カスタムカテゴリを削除
export function removeCustomCategory(categoryId: string): void {
  if (!categoryId.startsWith('custom_')) {
    throw new Error('Cannot remove default categories');
  }
  
  const customCategories = getCustomCategories();
  const updatedCategories = customCategories.filter(cat => cat.id !== categoryId);
  saveCustomCategories(updatedCategories);
  
  // カテゴリ順序からも削除
  const currentOrder = getSavedCategoryOrder();
  const updatedOrder = currentOrder.filter(id => id !== categoryId);
  saveCategoryOrder(updatedOrder);
}

// カテゴリIDに基づいて並べ替えられたカテゴリを取得（カスタムカテゴリ対応版）
export function getOrderedCategoriesWithCustom(categoryIds: string[]): NoteCategory[] {
  const allCategories = getAllCategories();
  const categoriesMap = allCategories.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {} as Record<string, NoteCategory>);
  
  return categoryIds
    .filter(id => categoriesMap[id]) // 有効なIDのみをフィルタリング
    .map(id => categoriesMap[id]);
}
