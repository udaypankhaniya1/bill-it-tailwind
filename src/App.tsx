import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

// Pages
import DashboardPage from '@/pages/DashboardPage';
import InvoicesPage from '@/pages/InvoicesPage';
import InvoiceViewPage from '@/pages/InvoiceViewPage';
import CreateInvoicePage from '@/pages/CreateInvoicePage';
import SettingsPage from '@/pages/SettingsPage';
import DescriptionsPage from '@/pages/DescriptionsPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import NotFound from '@/pages/NotFound';
import ProfilePage from '@/pages/ProfilePage';

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
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><InvoiceViewPage /></ProtectedRoute>} />
        <Route path="/create-invoice" element={<ProtectedRoute><CreateInvoicePage /></ProtectedRoute>} />
        <Route path="/descriptions" element={<ProtectedRoute><DescriptionsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
