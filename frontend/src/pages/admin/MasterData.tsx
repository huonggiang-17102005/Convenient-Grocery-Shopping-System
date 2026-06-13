import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import './Dashboard.css';
import './MasterData.css';

interface CategoryData {
  category: string;
  unit?: string;
  default_storage_tip: string;
  is_visible: boolean;
}

interface RecipeData {
  id: string;
  name: string;
  author_id: string | null;
  likes_count: number | null;
  visibility: 'Private' | 'Public' | null;
  servings?: number;
  cooking_time?: number;
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | null;
  ingredients?: any[];
  instructions?: any[];
}

const MasterDataAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'category' | 'unit' | 'recipe'>('category');
  
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [units, setUnits] = useState<{unit: string, is_visible: boolean}[]>([]);
  const [recipes, setRecipes] = useState<RecipeData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('edit');
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    default_storage_tip: '',
    is_visible: true
  });

  // Delete Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);
  
  const [isDeleteUnitModalOpen, setIsDeleteUnitModalOpen] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<string | null>(null);

  const [isDeleteRecipeModalOpen, setIsDeleteRecipeModalOpen] = useState(false);
  const [deletingRecipe, setDeletingRecipe] = useState<RecipeData | null>(null);

  // Unit Modal state
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [unitModalMode, setUnitModalMode] = useState<'add' | 'edit'>('edit');
  const [editingUnit, setEditingUnit] = useState<{unit: string, is_visible: boolean} | null>(null);
  const [unitFormData, setUnitFormData] = useState({
    unit: '',
    is_visible: true
  });

  // Recipe Modal state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [recipeModalMode, setRecipeModalMode] = useState<'add' | 'edit'>('add');
  const [recipeFormData, setRecipeFormData] = useState<any>({
    name: '',
    servings: 2,
    cooking_time: 15,
    difficulty: 'Trung bình',
    ingredients: [],
    instructions: [],
    visibility: 'Public'
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/master-data/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/master-data/units');
      if (res.ok) {
        const data = await res.json();
        setUnits(data);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecipes = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/master-data/recipes');
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'category') {
      fetchCategories();
    } else if (activeTab === 'unit') {
      fetchUnits();
    } else if (activeTab === 'recipe') {
      fetchRecipes();
    }
  }, [activeTab]);

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      category: '',
      default_storage_tip: '',
      is_visible: true
    });
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    if (activeTab === 'category') {
      openAddModal();
    } else if (activeTab === 'unit') {
      setUnitModalMode('add');
      setUnitFormData({ unit: '', is_visible: true });
      setIsUnitModalOpen(true);
    } else if (activeTab === 'recipe') {
      setRecipeModalMode('add');
      setRecipeFormData({
        name: '',
        servings: 2,
        cooking_time: 15,
        difficulty: 'Trung bình',
        ingredients: [{ name: '', quantity: 1, unit: '' }],
        instructions: [''],
        visibility: 'Public'
      });
      setIsRecipeModalOpen(true);
    }
  };

  const openEditModal = (cat: CategoryData) => {
    setModalMode('edit');
    setEditingCategory(cat);
    setFormData({
      category: cat.category,
      default_storage_tip: cat.default_storage_tip || '',
      is_visible: cat.is_visible
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryName: string) => {
    setDeletingCategory(categoryName);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const handleDeleteUnit = (unitName: string) => {
    setDeletingUnit(unitName);
    setIsDeleteUnitModalOpen(true);
  };

  const closeDeleteUnitModal = () => {
    setIsDeleteUnitModalOpen(false);
    setDeletingUnit(null);
  };

  const handleDeleteRecipe = (recipe: RecipeData) => {
    setDeletingRecipe(recipe);
    setIsDeleteRecipeModalOpen(true);
  };

  const closeDeleteRecipeModal = () => {
    setIsDeleteRecipeModalOpen(false);
    setDeletingRecipe(null);
  };

  const openEditUnitModal = (unitObj: {unit: string, is_visible: boolean}) => {
    setUnitModalMode('edit');
    setEditingUnit(unitObj);
    setUnitFormData({
      unit: unitObj.unit,
      is_visible: unitObj.is_visible
    });
    setIsUnitModalOpen(true);
  };

  const closeUnitModal = () => {
    setIsUnitModalOpen(false);
    setEditingUnit(null);
  };

  const openEditRecipeModal = (recipe: RecipeData) => {
    setRecipeModalMode('edit');
    setRecipeFormData({
      id: recipe.id,
      name: recipe.name || '',
      servings: recipe.servings || 2,
      cooking_time: recipe.cooking_time || 15,
      difficulty: recipe.difficulty || 'Trung bình',
      ingredients: recipe.ingredients || [],
      instructions: recipe.instructions || [],
      visibility: recipe.visibility || 'Public'
    });
    setIsRecipeModalOpen(true);
  };

  const closeRecipeModal = () => {
    setIsRecipeModalOpen(false);
  };

  const confirmDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-data/categories/${encodeURIComponent(deletingCategory)}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        fetchCategories();
        closeDeleteModal();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Lỗi mạng');
    }
  };

  const confirmDeleteUnit = async () => {
    if (!deletingUnit) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-data/units/${encodeURIComponent(deletingUnit)}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        fetchUnits();
        closeDeleteUnitModal();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      alert('Lỗi mạng');
    }
  };

  const confirmDeleteRecipe = async () => {
    if (!deletingRecipe) return;

    try {
      const res = await fetch(`http://localhost:5000/api/admin/master-data/recipes/${deletingRecipe.id}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok) {
        fetchRecipes();
        closeDeleteRecipeModal();
      } else {
        alert(data.message || 'Có lỗi xảy ra khi xóa');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      alert('Lỗi mạng');
    }
  };

  const handleSaveCategory = async () => {
    try {
      let res;
      if (modalMode === 'add') {
        if (!formData.category.trim()) {
          alert('Vui lòng nhập tên danh mục!');
          return;
        }
        res = await fetch(`http://localhost:5000/api/admin/master-data/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            category: formData.category.trim(),
            default_storage_tip: formData.default_storage_tip,
            is_visible: formData.is_visible
          })
        });
      } else {
        if (!editingCategory) return;
        res = await fetch(`http://localhost:5000/api/admin/master-data/categories/${encodeURIComponent(editingCategory.category)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            default_storage_tip: formData.default_storage_tip,
            is_visible: formData.is_visible
          })
        });
      }

      if (res.ok) {
        // Refresh data
        await fetchCategories();
        closeModal();
      } else {
        const data = await res.json();
        alert(data.message || 'Có lỗi xảy ra khi lưu');
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Lỗi mạng');
    }
  };

  const handleSaveUnit = async () => {
    try {
      let res;
      if (unitModalMode === 'add') {
        if (!unitFormData.unit.trim()) {
          alert('Vui lòng nhập đơn vị!');
          return;
        }
        res = await fetch(`http://localhost:5000/api/admin/master-data/units`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            unit: unitFormData.unit.trim(),
            is_visible: unitFormData.is_visible
          })
        });
      } else {
        if (!editingUnit) return;
        res = await fetch(`http://localhost:5000/api/admin/master-data/units/${encodeURIComponent(editingUnit.unit)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            unit: unitFormData.unit.trim(),
            is_visible: unitFormData.is_visible
          })
        });
      }

      if (res.ok) {
        await fetchUnits();
        closeUnitModal();
      } else {
        const data = await res.json();
        alert(data.message || 'Có lỗi xảy ra khi lưu đơn vị');
      }
    } catch (error) {
      console.error('Error saving unit:', error);
      alert('Lỗi mạng');
    }
  };

  const handleSaveRecipe = async () => {
    try {
      if (!recipeFormData.name) {
        alert('Vui lòng nhập tên công thức');
        return;
      }
      
      const url = recipeModalMode === 'add' 
        ? 'http://localhost:5000/api/admin/master-data/recipes'
        : `http://localhost:5000/api/admin/master-data/recipes/${recipeFormData.id}`;
        
      const method = recipeModalMode === 'add' ? 'POST' : 'PUT';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recipeFormData)
      });
      
      if (res.ok) {
        fetchRecipes();
        closeRecipeModal();
      } else {
        const data = await res.json();
        alert(data.message || 'Có lỗi xảy ra khi lưu công thức');
      }
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Lỗi mạng');
    }
  };

  const addIngredient = () => {
    setRecipeFormData({
      ...recipeFormData,
      ingredients: [...recipeFormData.ingredients, { name: '', quantity: 1, unit: '' }]
    });
  };

  const removeIngredient = (index: number) => {
    const newIngredients = [...recipeFormData.ingredients];
    newIngredients.splice(index, 1);
    setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    const newIngredients = [...recipeFormData.ingredients];
    if (field === 'quantity') value = Number(value);
    newIngredients[index][field] = value;
    setRecipeFormData({ ...recipeFormData, ingredients: newIngredients });
  };

  const addInstruction = () => {
    setRecipeFormData({
      ...recipeFormData,
      instructions: [...recipeFormData.instructions, '']
    });
  };

  const removeInstruction = (index: number) => {
    const newInstructions = [...recipeFormData.instructions];
    newInstructions.splice(index, 1);
    setRecipeFormData({ ...recipeFormData, instructions: newInstructions });
  };

  const handleInstructionChange = (index: number, value: string) => {
    const newInstructions = [...recipeFormData.instructions];
    newInstructions[index] = value;
    setRecipeFormData({ ...recipeFormData, instructions: newInstructions });
  };

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar */}
      <div className="admin-db-sidebar">
        <div className="admin-db-logo">
          <div className="admin-db-logo-text">FridMate Admin</div>
        </div>
        
        <div className="admin-db-nav">
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/dashboard')}>
            <div className="admin-db-nav-text">Tổng quan</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/users')}>
            <div className="admin-db-nav-text">Quản lý người dùng</div>
          </div>
          <div className="admin-db-nav-item">
            <div className="admin-db-nav-text">Kiểm duyệt nội dung</div>
          </div>
          <div className="admin-db-nav-item active" onClick={() => navigate('/admin/master-data')}>
            <div className="admin-db-nav-text">Quản lý dữ liệu gốc</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/settings')}>
            <div className="admin-db-nav-text">Báo cáo & Cài đặt</div>
          </div>
        </div>

        <div className="admin-db-logout-container">
          <div className="admin-db-logout-btn" onClick={handleLogout}>
            <div className="admin-db-logout-text">Đăng xuất</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-db-main">
        <div className="admin-db-content">
          <div className="master-data-header">
            <h1 className="master-data-title">Quản lý dữ liệu gốc</h1>
            <button className="master-data-add-btn" onClick={handleAddClick}>+ Thêm mới dữ liệu</button>
          </div>

          <div className="master-data-tabs">
            <div 
              className={`master-data-tab ${activeTab === 'category' ? 'active' : ''}`} 
              onClick={() => setActiveTab('category')}
            >
              Danh mục thực phẩm
            </div>
            <div 
              className={`master-data-tab ${activeTab === 'unit' ? 'active' : ''}`} 
              onClick={() => setActiveTab('unit')}
            >
              Đơn vị đo lường
            </div>
            <div 
              className={`master-data-tab ${activeTab === 'recipe' ? 'active' : ''}`} 
              onClick={() => setActiveTab('recipe')}
            >
              Công thức chuẩn
            </div>
          </div>

          <div className="master-data-table-container">
            {activeTab === 'category' && (
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>ID</th>
                    <th style={{ width: '200px' }}>Tên danh mục</th>
                    <th>Mẹo bảo quản mặc định</th>
                    <th style={{ width: '140px' }}>Trạng thái hiển thị</th>
                    <th style={{ width: '100px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px' }}>Chưa có dữ liệu</td>
                    </tr>
                  ) : (
                    categories.map((cat, index) => (
                      <tr key={index}>
                        <td className="text-gray fw-600">
                          CAT-{String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="fw-600">{cat.category}</td>
                        <td className="text-gray">{cat.default_storage_tip || <em style={{color: '#aaa'}}>Chưa có mẹo bảo quản</em>}</td>
                        <td>
                          {cat.is_visible ? (
                            <span className="status-badge success">Hiển thị</span>
                          ) : (
                            <span className="status-badge hidden">Ẩn</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn" onClick={() => openEditModal(cat)} title="Chỉnh sửa">
                              <Pencil size={18} color="#757575" />
                            </button>
                            <button className="action-btn" onClick={() => handleDeleteCategory(cat.category)} title="Xóa">
                              <Trash2 size={18} color="#D32F2F" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {activeTab === 'unit' && (
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '150px' }}>ID</th>
                    <th style={{ width: '300px' }}>Ký hiệu đơn vị</th>
                    <th style={{ width: '150px' }}>Trạng thái</th>
                    <th style={{ width: '150px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td>
                    </tr>
                  ) : units.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>Chưa có đơn vị đo lường nào</td>
                    </tr>
                  ) : (
                    units.map((unit, index) => (
                      <tr key={index}>
                        <td className="text-gray fw-600">
                          UNI-{String(index + 1).padStart(2, '0')}
                        </td>
                        <td className="fw-600">{unit.unit || '-'}</td>
                        <td>
                          {unit.is_visible ? (
                            <span className="status-badge success">Hiển thị</span>
                          ) : (
                            <span className="status-badge hidden">Ẩn</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn" onClick={() => openEditUnitModal(unit)} title="Chỉnh sửa">
                              <Pencil size={18} color="#757575" />
                            </button>
                            <button className="action-btn" onClick={() => handleDeleteUnit(unit.unit)} title="Xóa">
                              <Trash2 size={18} color="#D32F2F" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
            
            {activeTab === 'recipe' && (
              <table className="master-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>ID</th>
                    <th style={{ width: '300px' }}>Tên món ăn chuẩn</th>
                    <th style={{ width: '150px' }}>Người tạo</th>
                    <th style={{ width: '150px' }}>Lượt yêu thích</th>
                    <th style={{ width: '150px' }}>Trạng thái</th>
                    <th style={{ width: '100px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Đang tải dữ liệu...</td>
                    </tr>
                  ) : recipes.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Chưa có công thức chuẩn nào</td>
                    </tr>
                  ) : (
                    recipes.map((recipe, index) => (
                      <tr key={recipe.id}>
                        <td className="text-gray fw-600">
                          REC-{String(index + 101).padStart(3, '0')}
                        </td>
                        <td className="fw-600">{recipe.name}</td>
                        <td className="text-gray fw-500">{recipe.author_id ? 'User' : 'Admin System'}</td>
                        <td className="text-gray">{recipe.likes_count ? `${recipe.likes_count.toLocaleString()} tim` : '0 tim'}</td>
                        <td>
                          {recipe.visibility === 'Public' ? (
                            <span className="status-badge success">Hiển thị</span>
                          ) : (
                            <span className="status-badge hidden">Ẩn</span>
                          )}
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn" onClick={() => openEditRecipeModal(recipe)} title="Chỉnh sửa">
                              <Pencil size={18} color="#757575" />
                            </button>
                            <button className="action-btn" onClick={() => handleDeleteRecipe(recipe)} title="Xóa">
                              <Trash2 size={18} color="#D32F2F" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="md-modal-overlay" onClick={closeModal}>
          <div className="md-modal-content" onClick={e => e.stopPropagation()}>
            <div className="md-modal-header">
              <h2 className="md-modal-title">{modalMode === 'add' ? 'Thêm dữ liệu nền' : 'Chỉnh sửa dữ liệu nền'}</h2>
              <button className="md-modal-close" onClick={closeModal}>✕</button>
            </div>
            
            <div className="md-modal-body">
              <div className="md-form-group">
                <label>Tên dữ liệu / Đơn vị</label>
                <input 
                  type="text" 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  disabled={modalMode === 'edit'} 
                  className={modalMode === 'edit' ? "md-input-disabled" : "md-input"}
                  placeholder="Nhập tên danh mục (vd: Rau củ & Trái cây)..."
                />
              </div>

              <div className="md-form-group">
                <label>Nội dung chi tiết / Ghi chú hệ thống</label>
                <textarea 
                  rows={4}
                  value={formData.default_storage_tip}
                  onChange={(e) => setFormData({...formData, default_storage_tip: e.target.value})}
                  placeholder="Nhập nội dung chi tiết hoặc ghi chú..."
                  className="md-textarea"
                />
              </div>

              <div className="md-form-group">
                <label>Trạng thái hệ thống</label>
                <div className="md-status-toggle">
                  <button 
                    className={`md-status-btn ${formData.is_visible ? 'active-show' : ''}`}
                    onClick={() => setFormData({...formData, is_visible: true})}
                  >
                    Hiển thị
                  </button>
                  <button 
                    className={`md-status-btn ${!formData.is_visible ? 'active-hide' : ''}`}
                    onClick={() => setFormData({...formData, is_visible: false})}
                  >
                    Ẩn
                  </button>
                </div>
              </div>
            </div>
            <div className="md-modal-footer">
              <button className="md-btn md-btn-cancel" onClick={closeModal}>Hủy bỏ</button>
              <button className="md-btn md-btn-save" onClick={handleSaveCategory}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Add Unit Modal */}
      {isUnitModalOpen && (
        <div className="md-modal-overlay" onClick={closeUnitModal}>
          <div className="md-modal-content" onClick={e => e.stopPropagation()}>
            <div className="md-modal-header">
              <h2 className="md-modal-title">{unitModalMode === 'add' ? 'Thêm dữ liệu nền' : 'Chỉnh sửa dữ liệu nền'}</h2>
              <button className="md-modal-close" onClick={closeUnitModal}>✕</button>
            </div>
            
            <div className="md-modal-body">
              <div className="md-form-group">
                <label>Tên dữ liệu / Đơn vị</label>
                <input 
                  type="text" 
                  value={unitFormData.unit} 
                  onChange={(e) => setUnitFormData({...unitFormData, unit: e.target.value})}
                  className="md-input"
                  placeholder="Nhập đơn vị (vd: kg, lít, hộp)..."
                />
              </div>

              <div className="md-form-group">
                <label>Trạng thái hệ thống</label>
                <div className="md-status-toggle">
                  <button 
                    className={`md-status-btn ${unitFormData.is_visible ? 'active-show' : ''}`}
                    onClick={() => setUnitFormData({...unitFormData, is_visible: true})}
                  >
                    Hiển thị
                  </button>
                  <button 
                    className={`md-status-btn ${!unitFormData.is_visible ? 'active-hide' : ''}`}
                    onClick={() => setUnitFormData({...unitFormData, is_visible: false})}
                  >
                    Ẩn
                  </button>
                </div>
              </div>
            </div>
            <div className="md-modal-footer">
              <button className="md-btn md-btn-cancel" onClick={closeUnitModal}>Hủy bỏ</button>
              <button className="md-btn md-btn-save" onClick={handleSaveUnit}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="md-modal-overlay" onClick={closeDeleteModal}>
          <div className="md-modal-content md-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="md-modal-header">
              <h2 className="md-modal-title" style={{color: '#D32F2F'}}>Xóa dữ liệu</h2>
              <button className="md-modal-close" onClick={closeDeleteModal}>✕</button>
            </div>
            <div className="md-modal-body">
              <p style={{fontSize: '15px', color: '#1A1A1A', marginTop: 0}}>
                Bạn có chắc chắn muốn xóa danh mục <strong>"{deletingCategory}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="md-modal-footer" style={{paddingTop: '16px'}}>
              <button className="md-btn md-btn-cancel" onClick={closeDeleteModal}>Hủy</button>
              <button className="md-btn md-btn-delete" onClick={confirmDeleteCategory}>Xóa</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Unit Confirmation Modal */}
      {isDeleteUnitModalOpen && (
        <div className="md-modal-overlay" onClick={closeDeleteUnitModal}>
          <div className="md-modal-content md-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="md-modal-header">
              <h2 className="md-modal-title" style={{color: '#D32F2F'}}>Xóa dữ liệu</h2>
              <button className="md-modal-close" onClick={closeDeleteUnitModal}>✕</button>
            </div>
            <div className="md-modal-body">
              <p style={{fontSize: '15px', color: '#1A1A1A', marginTop: 0}}>
                Bạn có chắc chắn muốn xóa đơn vị <strong>"{deletingUnit}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="md-modal-footer" style={{paddingTop: '16px'}}>
              <button className="md-btn md-btn-cancel" onClick={closeDeleteUnitModal}>Hủy</button>
              <button className="md-btn md-btn-delete" onClick={confirmDeleteUnit}>Xóa</button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Recipe Confirmation Modal */}
      {isDeleteRecipeModalOpen && deletingRecipe && (
        <div className="md-modal-overlay" onClick={closeDeleteRecipeModal}>
          <div className="md-modal-content md-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="md-modal-header">
              <h2 className="md-modal-title" style={{color: '#D32F2F'}}>Xóa dữ liệu</h2>
              <button className="md-modal-close" onClick={closeDeleteRecipeModal}>✕</button>
            </div>
            <div className="md-modal-body">
              <p style={{fontSize: '15px', color: '#1A1A1A', marginTop: 0}}>
                Bạn có chắc chắn muốn xóa công thức <strong>"{deletingRecipe.name}"</strong> không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="md-modal-footer" style={{paddingTop: '16px'}}>
              <button className="md-btn md-btn-cancel" onClick={closeDeleteRecipeModal}>Hủy</button>
              <button className="md-btn md-btn-delete" onClick={confirmDeleteRecipe}>Xóa</button>
            </div>
          </div>
        </div>
      )}
      {/* Recipe Edit/Add Modal */}
      {isRecipeModalOpen && (
        <div className="md-modal-overlay" onClick={closeRecipeModal}>
          <div className="md-modal-content md-modal-lg" onClick={e => e.stopPropagation()} style={{ width: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="md-modal-header">
              <h2 className="md-modal-title">
                {recipeModalMode === 'add' ? 'Thêm công thức chuẩn hệ thống' : 'Chỉnh sửa công thức chuẩn hệ thống'}
              </h2>
              <button className="md-modal-close" onClick={closeRecipeModal}>✕</button>
            </div>
            
            <div className="md-modal-body">
              {/* Basic Fields */}
              <div className="md-form-group">
                <label className="md-form-label">Tên món ăn</label>
                <input 
                  type="text" 
                  className="md-input" 
                  value={recipeFormData.name}
                  onChange={(e) => setRecipeFormData({...recipeFormData, name: e.target.value})}
                  placeholder="Canh Cà Chua Trứng Đậu Hũ"
                />
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="md-form-group" style={{ flex: 1 }}>
                  <label className="md-form-label">Khẩu phần (Người)</label>
                  <input 
                    type="number" 
                    className="md-input" 
                    value={recipeFormData.servings}
                    onChange={(e) => setRecipeFormData({...recipeFormData, servings: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="md-form-group" style={{ flex: 1 }}>
                  <label className="md-form-label">Thời gian nấu (Phút)</label>
                  <input 
                    type="number" 
                    className="md-input" 
                    value={recipeFormData.cooking_time}
                    onChange={(e) => setRecipeFormData({...recipeFormData, cooking_time: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="md-form-group" style={{ flex: 1 }}>
                  <label className="md-form-label">Độ khó</label>
                  <select 
                    className="md-input" 
                    value={recipeFormData.difficulty || 'Trung bình'}
                    onChange={(e) => setRecipeFormData({...recipeFormData, difficulty: e.target.value as any})}
                  >
                    <option value="Dễ">Dễ</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Khó">Khó</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F0F0F0', margin: '20px 0' }}></div>

              {/* Ingredients List */}
              <label className="md-form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Danh sách Nguyên liệu quy chuẩn</label>
              <div style={{ display: 'flex', gap: '8px', color: '#9E9E9E', fontSize: '11px', fontWeight: 600, padding: '0 4px', marginBottom: '8px' }}>
                <div style={{ flex: 2 }}>Tên nguyên liệu</div>
                <div style={{ flex: 1 }}>Số lượng</div>
                <div style={{ flex: 1 }}>Đơn vị</div>
                <div style={{ width: '20px' }}></div>
              </div>
              
              {recipeFormData.ingredients?.map((ing: any, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    className="md-input" 
                    style={{ flex: 2, height: '36px', marginBottom: 0 }}
                    value={ing.name}
                    onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                  />
                  <input 
                    type="number" 
                    className="md-input" 
                    style={{ flex: 1, height: '36px', marginBottom: 0 }}
                    value={ing.quantity}
                    onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="md-input" 
                    style={{ flex: 1, height: '36px', marginBottom: 0 }}
                    value={ing.unit}
                    onChange={(e) => handleIngredientChange(idx, 'unit', e.target.value)}
                  />
                  <button 
                    onClick={() => removeIngredient(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BDBDBD', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              <button 
                onClick={addIngredient}
                style={{ width: '100%', height: '36px', background: 'white', border: '1px dashed #D1C4E9', borderRadius: '8px', color: '#7C4DFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}
              >
                + Thêm nguyên liệu
              </button>

              <div style={{ borderTop: '1px solid #F0F0F0', margin: '20px 0' }}></div>

              {/* Instructions List */}
              <label className="md-form-label" style={{ fontSize: '14px', marginBottom: '8px' }}>Các bước thực hiện</label>
              {recipeFormData.instructions?.map((step: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                  <div style={{ width: '26px', height: '26px', background: '#F3E5F5', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#7C4DFF', fontSize: '11px', fontWeight: 'bold', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <input 
                    type="text" 
                    className="md-input" 
                    style={{ flex: 1, height: '36px', marginBottom: 0 }}
                    value={step}
                    onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  />
                  <button 
                    onClick={() => removeInstruction(idx)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#BDBDBD', padding: '4px' }}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button 
                onClick={addInstruction}
                style={{ width: '100%', height: '36px', background: 'white', border: '1px dashed #D1C4E9', borderRadius: '8px', color: '#7C4DFF', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '8px' }}
              >
                + Thêm bước nấu
              </button>

              <div style={{ borderTop: '1px solid #F0F0F0', margin: '20px 0' }}></div>

              {/* Status Toggle */}
              <div className="md-form-group">
                <label className="md-form-label">Trạng thái hệ thống</label>
                <div className="md-status-toggle">
                  <button 
                    className={`md-status-btn ${recipeFormData.visibility === 'Public' ? 'active success' : ''}`}
                    onClick={() => setRecipeFormData({...recipeFormData, visibility: 'Public'})}
                  >
                    Hiển thị
                  </button>
                  <button 
                    className={`md-status-btn ${recipeFormData.visibility === 'Private' ? 'active hidden' : ''}`}
                    onClick={() => setRecipeFormData({...recipeFormData, visibility: 'Private'})}
                  >
                    Ẩn
                  </button>
                </div>
              </div>

            </div>
            
            <div className="md-modal-footer">
              <button className="md-btn md-btn-cancel" onClick={closeRecipeModal}>Hủy bỏ</button>
              <button className="md-btn md-btn-save" onClick={handleSaveRecipe}>Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDataAdmin;
