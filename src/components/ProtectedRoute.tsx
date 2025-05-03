
import { useState, useEffect, ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';
import TopBar from './TopBar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { SidebarProvider } from '@/components/ui/sidebar';

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
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-950">
        {/* Sidebar */}
        <AppSidebar 
          isMobile={isMobile} 
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={toggleSidebar}
        />
        
        {/* Main content area */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen && !isMobile ? 'ml-64' : 'ml-0'}`}>
          <TopBar onMenuClick={toggleSidebar} isSidebarOpen={isSidebarOpen} />
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default ProtectedRoute;
