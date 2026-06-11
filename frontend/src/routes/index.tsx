import { createBrowserRouter, Outlet } from 'react-router-dom';

// Guest pages
import Login from '../pages/guest/Login';
import Register from '../pages/guest/Register';
import RoleSelection from '../pages/guest/RoleSelection';

// Homemaker pages
import DashboardHomemaker from '../pages/homemaker/Dashboard';
import FridgeHomemaker from '../pages/homemaker/FridgeHomemaker';
import ShoppingListHomemaker from '../pages/homemaker/ShoppingListHomemaker';
import RecipeSmartSuggestions from '../pages/homemaker/RecipeSmartSuggestions';
import MealPlanner from '../pages/homemaker/MealPlanner';
import ProfileScreen from '../pages/homemaker/Profile/ProfileScreen';
import HomemakerLayout from '../components/homemaker/HomemakerLayout';
import MemberLayout from '../components/member/MemberLayout';
import AdminLayout from '../components/admin/AdminLayout';
import DashboardAdmin from '../pages/admin/Dashboard';
import UserManagementAdmin from '../pages/admin/UserManagement';
import CreateGroup from '../pages/homemaker/CreateGroup';

export const router = createBrowserRouter([
  // Guest Routes
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/choose-role',
    element: <RoleSelection />,
  },
  {
    path: '/homemaker/create-group',
    element: <CreateGroup />,
  },

  // Homemaker Routes
  {
    path: '/homemaker',
    element: <HomemakerLayout />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardHomemaker />,
      },
      {
        path: 'fridge',
        element: <FridgeHomemaker />,
      },
      {
        path: 'shopping-list',
        element: <ShoppingListHomemaker />,
      },
      {
        path: 'recipes',
        element: <RecipeSmartSuggestions />,
      },
      {
        path: 'meal-planner',
        element: <MealPlanner />,
      },
      {
        path: 'profile',
        element: <ProfileScreen />,
      }
    ]
  },

  // Member Routes
  {
    path: '/member',
    element: <MemberLayout />,
    children: [
      {
        path: 'dashboard',
        element: <div className="placeholder-page"><h3>Màn hình: Dashboard Member</h3><p>Đây là trang chủ dành cho Thành viên gia đình.</p></div>,
      },
      {
        path: 'refrigerator',
        element: <div className="placeholder-page"><h3>Màn hình: Tủ lạnh Member</h3><p>Xem danh sách thực phẩm trong tủ lạnh.</p></div>,
      },
      {
        path: 'shopping-list',
        element: <div className="placeholder-page"><h3>Màn hình: Mua sắm Member</h3><p>Xem danh sách cần mua sắm.</p></div>,
      },
      {
        path: 'profile',
        element: <div className="placeholder-page"><h3>Màn hình: Hồ sơ Member</h3><p>Thông tin cá nhân thành viên.</p></div>,
      }
    ]
  },

  // Admin Routes
  {
    path: '/admin',
    element: <Outlet />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardAdmin />,
      },
      {
        path: 'users',
        element: <UserManagementAdmin />,
      },
      {
        path: 'settings',
        element: <div className="placeholder-page"><h3>Cài đặt hệ thống</h3><p>Cấu hình các tham số vận hành.</p></div>,
      }
    ]
  },
]);
