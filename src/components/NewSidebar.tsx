
import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Home, FileText, Plus, Settings, LogOut, User, Menu, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: SidebarItem[];
  onClick?: () => void;
};

interface SidebarProps {
  isMobile: boolean;
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export const NewSidebar = ({ isMobile, isSidebarOpen, onSidebarToggle }: SidebarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Toggle submenu
  const toggleMenu = (title: string) => {
    if (openMenus.includes(title)) {
      setOpenMenus(openMenus.filter(item => item !== title));
    } else {
      setOpenMenus([...openMenus, title]);
    }
  };

  // Check if a path is active
  const isActive = (path: string): boolean => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };

  // Sidebar items with nested structure
  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      icon: <Home className="h-5 w-5" />,
      path: '/dashboard',
    },
    {
      title: 'Invoices',
      icon: <FileText className="h-5 w-5" />,
      children: [
        {
          title: 'Create Invoice',
          icon: <FilePlus className="h-4 w-4" />,
          path: '/create-invoice',
        },
        {
          title: 'All Invoices',
          icon: <FileText className="h-4 w-4" />,
          path: '/invoices',
        }
      ]
    },
    {
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      children: [
        {
          title: 'Templates',
          icon: <FileText className="h-4 w-4" />,
          path: '/settings',
        },
        {
          title: 'User Profile',
          icon: <User className="h-4 w-4" />,
          path: '/profile',
        }
      ]
    },
    {
      title: 'Logout',
      icon: <LogOut className="h-5 w-5" />,
      onClick: handleLogout
    }
  ];

  // Sidebar menu item component
  const SidebarMenuItem = ({ item }: { item: SidebarItem }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isMenuOpen = openMenus.includes(item.title);
    const active = item.path ? isActive(item.path) : false;
    const activeChild = item.children?.some(child => child.path && isActive(child.path));

    return (
      <div className="w-full">
        <div
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.title);
            } else if (item.path) {
              navigate(item.path);
              if (isMobile) onSidebarToggle();
            } else if (item.onClick) {
              item.onClick();
              if (isMobile) onSidebarToggle();
            }
          }}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-md cursor-pointer mb-1 transition-all",
            (active || activeChild) 
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" 
              : "hover:bg-gray-100 dark:hover:bg-gray-800"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center",
              (active || activeChild) ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "font-medium text-sm transition-opacity duration-200",
              isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100",
              (active || activeChild) ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
            )}>{item.title}</span>
          </div>
          {hasChildren && (
            <div className={cn(
              "transition-opacity duration-200",
              isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
            )}>
              {isMenuOpen ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </div>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && isMenuOpen && (
          <div className={cn(
            "pl-4 mb-2 border-l-2 border-gray-200 dark:border-gray-700 ml-6 transition-all",
            isSidebarOpen ? "opacity-100 max-h-96" : "opacity-0 max-h-0 lg:group-hover:opacity-100 lg:group-hover:max-h-96"
          )}>
            {item.children.map((child, index) => (
              <div
                key={index}
                onClick={() => {
                  if (child.path) {
                    navigate(child.path);
                    if (isMobile) onSidebarToggle();
                  } else if (child.onClick) {
                    child.onClick();
                    if (isMobile) onSidebarToggle();
                  }
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer mb-1 transition-all",
                  child.path && isActive(child.path)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center",
                  child.path && isActive(child.path) ? "text-blue-700 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"
                )}>
                  {child.icon}
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  child.path && isActive(child.path) ? "text-blue-700 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                )}>{child.title}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Mobile sidebar content
  const SidebarContent = () => (
    <div className="py-4 h-full flex flex-col">
      <div className="px-3 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="transition-opacity duration-200">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">InvoiceMaster</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Professional Invoices</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          {sidebarItems.map((item, index) => (
            <SidebarMenuItem key={index} item={item} />
          ))}
        </div>
      </div>
    </div>
  );

  // Desktop sidebar
  if (!isMobile) {
    return (
      <div
        className={cn(
          "group h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 flex flex-col overflow-hidden",
          isSidebarOpen ? "w-64" : "w-16 hover:w-64"
        )}
      >
        <SidebarContent />
      </div>
    );
  }

  // Mobile sidebar (sheet)
  return (
    <Sheet open={isSidebarOpen} onOpenChange={onSidebarToggle}>
      <SheetContent side="left" className="p-0 w-[280px]">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};

export default NewSidebar;
