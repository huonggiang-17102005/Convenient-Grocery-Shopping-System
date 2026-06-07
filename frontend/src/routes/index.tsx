import { createBrowserRouter } from 'react-router-dom';

// Guest pages
import Login from '../pages/guest/Login';
import Register from '../pages/guest/Register';
import RoleSelection from '../pages/guest/RoleSelection';

// Homemaker pages
import DashboardHomemaker from '../pages/homemaker/DashboardHomemaker';
import RefrigeratorHomemaker from '../pages/homemaker/RefrigeratorHomemaker';
import ShoppingListHomemaker from '../pages/homemaker/ShoppingListHomemaker';
import RecipeSmartSuggestions from '../pages/homemaker/RecipeSmartSuggestions';
import MealPlanner from '../pages/homemaker/MealPlanner';
import ProfileGroupManagement from '../pages/homemaker/ProfileGroupManagement';
import HomemakerLayout from '../components/layout/HomemakerLayout';

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
        path: 'refrigerator',
        element: <RefrigeratorHomemaker />,
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
        element: <ProfileGroupManagement />,
      }
    ]
  },

  // Member Routes Placeholder
  {
    path: '/member',
    element: <div>Member Layout...</div>,
    children: [
      {
        path: 'dashboard',
        element: <div style={{ padding: '24px' }}><h1>Dashboard Thành viên gia đình (Đang xây dựng...)</h1></div>,
      }
    ]
  },

  // Admin Routes Placeholder
  {
    path: '/admin',
    element: <div>Admin Layout...</div>,
  },
]);
