export const getCategoryBgClass = (category: string) => {
  switch(category) {
    case 'Rau củ quả': return 'category-bg-rau-cu';
    case 'Thịt cá': return 'category-bg-thit-ca';
    case 'Trứng': return 'category-bg-trung';
    case 'Chất lỏng': return 'category-bg-chat-long';
    case 'Đồ khô': return 'category-bg-do-kho';
    case 'Gia vị': return 'category-bg-gia-vi';
    case 'Khác': return 'category-bg-khac';
    default: return 'category-bg-default';
  }
};
