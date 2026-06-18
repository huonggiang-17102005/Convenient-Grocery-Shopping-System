import * as categoryRepo from '../repo/category.repo.js';

export const getGroupedCategories = async () => {
  const rawData = await categoryRepo.fetchAllCategoryUnits();

  // Nhóm các phần tử có cùng category lại với nhau
  const groupedCategories = rawData.reduce((acc, curr) => {
    let categoryGroup = acc.find(c => c.category === curr.category);
    
    if (!categoryGroup) {
      categoryGroup = {
        category: curr.category,
        units: [],
        default_storage_tip: curr.default_storage_tip
      };
      acc.push(categoryGroup);
    }
    
    if (!categoryGroup.units.includes(curr.unit)) {
      categoryGroup.units.push(curr.unit);
    }
    
    return acc;
  }, [] as { category: string; units: string[]; default_storage_tip: string | null }[]);

  return groupedCategories;
};
