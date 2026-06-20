import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { FoodCategory } from '../../fridge/types';
import { useCategoryContext } from '../../../contexts/CategoryContext';

export interface ShoppingConfirmIngredient {
  name: string;
  category: string;
  neededText: string;
  buyAmountStr?: string; // for 'Gia vị'
  quantity?: number; // for non-'Gia vị'
  unit?: string; // for non-'Gia vị'
}

interface ShoppingConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (ingredients: Array<{ name: string; category: string; buyAmountStr?: string; quantity?: number; unit?: string }>) => void;
  initialIngredients?: Array<{ name: string; category: string; neededText: string; defaultBuyAmount: string; quantity?: number; unit?: string }>;
}

const parseQuantity = (str: string): { amount: number; unit: string } => {
  const trimmed = str.trim();
  const match = trimmed.match(/^([\d.,]+)\s*(.*)$/);
  if (match) {
    const num = parseFloat(match[1].replace(',', '.'));
    return {
      amount: isNaN(num) ? 1 : num,
      unit: match[2] || 'g',
    };
  }
  return {
    amount: 1,
    unit: trimmed || 'g',
  };
};

const ShoppingConfirmModal: React.FC<ShoppingConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialIngredients = []
}) => {
  const { categoriesData } = useCategoryContext();
  const availableCategories = categoriesData
    .map(c => c.category as FoodCategory)
    .filter(cat => cat && !cat.startsWith('__'));

  const [ingredients, setIngredients] = useState<ShoppingConfirmIngredient[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (initialIngredients.length > 0) {
        setIngredients(
          initialIngredients.map(ing => ({
            name: ing.name,
            category: ing.category,
            neededText: ing.neededText,
            buyAmountStr: ing.category === 'Gia vị' ? ing.defaultBuyAmount : undefined,
            quantity: ing.category !== 'Gia vị' ? (ing.quantity ?? 1) : undefined,
            unit: ing.category !== 'Gia vị' ? (ing.unit || 'g') : undefined
          }))
        );
      } else {
        const defaultCat = availableCategories[0] || '';
        setIngredients([
          {
            name: '',
            category: defaultCat,
            neededText: 'Nguyên liệu mới',
            buyAmountStr: defaultCat === 'Gia vị' ? '' : undefined,
            quantity: defaultCat !== 'Gia vị' ? 1 : undefined,
            unit: defaultCat !== 'Gia vị' ? 'g' : undefined
          }
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateField = (index: number, field: keyof ShoppingConfirmIngredient, value: any) => {
    setIngredients((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleCategoryChange = (index: number, newCat: string) => {
    setIngredients((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const oldCat = item.category;
          if (newCat === 'Gia vị' && oldCat !== 'Gia vị') {
            const q = item.quantity ?? '';
            const u = item.unit ?? '';
            return {
              ...item,
              category: newCat,
              buyAmountStr: q || u ? `${q} ${u}`.trim() : '',
              quantity: undefined,
              unit: undefined
            };
          } else if (newCat !== 'Gia vị' && oldCat === 'Gia vị') {
            const parsed = parseQuantity(item.buyAmountStr || '');
            return {
              ...item,
              category: newCat,
              quantity: parsed.amount,
              unit: parsed.unit,
              buyAmountStr: undefined
            };
          }
          return { ...item, category: newCat };
        }
        return item;
      })
    );
  };

  const removeRow = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    const defaultCat = availableCategories[0] || '';
    setIngredients((prev) => [
      ...prev,
      {
        name: '',
        category: defaultCat,
        neededText: 'Nguyên liệu mới',
        buyAmountStr: defaultCat === 'Gia vị' ? '' : undefined,
        quantity: defaultCat !== 'Gia vị' ? 1 : undefined,
        unit: defaultCat !== 'Gia vị' ? 'g' : undefined
      }
    ]);
  };

  const handleConfirm = () => {
    const validItems = ingredients.filter(i => {
      if (i.name.trim() === '') return false;
      if (i.category === 'Gia vị') {
        return (i.buyAmountStr || '').trim() !== '';
      } else {
        return i.quantity !== undefined && !isNaN(i.quantity);
      }
    });

    if (validItems.length === 0) {
      alert('Vui lòng nhập tên và số lượng mua ít nhất một nguyên liệu!');
      return;
    }
    onConfirm?.(validItems);
    onClose();
  };

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
          boxSizing: 'border-box'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div style={{ padding: '20px 20px 10px 20px', borderBottom: '1px solid #F5F5F5', flexShrink: 0 }}>
          <div style={{ textAlign: 'center', color: '#1A1A1A', fontSize: 18, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', lineHeight: '26px' }}>
            Mua sắm nguyên liệu thiếu
          </div>
          <div style={{ textAlign: 'center', color: '#757575', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', marginTop: 4 }}>
            Nhập lượng cần mua vào Shopping List
          </div>
        </div>

        {/* Scrollable Content Section */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ingredients.map((item, index) => (
            <div key={index} style={{ alignSelf: 'stretch', justifyContent: 'flex-start', alignItems: 'center', gap: 8, display: 'flex', width: '100%', boxSizing: 'border-box', position: 'relative' }}>
              <div style={{ flex: 1, width: '100%', background: 'white', borderRadius: 12, outline: '1.27px #E0E0E0 solid', outlineOffset: '-1.27px', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', overflow: 'visible', position: 'relative' }}>

                {/* Row Header: Name and Remove */}
                <div style={{ width: '100%', paddingTop: 8, paddingBottom: 4, paddingLeft: 12, paddingRight: 12, justifyContent: 'space-between', alignItems: 'center', gap: 8, display: 'inline-flex', boxSizing: 'border-box' }}>
                  <div style={{ flex: 1, height: 32, overflow: 'visible', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'inline-flex', position: 'relative' }}>
                    <input
                      style={{ alignSelf: 'stretch', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '500', background: 'transparent' }}
                      value={item.name}
                      onChange={(e) => updateField(index, 'name', e.target.value)}
                      placeholder="Tên nguyên liệu..."
                    />
                  </div>
                  <div style={{ width: 24, height: 24, background: '#F5F5F5', borderRadius: 6, justifyContent: 'center', alignItems: 'center', display: 'flex', cursor: 'pointer' }} onClick={() => removeRow(index)}>
                    <X size={12} color="#9E9E9E" />
                  </div>
                </div>

                {/* Needed helper text info */}
                <div style={{ width: '100%', paddingLeft: 12, paddingBottom: 6, color: '#757575', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontStyle: 'italic' }}>
                  {item.neededText}
                </div>

                <div style={{ width: '100%', paddingLeft: 12, paddingRight: 12, flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', display: 'flex', boxSizing: 'border-box' }}>
                  <div style={{ width: '100%', height: 1, position: 'relative', background: '#F0F0F0' }} />
                </div>

                {/* Row Footer: Category Select and custom inputs */}
                <div style={{ alignSelf: 'stretch', paddingLeft: 12, paddingRight: 12, paddingTop: 6, paddingBottom: 6, justifyContent: 'flex-start', alignItems: 'center', display: 'flex', boxSizing: 'border-box' }}>

                  {/* Category dropdown */}
                  <div style={{ width: 90, flexShrink: 0, justifyContent: 'flex-start', alignItems: 'center', display: 'flex' }}>
                    <div style={{ width: '100%', height: 26, background: '#FFF3E0', borderRadius: 6, position: 'relative', overflow: 'hidden' }}>
                      <select
                        style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer' }}
                        value={item.category}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
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

                  {/* Input style based on Category (Spice vs. Non-Spice) */}
                  {item.category === 'Gia vị' ? (
                    <div style={{ flex: 1, height: 26, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                      <input
                        style={{ alignSelf: 'stretch', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                        value={item.buyAmountStr || ''}
                        onChange={(e) => updateField(index, 'buyAmountStr', e.target.value)}
                        placeholder="Ví dụ: 1 lọ, 500g, 2 gói..."
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ flex: 1, height: 26, overflow: 'hidden', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', display: 'flex' }}>
                        <input
                          style={{ alignSelf: 'stretch', textAlign: 'center', border: 'none', outline: 'none', color: '#1A1A1A', fontSize: 12, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                          value={item.quantity ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            const num = val === '' ? undefined : parseFloat(val);
                            updateField(index, 'quantity', isNaN(num as any) ? undefined : num);
                          }}
                          placeholder="Số lượng"
                        />
                      </div>
                      <div style={{ width: 1, height: 16, position: 'relative', background: '#E0E0E0', margin: '0 8px', flexShrink: 0 }} />
                      <div style={{ width: 36, flexShrink: 0, height: 26, paddingLeft: 4, paddingRight: 4, justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
                        <input
                          style={{ alignSelf: 'stretch', width: '100%', textAlign: 'center', border: 'none', outline: 'none', color: '#757575', fontSize: 11, fontFamily: 'Plus Jakarta Sans', fontWeight: '400', background: 'transparent' }}
                          value={item.unit || ''}
                          onChange={(e) => updateField(index, 'unit', e.target.value)}
                          placeholder="ĐVT"
                        />
                      </div>
                    </>
                  )}

                </div>

              </div>
            </div>
          ))}

          {/* Add item button */}
          <div style={{ cursor: 'pointer', display: 'flex', justifyContent: 'flex-start', paddingBottom: 10 }} onClick={addIngredient}>
            <div style={{ color: '#FF8A00', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600' }}>
              + Thêm nguyên liệu mua sắm
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div style={{ padding: '12px 20px 20px 20px', borderTop: '1px solid #F5F5F5', display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0 }}>
          <button
            onClick={handleConfirm}
            style={{ alignSelf: 'stretch', height: 44, background: '#FF8A00', borderRadius: 100, border: 'none', color: 'white', fontSize: 13, fontFamily: 'Plus Jakarta Sans', fontWeight: '600', cursor: 'pointer' }}
          >
            Thêm vào Shopping List
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

export default ShoppingConfirmModal;
