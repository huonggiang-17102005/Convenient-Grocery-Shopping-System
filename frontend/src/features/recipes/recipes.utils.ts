export const matchFoodImageUrl = (nameStr: string): string => {
  const lower = nameStr.toLowerCase();
  if (lower.includes('bò') || lower.includes('beef')) {
    return 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('gà') || lower.includes('chicken')) {
    return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('cá') || lower.includes('fish')) {
    return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('tôm') || lower.includes('shrimp') || lower.includes('hải sản')) {
    return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('cà chua') || lower.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80';
  }
  if (lower.includes('canh') || lower.includes('súp') || lower.includes('soup') || lower.includes('mì') || lower.includes('phở') || lower.includes('noodles')) {
    return 'https://images.unsplash.com/photo-1547592165-e1d17fed6005?w=600&auto=format&fit=crop&q=80';
  }
  // Generic beautiful food dish
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
};
