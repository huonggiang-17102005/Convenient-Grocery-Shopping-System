import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './RecipeApproval.css';
import './Dashboard.css'; // Reusing sidebar styling
import RecipeApprovalModal from './RecipeApprovalModal';

interface AuthorInfo {
  full_name: string;
}

interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

interface PendingRecipe {
  id: string;
  name: string;
  author: AuthorInfo | null;
  created_at: string;
  image_url: string | null;
  description?: string;
  servings?: number;
  ingredients?: Ingredient[];
  instructions?: string[];
}

const RecipeApprovalAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<PendingRecipe[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedRecipe, setSelectedRecipe] = useState<PendingRecipe | null>(null);

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  const fetchPendingRecipes = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/admin/recipes/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!res.ok) {
        throw new Error('Không thể tải danh sách công thức chờ duyệt');
      }
      const data = await res.json();
      setRecipes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/recipes/${id}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setRecipes(recipes.filter(r => r.id !== id));
        setSelectedRecipe(null);
      } else {
        alert('Lỗi khi phê duyệt');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi phê duyệt');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/recipes/${id}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        setRecipes(recipes.filter(r => r.id !== id));
        setSelectedRecipe(null);
      } else {
        alert('Lỗi khi từ chối');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi khi từ chối');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const date = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    return `${time} - ${date}`;
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
          <div className="admin-db-nav-item active" onClick={() => navigate('/admin/recipe-approval')}>
            <div className="admin-db-nav-text">Kiểm duyệt nội dung</div>
          </div>
          <div className="admin-db-nav-item" onClick={() => navigate('/admin/master-data')}>
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
      <div className="recipe-approval-main">
        <h1 className="recipe-approval-title">Kiểm duyệt công thức</h1>
        {loading ? (
          <div>Đang tải danh sách công thức...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : recipes.length === 0 ? (
          <div>Không có công thức nào đang chờ duyệt.</div>
        ) : (
          <div className="recipe-approval-grid">
            {recipes.map((recipe) => (
              <div 
                className="recipe-approval-card" 
                key={recipe.id} 
                onClick={() => setSelectedRecipe(recipe)}
                style={{ cursor: 'pointer' }}
              >
                <div className="recipe-approval-img-container">
                  {recipe.image_url ? (
                    <img 
                      src={recipe.image_url} 
                      alt={recipe.name} 
                      className="recipe-approval-img" 
                      onError={(e) => {
                        e.currentTarget.onerror = null; // Prevent infinite loop if fallback also fails
                        e.currentTarget.src = 'https://placehold.co/500x300/e0e0e0/757575?text=L%E1%BB%97i+%E1%BA%A3nh';
                      }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', color: '#757575' }}>
                      Không có ảnh
                    </div>
                  )}
                </div>
                <div className="recipe-approval-info">
                  <div className="recipe-approval-name">{recipe.name}</div>
                  <div className="recipe-approval-author">Người đăng: {recipe.author?.full_name || 'Không rõ'}</div>
                  <div className="recipe-approval-time">Gửi lúc: {formatDate(recipe.created_at)}</div>
                </div>
                <div className="recipe-approval-badge-container">
                  <div className="recipe-approval-badge">Trạng thái: Chờ duyệt</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {selectedRecipe && (
        <RecipeApprovalModal 
          recipe={selectedRecipe} 
          onClose={() => setSelectedRecipe(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default RecipeApprovalAdmin;
