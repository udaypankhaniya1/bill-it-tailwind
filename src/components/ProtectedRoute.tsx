
import { useState, useEffect, ReactNode } from 'react';
import { NewSidebar } from './NewSidebar';
import TopBar from './TopBar';
import { useMediaQuery } from '@/hooks/use-media-query';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Close sidebar by default on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
      <NewSidebar 
        isMobile={isMobile} 
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={toggleSidebar}
      />
      <div className="flex-1 flex flex-col">
        <TopBar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ProtectedRoute;
