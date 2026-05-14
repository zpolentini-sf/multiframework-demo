import type { RouteObject } from 'react-router';
import AppLayout from '@/appLayout';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
        handle: { showInNavigation: true, label: 'Opportunities' },
      },
      {
        path: 'analytics',
        element: <Analytics />,
        handle: { showInNavigation: true, label: 'Analytics' },
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
];
