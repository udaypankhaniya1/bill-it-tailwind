import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Lazy load pages for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const InvoicesPage = lazy(() => import('@/pages/InvoicesPage'));
const InvoiceViewPage = lazy(() => import('@/pages/InvoiceViewPage'));
const CreateInvoicePage = lazy(() => import('@/pages/CreateInvoicePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const DescriptionsPage = lazy(() => import('@/pages/DescriptionsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));

// Auth pages - not lazy loaded for faster initial access
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import { Toaster } from '@/components/ui/toaster';

// Utils
import { initializeTheme, applyThemeStyles } from '@/utils/themeUtils';
import { ThemeOption } from './redux/slices/templateSlice';
import { useAuth } from './lib/auth';
import { setTheme } from './redux/slices/layoutSlice';

const App = () => {
  const dispatch = useDispatch();
  const themes = useSelector((state: RootState) => state.template.themes);
  const { user, loading } = useAuth();
  
  // Initialize theme from local storage
  useEffect(() => {
    const { themeId, fontFamily } = initializeTheme();
    
    // Set the theme in Redux store
    dispatch({ type: 'template/setCurrentTheme', payload: themeId });
    
    // Find the theme and apply it
    const theme = themes.find((t: ThemeOption) => t.id === themeId);
    if (theme) {
      applyThemeStyles(theme, fontFamily);
      dispatch(setTheme(theme.mode as 'light' | 'dark'));
    }
  }, [dispatch, themes]);
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading authentication...</div>;
  }
  
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading dashboard...</div>}>
              <DashboardPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/invoices" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading invoices...</div>}>
              <InvoicesPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/invoices/:id" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading invoice...</div>}>
              <InvoiceViewPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/create-invoice" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading editor...</div>}>
              <CreateInvoicePage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/descriptions" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading descriptions...</div>}>
              <DescriptionsPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading settings...</div>}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading profile...</div>}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </ErrorBoundary>
  );
};

export default App;
