
import { useState, useEffect, ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import TopBar from './TopBar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { setSidebarOpen } from '@/redux/slices/layoutSlice';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const dispatch = useDispatch();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isSidebarOpen = useSelector((state: RootState) => state.layout.sidebarOpen);
  
  // Check for authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);
  
  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    } else {
      dispatch(setSidebarOpen(true));
    }
  }, [isMobile, dispatch]);

  const toggleSidebar = () => {
    dispatch(setSidebarOpen(!isSidebarOpen));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <AppSidebar 
        isMobile={isMobile} 
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={toggleSidebar}
      />
      
      {/* Main content area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300", 
        isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
      )}>
        <TopBar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
