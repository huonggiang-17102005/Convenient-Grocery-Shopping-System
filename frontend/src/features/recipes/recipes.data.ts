// src/features/recipes/recipes.data.ts
// Mock data exactly matching the Figma design with real image URLs

import type { Recipe, CommunityPost } from './recipes.types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'rec_001',
    name: 'Thịt bò xào cà chua',
    emoji: '🥩',
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
    cookTimeMinutes: 25,
    difficulty: 'Dễ',
    servings: 4,
    isFavorited: true,
    isPriority: true,
    expiringCount: 2,
    ingredients: [
      { id: 'i1', category: 'Thịt cá', name: 'Thịt bò', amount: 500, unit: 'g', isExpiringSoon: true },
      { id: 'i2', category: 'Rau củ', name: 'Cà chua', amount: 3, unit: 'quả', isExpiringSoon: true },
      { id: 'i3', category: 'Rau củ', name: 'Hành tây', amount: 1, unit: 'củ' },
      { id: 'i4', category: 'Gia vị', name: 'Tỏi', amount: 3, unit: 'tép' },
      { id: 'i5', category: 'Gia vị', name: 'Gia vị', amount: 1, unit: 'gói' },
    ],
    steps: [
      { id: 's1', description: 'Sơ chế thịt bò, cắt miếng vừa ăn. Ướp thịt với gia vị trong 15 phút.' },
      { id: 's2', description: 'Cà chua rửa sạch, cắt múi cau. Hành tây bóc vỏ, thái lát mỏng.' },
      { id: 's3', description: 'Đun nóng chảo, cho dầu vào xào thơm hành và tỏi, sau đó cho thịt bò vào xào săn.' },
      { id: 's4', description: 'Thêm cà chua vào, đảo đều và nêm nếm gia vị cho vừa khẩu vị.' },
    ],
  },
  {
    id: 'rec_002',
    name: 'Gà xào hành tây',
    emoji: '🍗',
    imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
    cookTimeMinutes: 30,
    difficulty: 'Trung bình',
    servings: 4,
    isFavorited: true,
    ingredients: [
      { id: 'i1', category: 'Thịt cá', name: 'Ức gà', amount: 400, unit: 'g' },
      { id: 'i2', category: 'Rau củ', name: 'Hành tây', amount: 2, unit: 'củ' },
      { id: 'i3', category: 'Rau củ', name: 'Ớt chuông', amount: 1, unit: 'quả' },
      { id: 'i4', category: 'Gia vị', name: 'Nước tương', amount: 2, unit: 'muỗng canh' },
    ],
    steps: [
      { id: 's1', description: 'Gà rửa sạch, thái lát mỏng, ướp gia vị 10 phút.' },
      { id: 's2', description: 'Hành tây thái múi, ớt chuông thái sợi.' },
      { id: 's3', description: 'Xào gà chín vàng, thêm rau vào, đảo đều tay, nêm vừa ăn.' },
    ],
  },
  {
    id: 'rec_003',
    name: 'Bò kho tộ',
    emoji: '🥩',
    imageUrl: 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&auto=format&fit=crop&q=80',
    cookTimeMinutes: 60,
    difficulty: 'Khó',
    servings: 4,
    isFavorited: true,
    ingredients: [
      { id: 'i1', category: 'Thịt cá', name: 'Thịt bò', amount: 600, unit: 'g' },
      { id: 'i2', category: 'Rau củ', name: 'Khoai tây', amount: 2, unit: 'củ' },
      { id: 'i3', category: 'Rau củ', name: 'Cà rốt', amount: 1, unit: 'củ' },
      { id: 'i4', category: 'Gia vị', name: 'Sốt kho', amount: 1, unit: 'gói' },
    ],
    steps: [
      { id: 's1', description: 'Thịt bò rửa sạch, cắt khối vuông vừa ăn. Ướp với sốt kho tộ.' },
      { id: 's2', description: 'Khoai tây, cà rốt gọt vỏ, cắt miếng vừa ăn, chiên sơ.' },
      { id: 's3', description: 'Cho thịt bò vào nồi kho săn, thêm nước xấp mặt, kho lửa nhỏ.' },
      { id: 's4', description: 'Nồi bò kho sôi 20 phút thì cho khoai tây, cà rốt vào kho mềm, nêm gia vị.' },
    ],
  },
  {
    id: 'rec_004',
    name: 'Gà nướng mật ong',
    emoji: '🍗',
    imageUrl: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80',
    cookTimeMinutes: 40,
    difficulty: 'Trung bình',
    servings: 4,
    isFavorited: false,
    ingredients: [
      { id: 'i1', category: 'Thịt cá', name: 'Đùi gà', amount: 4, unit: 'cái' },
      { id: 'i2', category: 'Gia vị', name: 'Mật ong', amount: 3, unit: 'muỗng canh' },
      { id: 'i3', category: 'Gia vị', name: 'Tỏi băm', amount: 1, unit: 'muỗng canh' },
      { id: 'i4', category: 'Gia vị', name: 'Dầu hào', amount: 1, unit: 'muỗng canh' },
    ],
    steps: [
      { id: 's1', description: 'Đùi gà rửa sạch, khía nhẹ để ngấm gia vị.' },
      { id: 's2', description: 'Trộn mật ong, tỏi băm, dầu hào, nước tương làm sốt ướp gà 30 phút.' },
      { id: 's3', description: 'Cho gà vào lò nướng ở 180 độ C trong 20 phút, quét thêm mật ong nướng thêm 10 phút.' },
    ],
  },
];

// Helper to get relative ISO string
const getPastHoursISO = (hours: number): string => {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
};

export const MOCK_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_001',
    author: { id: 'u1', name: 'Anh Tuấn', avatarEmoji: '👨' },
    description: 'Món bò kho thơm ngon cho cả nhà. Thịt bò mềm, khoai tây bùi, nước dùng đậm đà.',
    recipe: MOCK_RECIPES[2], // Bò kho tộ
    postedAt: getPastHoursISO(2),
    likes: 128,
    isLiked: true,
  },
  {
    id: 'post_002',
    author: { id: 'u2', name: 'Lan Hương', avatarEmoji: '👩' },
    description: 'Công thức gà nướng mật ong đơn giản, ngon miệng. Vừa ngọt vừa mặn, da giòn thịt mềm.',
    recipe: MOCK_RECIPES[3], // Gà nướng mật ong
    postedAt: getPastHoursISO(5),
    likes: 85,
    isLiked: false,
  },
];
