// src/pages/common/recipes/index.tsx
// Wrapper theo role — truyền đúng role prop xuống RecipesFeature
import { RecipesFeature } from '@/features/recipes';

export function HomemakerRecipes() {
  return (
    <div className="page-wrapper pb-20 relative">
      <RecipesFeature role="homemaker" />
    </div>
  );
}

export function MemberRecipes() {
  return (
    <div className="page-wrapper pb-20 relative">
      <RecipesFeature role="member" />
    </div>
  );
}
