export const validateFoodName = (name: string): { isValid: boolean; error?: string } => {
  const trimmed = name.trim();
  const genericError = 'Tên không hợp lệ. Vui lòng nhập từ có nghĩa.';

  if (!trimmed) {
    return { isValid: false, error: 'Tên không được để trống' };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Tên quá dài (tối đa 100 ký tự)' };
  }

  // 1. Phải chứa ít nhất một chữ cái (không cho phép toàn số hoặc ký hiệu)
  const hasLetterRegex = /[a-zA-ZÀ-ỹ]/;
  if (!hasLetterRegex.test(trimmed)) {
    return { isValid: false, error: genericError };
  }

  // 2. Chặn việc đè phím (lặp 1 ký tự liên tiếp từ 4 lần trở lên, VD: aaaa, 1111)
  const repeatingCharsRegex = /(.)\1{3,}/;
  if (repeatingCharsRegex.test(trimmed)) {
    return { isValid: false, error: genericError };
  }

  // 3. Chặn cụm ký tự lặp lại liên tiếp từ 3 lần trở lên (VD: hahaha, ababab, 121212)
  const repeatingSubstringRegex = /(.+)\1{2,}/i;
  if (repeatingSubstringRegex.test(trimmed)) {
    return { isValid: false, error: genericError };
  }

  // 4. Chặn các từ mang tính chất cười cợt / chat chit (VD: haha, hehe, hihi) dù chỉ lặp 2 lần
  const chatWordsRegex = /\b(ha|he|hi|ho|hu){2,}\b/i;
  if (chatWordsRegex.test(trimmed)) {
    return { isValid: false, error: genericError };
  }

  // 5. Chỉ cho phép chữ cái, số, khoảng trắng và dấu cơ bản
  const validCharsRegex = /^[a-zA-ZÀ-ỹ0-9\s,.\-()&/%'"]+$/;
  if (!validCharsRegex.test(trimmed)) {
    return { isValid: false, error: 'Tên chứa ký tự không hợp lệ. Chỉ nên chứa chữ, số và dấu cơ bản (, . - ())' };
  }

  // Phân tích từng từ
  const words = trimmed.split(/\s+/);
  const consecutiveConsonantsRegex = /[bcdfghjklmnpqrstvwxzđ]{4,}/i;
  
  for (const word of words) {
    // 4. Từ viết liền quá dài
    if (word.length > 12) {
      return { isValid: false, error: genericError };
    }

    // 5. Mashing phụ âm
    const wordLettersOnly = word.replace(/[^a-zA-ZÀ-ỹ]/g, '');
    if (consecutiveConsonantsRegex.test(wordLettersOnly)) {
      return { isValid: false, error: genericError };
    }
  }

  return { isValid: true };
};
