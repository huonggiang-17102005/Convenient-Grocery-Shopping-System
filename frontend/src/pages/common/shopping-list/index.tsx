// src/pages/common/shopping-list/index.tsx
// Wrapper theo role — truyền đúng role prop xuống ShoppingListFeature
import { ShoppingListFeature } from '@/features/shopping-list';

export function HomemakerShoppingList() {
  return <ShoppingListFeature role="homemaker" />;
}

export function MemberShoppingList() {
  return <ShoppingListFeature role="member" />;
}
