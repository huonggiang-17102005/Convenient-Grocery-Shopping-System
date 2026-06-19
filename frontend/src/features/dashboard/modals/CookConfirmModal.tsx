import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { FoodCategory } from '../../fridge/types';
import { useCategoryContext } from '../../../contexts/CategoryContext';

export interface CookIngredient {
  name: string;
  category: string;
  amountValue: string;
  amountUnit: string;
}

interface FridgeItem {
  name: string;
  category?: string;
  quantity: number;
}

interface CookConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (ingredients: CookIngredient[]) => void;
  initialIngredients?: CookIngredient[];
  fridgeItems?: FridgeItem[];
}

const CookConfirmModal: React.FC<CookConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialIngredients = [],
  fridgeItems = []
}) => {
  const { categoriesData } = useCategoryContext();
  const availableCategories = categoriesData.map(c => c.category as FoodCategory);

  const [ingredients, setIngredients] = useState<CookIngredient[]>(() =>
    initialIngredients.length > 0 
      ? initialIngredients 
      : [{ name: '', category: availableCategories[0] || '', amountValue: '', amountUnit: categoriesData[0]?.units?.[0] || '' }]
  );

  // Update initial ingredient category if we load categories after state init
  useEffect(() => {
    if (ingredients.length === 1 && ingredients[0].category === '' && availableCategories.length > 0) {
      setIngredients([{ name: '', category: availableCategories[0], amountValue: '', amountUnit: categoriesData[0]?.units?.[0] || '' }]);
    }
  }, [availableCategories, ingredients.length, categoriesData]);

  const updateField = (index: number, field: keyof CookIngredient, value: string) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients((prev) => [...prev, { name: '', category: availableCategories[0] || '', amountValue: '', amountUnit: categoriesData[0]?.units?.[0] || '' }]);
  };

  const handleConfirm = () => {
    onConfirm?.(ingredients);
    onClose();
  };

  // Tính toán cảnh báo thiếu nguyên liệu
  const warnings = useMemo(() => {
    const msgs: string[] = [];
    ingredients.forEach(ing => {
      if (!ing.name || !ing.amountValue) return;

      const requested = parseFloat(ing.amountValue);
      if (isNaN(requested) || requested <= 0) return;

      const matches = fridgeItems.filter(fi => 
        fi.name.toLowerCase().trim() === ing.name.toLowerCase().trim() &&
        fi.category?.toLowerCase().trim() === ing.category.toLowerCase().trim()
      );

      const totalAvailable = matches.reduce((sum, fi) => sum + fi.quantity, 0);

      if (totalAvailable === 0) {
        msgs.push(`Không tìm thấy nguyên liệu ${ing.name} - ${ing.amountValue}${ing.amountUnit} trong tủ lạnh, sẽ không áp dụng tự động trừ kho đối với nguyên liệu này.`);
      } else if (totalAvailable < requested) {
        msgs.push(`Chỉ còn ${totalAvailable}${ing.amountUnit} ${ing.name} trong tủ lạnh, phần thiếu (${requested - totalAvailable}${ing.amountUnit}) sẽ không được tự động trừ.`);
      }
    });
    return msgs;
  }, [ingredients, fridgeItems]);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={onClose} role="dialog" aria-modal="true">
      <div 
        style={{ width: '90%', maxWidth: 360, maxHeight: '90vh', overflowY: 'auto', padding: 24, background: 'white', borderRadius: 16, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'inline-flex' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ alignSelf: 'stretch', justifyContent: 'space-between', alignItems: 'flex-start', display: 'inline-flex' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <div style={{ textAlign: 'center', color: '#1A1A1A', fontSize: 20, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '28px', wordWrap: 'break-word' }}>Xác nhận nguyên liệu dùng thực tế</div>
          </div>
          <div style={{ paddingLeft: 8, justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', cursor: 'pointer' }} onClick={onClose}>
            <div style={{ width: 28, height: 28, position: 'relative', borderRadius: 42770700, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <X size={20} color="#9E9E9E" />
            </div>
          </div>
        </div>
        <div style={{ width: '100%', paddingTop: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
          <div style={{ width: '100%', textAlign: 'center', color: '#757575', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', lineHeight: '20px', wordWrap: 'break-word' }}>Điều chỉnh số lượng thực tế đã dùng (không tính gia vị)</div>
        </div>
        <div style={{ alignSelf: 'stretch', paddingTop: 16, paddingBottom: 4, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 8, display: 'flex' }}>
          
          {ingredients.map((item, index) => (
            <div key={index} style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ flex: 1, width: '100%', background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', overflow: 'hidden' }}>
                <div style={{ width: '100%', paddingTop: 8, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, justifyContent: 'space-between', alignItems: 'center', gap: 8, display: 'inline-flex', boxSizing: 'border-box' }}>
                  <div style={{ flex: 1, height: 32, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex' }}>
                    <input
                      style={{ alignSelf: 'stretch', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                      value={item.name}
                      onChange={(e) => updateField(index, 'name', e.target.value)}
                      placeholder="Tên nguyên liệu..."
                    />
                  </div>
                  <div style={{ width: 28, height: 28, background: '#F5F5F5', borderRadius: 6, justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer' }} onClick={() => removeRow(index)}>
                    <X size={14} color="#9E9E9E" />
                  </div>
                </div>
                <div style={{ width: '100%', paddingLeft: 12, paddingRight: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', boxSizing: 'border-box' }}>
                  <div style={{ width: '100%', height: 1, position: 'relative', background: '#F0F0F0' }} />
                </div>
                <div style={{ alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 8, paddingBottom: 8, justifyContent: 'flex-start', alignItems: 'center', display: 'flex', boxSizing: 'border-box' }}>
                  <div style={{ width: 90, flexShrink: 0, justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                    <div style={{ width: '100%', height: 30, background: '#FFF3E0', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                      <select 
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }}
                        value={item.category}
                        onChange={(e) => updateField(index, 'category', e.target.value)}
                        title="Chọn danh mục"
                      >
                        {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <div style={{ width: '100%', height: '100%', paddingLeft: 8, paddingRight: 8, justifyContent: 'space-between', alignItems: 'center', display: 'flex', pointerEvents: 'none' }}>
                        <div style={{ color: '#FF8A00', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.category}
                        </div>
                        <div style={{ color: '#FF8A00', fontSize: 8 }}>▼</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 1, height: 20, position: 'relative', background: '#E0E0E0', margin: '0 8px', flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 30, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                    <input
                      style={{ alignSelf: 'stretch', textAlign: 'center', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                      value={item.amountValue}
                      onChange={(e) => updateField(index, 'amountValue', e.target.value)}
                      placeholder="Số lượng"
                    />
                  </div>
                  <div style={{ width: 1, height: 20, position: 'relative', background: '#E0E0E0', margin: '0 8px', flexShrink: 0 }} />
                  <div style={{ width: 46, flexShrink: 0, height: 30, minWidth: 36, paddingLeft: 8, paddingRight: 8, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                    <input
                      style={{ alignSelf: 'stretch', width: '100%', textAlign: 'center', border: 'none', outline: 'none', color: '#757575', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                      value={item.amountUnit}
                      onChange={(e) => updateField(index, 'amountUnit', e.target.value)}
                      placeholder="g"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>
        <div style={{ alignSelf: 'stretch', height: 45, paddingTop: 4, cursor: 'pointer', display: 'flex', justifyContent: 'flex-start' }} onClick={addIngredient}>
          <div style={{ color: '#FF8A00', fontSize: 14, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', lineHeight: '18px' }}>+ Thêm nguyên liệu mới</div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div style={{ alignSelf: 'stretch', padding: '12px 16px', marginBottom: 12, background: '#FFF3CD', borderRadius: 8, border: '1px solid #FFE69C' }}>
            {warnings.map((msg, i) => (
              <div key={i} style={{ color: '#664D03', fontSize: 13, fontFamily: 'Plus Jakarta Sans', marginBottom: i === warnings.length - 1 ? 0 : 8 }}>
                <strong style={{ color: '#D97706' }}>Chú ý:</strong> {msg}
              </div>
            ))}
          </div>
        )}

        <div style={{ alignSelf: 'stretch', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 12, display: 'flex' }}>
          <button 
            onClick={handleConfirm}
            style={{ alignSelf: 'stretch', height: 48, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
          >
            Xác nhận nấu &amp; Trừ kho
          </button>
          <button 
            onClick={onClose}
            style={{ alignSelf: 'stretch', height: 48, background: 'white', borderRadius: 100, border: '1.27px solid #E0E0E0', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', cursor: 'pointer' }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookConfirmModal;
