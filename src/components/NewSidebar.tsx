
import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Home, FileText, Plus, Settings, LogOut, User, Menu, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { RootState } from '@/redux/store';
import { ThemeOption } from '@/redux/slices/templateSlice';
import { useAuth } from '@/lib/auth';

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
  const { signOut } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const currentThemeId = useSelector((state: RootState) => state.template.currentTheme);
  const themes = useSelector((state: RootState) => state.template.themes);
  
  const currentTheme = themes.find((theme: ThemeOption) => theme.id === currentThemeId) || themes[0];
  const isDarkMode = currentTheme.mode === 'dark';

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
  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logging out",
        description: "Signing you out...",
      });
      
      // The auth state change listener will redirect the user
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was a problem signing you out. Please try again.",
      });
    }
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
    
    const primaryColor = currentTheme.colors.primary;
    const activeBgColor = isDarkMode ? `${primaryColor}20` : `${primaryColor}10`;
    const activeTextColor = primaryColor;

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
              ? "bg-primary/10 text-primary" 
              : "hover:bg-background/80"
          )}
        >
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center",
              (active || activeChild) ? "text-primary" : "text-muted-foreground"
            )}>
              {item.icon}
            </div>
            <span className={cn(
              "font-medium text-sm transition-opacity duration-200",
              isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100",
              (active || activeChild) ? "text-primary" : "text-foreground"
            )}>{item.title}</span>
          </div>
          {hasChildren && (
            <div className={cn(
              "transition-opacity duration-200",
              isSidebarOpen ? "opacity-100" : "opacity-0 lg:group-hover:opacity-100"
            )}>
              {isMenuOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          )}
        </div>

        {/* Submenu */}
        {hasChildren && isMenuOpen && (
          <div className={cn(
            "pl-4 mb-2 border-l-2 border-border ml-6 transition-all",
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
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-background/80"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center",
                  child.path && isActive(child.path) ? "text-primary" : "text-muted-foreground"
                )}>
                  {child.icon}
                </div>
                <span className={cn(
                  "font-medium text-sm",
                  child.path && isActive(child.path) ? "text-primary" : "text-foreground"
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
    <div className="py-4 h-full flex flex-col bg-sidebar">
      <div className="px-3 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          {isSidebarOpen && (
            <div className="transition-opacity duration-200">
              <h2 className="text-lg font-bold text-sidebar-foreground">InvoiceMaster</h2>
              <p className="text-xs text-muted-foreground">Professional Invoices</p>
            </div>
          )}
        </div>
        
        <div className="border-t border-sidebar-border pt-4">
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
          "group fixed-sidebar bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col overflow-hidden",
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
      <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border">
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
};

export default NewSidebar;
