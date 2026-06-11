// src/pages/Recipes.tsx
import { RecipesFeature } from '@/features/recipes';
import { useState } from 'react';

export default function Recipes() {
  // Dùng state nội bộ để giả lập Auth
  const [currentRole, setCurrentRole] = useState<'homemaker' | 'member'>('homemaker');

  return (
    <div className="page-wrapper pb-20 relative">
      
      {/* KHU VỰC DEBUG: Nút chuyển đổi quyền (Chỉ hiện khi đang Dev) */}
      <div className="absolute top-0 right-0 z-50 p-2 bg-gray-800 text-white text-xs rounded-bl-lg opacity-50 hover:opacity-100">
        Đang test dưới quyền: {currentRole} <br/>
        <button 
          className="mt-1 underline text-blue-300"
          onClick={() => setCurrentRole(currentRole === 'homemaker' ? 'member' : 'homemaker')}
        >
          🔄 Đổi sang {currentRole === 'homemaker' ? 'Member' : 'Homemaker'}
        </button>
      </div>
      {/* ======================================================== */}

      {/* Truyền cái state giả lập này xuống Feature */}
      <RecipesFeature role={currentRole} />
      
    </div>
  );
}