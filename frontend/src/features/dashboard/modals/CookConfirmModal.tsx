import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { FoodCategory } from '../../fridge/types';
import { useCategoryContext } from '../../../contexts/CategoryContext';
import { useAuth } from '../../../contexts/AuthContext';

export interface CookIngredient {
  name: string;
  category: string;
  amountValue: string;
  amountUnit: string;
  isDeducted?: boolean;
}

interface FridgeItem {
  name: string;
  category?: string;
  quantity: number;
  unit?: string;
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
  // Filter out "Gia vị" from the available categories list
  const availableCategories = categoriesData
    .map(c => c.category as FoodCategory)
    .filter(cat => cat !== 'Gia vị');
  const { user } = useAuth();

  const [ingredients, setIngredients] = useState<CookIngredient[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      let stored: string[] = [];
      if (user?.family_id) {
        const todayStr = new Date().toISOString().split('T')[0];
        const storageKey = `deducted_ingredients_${user.family_id}_${todayStr}`;
        try {
          stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch(e) {}
      }

      if (initialIngredients.length > 0) {
        // Exclude spices from initial cooking ingredients list
        const filtered = initialIngredients
          .filter(ing => ing.category !== 'Gia vị')
          .map(ing => ({
            ...ing,
            isDeducted: stored.includes(ing.name)
          }));
        setIngredients(filtered);
      } else {
        setIngredients([{ name: '', category: availableCategories[0] || '', amountValue: '', amountUnit: categoriesData[0]?.units?.[0] || '' }]);
      }
    }
  }, [isOpen, initialIngredients, user?.family_id, availableCategories, categoriesData]);

  const getFilteredFridgeItems = (query: string) => {
    const q = query.toLowerCase().trim();
    if (!q) return fridgeItems;
    return fridgeItems.filter(f => f.name.toLowerCase().includes(q));
  };

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
    const activeIngredients = ingredients.filter(i => !i.isDeducted);
    onConfirm?.(activeIngredients);
    onClose();
  };

  // Calculate insufficient stock warnings (exclude spices)
  const warnings = useMemo(() => {
    const msgs: string[] = [];
    ingredients.forEach(ing => {
      if (!ing.name || !ing.amountValue || ing.isDeducted || ing.category === 'Gia vị') return;

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
        style={{ 
          width: '90%', 
          maxWidth: 380, 
          height: '80vh',
          maxHeight: 600,
          background: 'white', 
          borderRadius: 16, 
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 20,
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div style={{ alignSelf: 'stretch', borderBottom: '1px solid #F5F5F5', paddingBottom: 10, flexShrink: 0 }}>
          <div style={{ textAlign: 'center', color: '#1A1A1A', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '26px' }}>
            Xác nhận nguyên liệu dùng thực tế
          </div>
          <div style={{ textAlign: 'center', color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', marginTop: 4 }}>
            Điều chỉnh số lượng thực tế đã dùng (không tính gia vị)
          </div>
        </div>

        {/* Scrollable Ingredients list */}
        <div style={{ flex: 1, overflowY: 'auto', width: '100%', paddingTop: 10, paddingBottom: 10, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ingredients.map((item, index) => (
            <div key={index} style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', width: '100%', boxSizing: 'border-box', position: 'relative', opacity: item.isDeducted ? 0.5 : 1, pointerEvents: item.isDeducted ? 'none' : 'auto' }}>
              <div style={{ flex: 1, width: '100%', background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', overflow: 'visible', position: 'relative' }}>
                {item.isDeducted && <div style={{ position: 'absolute', right: 40, top: 10, background: '#E0E0E0', color: '#757575', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold', zIndex: 5 }}>Đã nấu</div>}
                
                <div style={{ width: '100%', paddingTop: 8, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, justifyContent: 'space-between', alignItems: 'center', gap: 8, display: 'inline-flex', boxSizing: 'border-box' }}>
                  <div style={{ flex: 1, height: 32, overflow: 'visible', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex', position: 'relative' }}>
                    <input
                      style={{ alignSelf: 'stretch', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                      value={item.name}
                      onChange={(e) => {
                        updateField(index, 'name', e.target.value);
                        setActiveIndex(index);
                      }}
                      onFocus={() => setActiveIndex(index)}
                      onBlur={() => setTimeout(() => setActiveIndex(null), 150)}
                      placeholder="Tên nguyên liệu..."
                    />
                    {activeIndex === index && (
                      <div style={{ position: 'absolute', top: 32, left: -12, width: 'calc(100% + 40px)', background: 'white', border: '1px solid #E0E0E0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: 150, overflowY: 'auto' }}>
                        {getFilteredFridgeItems(item.name).length === 0 ? (
                          <div style={{ padding: '8px 12px', color: '#9E9E9E', fontSize: 12, fontFamily: 'Plus Jakarta Sans' }}>Không tìm thấy trong tủ lạnh</div>
                        ) : (
                          getFilteredFridgeItems(item.name).map((fi, idx) => (
                            <div 
                              key={idx} 
                              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #F5F5F5', display: 'flex', justifyContent: 'space-between' }}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                updateField(index, 'name', fi.name);
                                if (fi.category) updateField(index, 'category', fi.category);
                                setActiveIndex(null);
                              }}
                            >
                              <span style={{ fontSize: 13, color: '#1A1A1A', fontFamily: 'Plus Jakarta Sans', fontWeight: 500 }}>{fi.name}</span>
                              <span style={{ fontSize: 12, color: '#FF8A00', fontFamily: 'Plus Jakarta Sans' }}>Còn {fi.quantity}{fi.unit ? ` ${fi.unit}` : ''}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ width: 24, height: 24, background: '#F5F5F5', borderRadius: 6, justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer' }} onClick={() => removeRow(index)}>
                    <X size={12} color="#9E9E9E" />
                  </div>
                </div>
                
                <div style={{ width: '100%', paddingLeft: 12, paddingRight: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', boxSizing: 'border-box' }}>
                  <div style={{ width: '100%', height: 1, position: 'relative', background: '#F0F0F0' }} />
                </div>
                
                <div style={{ alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'flex-start', alignItems: 'center', display: 'flex', boxSizing: 'border-box' }}>
                  <div style={{ width: 90, flexShrink: 0, justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                    <div style={{ width: '100%', height: 26, background: '#FFF3E0', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                      <select 
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }}
                        value={item.category}
                        onChange={(e) => updateField(index, 'category', e.target.value)}
                        title="Chọn danh mục"
                      >
                        {availableCategories.map(cat => (
                          <option 
                            key={cat} 
                            value={cat}
                            style={{
                              background: '#ffffff',
                              color: '#1A1A1A',
                              fontFamily: 'Plus Jakarta Sans',
                              fontSize: '13px',
                              padding: '8px 12px'
                            }}
                          >
                            {cat}
                          </option>
                        ))}
                      </select>
                      <div style={{ width: '100%', height: '100%', paddingLeft: 6, paddingRight: 6, justifyContent: 'space-between', alignItems: 'center', display: 'flex', pointerEvents: 'none' }}>
                        <div style={{ color: '#FF8A00', fontSize: 10, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.category}
                        </div>
                        <div style={{ color: '#FF8A00', fontSize: 8 }}>▼</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 1, height: 16, position: 'relative', background: '#E0E0E0', margin: '0 8px', flexShrink: 0 }} />
                  <div style={{ flex: 1, height: 26, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                    <input
                      style={{ alignSelf: 'stretch', textAlign: 'center', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                      value={item.amountValue}
                      onChange={(e) => updateField(index, 'amountValue', e.target.value)}
                      placeholder="Số lượng"
                    />
                  </div>
                  <div style={{ width: 1, height: 16, position: 'relative', background: '#E0E0E0', margin: '0 8px', flexShrink: 0 }} />
                  <div style={{ width: 36, flexShrink: 0, height: 26, paddingLeft: 4, paddingRight: 4, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                    <input
                      style={{ alignSelf: 'stretch', width: '100%', textAlign: 'center', border: 'none', outline: 'none', color: '#757575', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                      value={item.amountUnit}
                      onChange={(e) => updateField(index, 'amountUnit', e.target.value)}
                      placeholder="g"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add row button */}
          <div style={{ cursor: 'pointer', display: 'flex', justifyContent: 'flex-start', paddingBottom: 10 }} onClick={addIngredient}>
            <div style={{ color: '#FF8A00', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}>
              + Thêm nguyên liệu mới
            </div>
          </div>

          {/* Warnings section inside scrollable block */}
          {warnings.length > 0 && (
            <div style={{ alignSelf: 'stretch', padding: '12px 16px', background: '#FFF3CD', borderRadius: 8, border: '1px solid #FFE69C' }}>
              {warnings.map((msg, i) => (
                <div key={i} style={{ color: '#664D03', fontSize: 12, fontFamily: 'Plus Jakarta Sans', marginBottom: i === warnings.length - 1 ? 0 : 6 }}>
                  <strong style={{ color: '#D97706' }}>Chú ý:</strong> {msg}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div style={{ alignSelf: 'stretch', borderTop: '1px solid #F5F5F5', paddingTop: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', gap: 10, display: 'flex', flexShrink: 0 }}>
          <button 
            onClick={handleConfirm}
            style={{ alignSelf: 'stretch', height: 44, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', cursor: 'pointer' }}
          >
            Xác nhận nấu &amp; Trừ kho
          </button>
          <button 
            onClick={onClose}
            style={{ alignSelf: 'stretch', height: 44, background: 'white', borderRadius: 100, border: '1.27px solid #E0E0E0', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', cursor: 'pointer' }}
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookConfirmModal;
