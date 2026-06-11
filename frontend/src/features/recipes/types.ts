// src/features/recipes/recipes.types.ts

export type DifficultyLevel = 'Dễ' | 'Trung bình' | 'Khó';

export interface Ingredient {
  id: string;
  category: string; // e.g. 'Thịt cá', 'Rau củ'
  name: string;     // e.g. 'Thịt bò'
  amount: number;
  unit: string;     // e.g. 'g', 'quả', 'củ', 'tép', 'gói'
  isExpiringSoon?: boolean; // flags items sắp hết hạn
}

export interface CookingStep {
  id: string;
  description: string;
}

export interface Recipe {
  id: string;
  name: string;
  emoji: string;        // Emoji đại diện (hiển thị trong card)
  imageUrl?: string;    // URL ảnh thực (tùy chọn)
  cookTimeMinutes: number;
  difficulty: DifficultyLevel;
  servings: number;
  ingredients: Ingredient[];
  steps: CookingStep[];
  isFavorited: boolean;
  expiringCount?: number; // Số nguyên liệu sắp hết hạn
  isPriority?: boolean;   // Công thức "Ưu tiên" (có nguyên liệu sắp hết hạn)
}

// Dùng cho tab Cộng đồng
export interface CommunityPost {
  id: string;
  author: {
    id: string;
    name: string;
    avatarEmoji: string;
  };
  description: string; // Mô tả ngắn của tác giả
  recipe: Recipe;
  postedAt: string;    // ISO date string
  likes: number;
  isLiked: boolean;
}

// Dùng cho PendingPostCard (bài đang chờ duyệt)
export interface PendingPost {
  id: string;
  recipe: Recipe;
  submittedAt: string;
  status: 'pending';
  description?: string;
}

// Props cho RecipesFeature
export interface RecipesFeatureProps {
  role: 'homemaker' | 'member';
}

// Các nguyên liệu có thể lọc
export const FILTER_INGREDIENTS = [
  'Tất cả',
  'Thịt bò',
  'Gà',
  'Tôm',
  'Cá',
  'Trứng',
  'Cà chua',
  'Hành tây',
  'Cà rốt',
  'Bông cải',
  'Khoai tây',
] as const;

export type FilterIngredient = typeof FILTER_INGREDIENTS[number];
