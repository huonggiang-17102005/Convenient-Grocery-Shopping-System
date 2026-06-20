export const removeAccents = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

const SYNONYMS: Record<string, string[]> = {
  'thit lon': ['thit heo'],
  'thit heo': ['thit lon'],
  'lac': ['dau phong'],
  'dau phong': ['lac'],
  'trung': ['trung ga', 'trung vit', 'trung cut'],
  'trung ga': ['trung'],
  'trung vit': ['trung'],
  'ca chua': ['ca chua bi'],
  'ca chua bi': ['ca chua'],
  'hanh tay': ['hanh cu'],
  'hanh cu': ['hanh tay'],
  'toi': ['toi tep', 'toi kho'],
};

export const isIngredientMatch = (recipeIngName: string, fridgeItemName: string): boolean => {
  if (!recipeIngName || !fridgeItemName) return false;

  const rName = removeAccents(recipeIngName);
  const fName = removeAccents(fridgeItemName);

  if (rName === fName) return true;

  // Check substrings (e.g. "thit bo bam" includes "thit bo")
  if (rName.includes(fName) || fName.includes(rName)) return true;

  // Check synonyms
  const fSynonyms = SYNONYMS[fName] || [];
  for (const syn of fSynonyms) {
    if (rName.includes(syn) || syn.includes(rName)) {
      return true;
    }
  }

  const rSynonyms = SYNONYMS[rName] || [];
  for (const syn of rSynonyms) {
    if (fName.includes(syn) || syn.includes(fName)) {
      return true;
    }
  }

  return false;
};
