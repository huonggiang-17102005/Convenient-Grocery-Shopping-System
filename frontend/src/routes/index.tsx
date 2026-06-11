import { createBrowserRouter, Outlet } from 'react-router-dom';

// Guest pages
import Login from '../pages/guest/Login';
import Register from '../pages/guest/Register';
import RoleSelection from '../pages/guest/RoleSelection';

// Layouts
import HomemakerLayout from '../components/homemaker/HomemakerLayout';
import MemberLayout from '../components/member/MemberLayout';

// Admin pages
import DashboardAdmin from '../pages/admin/Dashboard';
import UserManagementAdmin from '../pages/admin/UserManagement';

// Role-specific pages (đặc thù từng role, không dùng chung)
import FridgeHomemaker from '../pages/homemaker/FridgeHomemaker';
import CreateGroup from '../pages/homemaker/CreateGroup';
import Jointhegroup from '../pages/member/Jointhegroup';

// Common pages (feature-based, dùng chung cho cả 2 role)
import { HomemakerDashboard, MemberDashboard } from '../pages/common/dashboard';
import { HomemakerMealPlanner, MemberMealPlanner } from '../pages/common/meal-planner';
import { HomemakerShoppingList, MemberShoppingList } from '../pages/common/shopping-list';
import { HomemakerProfile, MemberProfile } from '../pages/common/profile';
import { HomemakerRecipes, MemberRecipes } from '../pages/common/recipes';

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
  {
    path: '/member/join-group',
    element: <Jointhegroup />,
  },

  // Homemaker Routes
  {
    path: '/homemaker',
    element: <HomemakerLayout />,
    children: [
      {
        path: 'dashboard',
        element: <HomemakerDashboard />,
      },
      {
        path: 'fridge',
        element: <FridgeHomemaker />,
      },
      {
        path: 'shopping-list',
        element: <HomemakerShoppingList />,
      },
      {
        path: 'recipes',
        element: <HomemakerRecipes />,
      },
      {
        path: 'meal-planner',
        element: <HomemakerMealPlanner />,
      },
      {
        path: 'profile',
        element: <HomemakerProfile />,
      },
    ],
  },

  // Member Routes
  {
    path: '/member',
    element: <MemberLayout />,
    children: [
      {
        path: 'dashboard',
        element: <MemberDashboard />,
      },
      {
        path: 'refrigerator',
        element: <div className="placeholder-page"><h3>Màn hình: Tủ lạnh Member</h3><p>Xem danh sách thực phẩm trong tủ lạnh.</p></div>,
      },
      {
        path: 'shopping-list',
        element: <MemberShoppingList />,
      },
      {
        path: 'recipes',
        element: <MemberRecipes />,
      },
      {
        path: 'meal-planner',
        element: <MemberMealPlanner />,
      },
      {
        path: 'profile',
        element: <MemberProfile />,
      },
    ],
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
      },
    ],
  },
]);
