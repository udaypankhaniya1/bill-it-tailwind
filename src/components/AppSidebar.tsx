
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Plus, Settings, LogOut, User, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  onClick?: () => void;
};

interface AppSidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export const AppSidebar = ({ isMobile, isSidebarOpen, onSidebarToggle }: AppSidebarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useDispatch();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };

  // Define sidebar menu items
  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      title: 'Create Invoice',
      icon: <Plus className="h-5 w-5" />,
      path: '/create-invoice',
    },
    {
      title: 'Invoices',
      icon: <FileText className="h-5 w-5" />,
      path: '/invoices',
    },
    {
      title: 'Profile',
      icon: <User className="h-5 w-5" />,
      path: '/profile',
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      path: '/settings',
    },
    {
      title: 'Logout',
      icon: <LogOut className="h-5 w-5 text-red-500" />,
      onClick: handleLogout
    }
  ];

  // Check if a path is active
  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  // Sidebar content
  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar p-4">
      <div className="flex items-center mb-6 gap-3">
        <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className={cn("transition-opacity duration-200", isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100")}>
          <h2 className="text-lg font-bold">InvoiceMaster</h2>
          <p className="text-xs text-muted-foreground">Professional Invoices</p>
        </div>
      </div>
      
      <div className="flex flex-col flex-1 gap-2">
        {sidebarItems.map((item, index) => (
          <div key={index}>
            {item.path ? (
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "hover:bg-sidebar-accent"
                )}
              >
                <div>{item.icon}</div>
                <span className={cn(
                  "font-medium text-sm transition-opacity duration-200",
                  isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
                )}>
                  {item.title}
                </span>
              </NavLink>
            ) : (
              <div
                onClick={item.onClick}
                className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-sidebar-accent transition-colors"
              >
                <div>{item.icon}</div>
                <span className={cn(
                  "font-medium text-sm transition-opacity duration-200",
                  isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
                )}>
                  {item.title}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // Desktop sidebar
  if (!isMobile) {
    return (
      <div
        className={cn(
          "fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
          isSidebarOpen ? "w-64" : "w-16"
        )}
      >
        <SidebarContent />
      </div>
    );
  }

  // Mobile sidebar (sheet)
  return (
    <Sheet open={isSidebarOpen} onOpenChange={onSidebarToggle}>
      <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};

export default AppSidebar;
