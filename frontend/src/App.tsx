import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import AppProviders from './contexts/AppProviders';

export default function App() {
  return (
    <AppProviders>
      <div className="App">
        <RouterProvider router={router} />
      </div>
    </AppProviders>
  );
}
