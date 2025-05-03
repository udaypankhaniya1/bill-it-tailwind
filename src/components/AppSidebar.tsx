
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Plus, Settings, LogOut, Menu } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';

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

  const handleLogout = () => {
    dispatch(logout());
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

  // Mobile sidebar (sheet)
  if (isMobile) {
    return (
      <Sheet open={isSidebarOpen} onOpenChange={onSidebarToggle}>
        <SheetContent side="left" className="p-0 w-[280px] bg-sidebar border-sidebar-border">
          <div className="flex flex-col h-full bg-sidebar p-4">
            <div className="flex items-center mb-6 gap-3">
              <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
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
                      <span className="font-medium text-sm">
                        {item.title}
                      </span>
                    </NavLink>
                  ) : (
                    <div
                      onClick={item.onClick}
                      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer hover:bg-sidebar-accent transition-colors"
                    >
                      <div>{item.icon}</div>
                      <span className="font-medium text-sm">
                        {item.title}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">InvoiceMaster</h2>
            <p className="text-xs text-muted-foreground">Professional Invoices</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {sidebarItems.map((item, index) => (
            <SidebarMenuItem key={index}>
              {item.path ? (
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive(item.path)}
                  tooltip={item.title}
                >
                  <NavLink to={item.path}>
                    {item.icon}
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton onClick={item.onClick} tooltip={item.title}>
                  {item.icon}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSidebar;
