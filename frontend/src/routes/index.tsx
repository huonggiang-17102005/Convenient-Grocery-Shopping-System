import { createBrowserRouter } from 'react-router-dom';

// Guest pages
import Auth from '../pages/guest/Auth';
import RoleSelection from '../pages/guest/RoleSelection';
import CreateGroup from '../pages/guest/CreateGroup';

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
    element: <Auth />,
  },
  {
    path: '/choose-role',
    element: <RoleSelection />,
  },
  {
    path: '/create-group',
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
  },

  // Admin Routes Placeholder
  {
    path: '/admin',
    element: <div>Admin Layout...</div>,
  },
]);
