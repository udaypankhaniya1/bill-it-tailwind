
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { FileText, Plus, Home, Settings, LogOut, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export const AppSidebar = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toggleSidebar, state } = useSidebar();
  
  const handleLogout = () => {
    // In a real app, sign out from Supabase
    dispatch(logout());
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };

  const isExpanded = state === 'expanded';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-6 py-4">
          {isExpanded && (
            <div>
              <h2 className="text-xl font-bold text-invoice-blue">InvoiceMaster</h2>
              <p className="text-sm text-gray-500">Create professional invoices</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="ml-auto"
          >
            {isExpanded ? <ChevronLeft /> : <ChevronRight />}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={!isExpanded ? "Dashboard" : undefined}>
                <NavLink to="/dashboard" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <Home className="h-5 w-5" />
                  {isExpanded && <span>Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={!isExpanded ? "Create Invoice" : undefined}>
                <NavLink to="/create-invoice" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <Plus className="h-5 w-5" />
                  {isExpanded && <span>Create Invoice</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={!isExpanded ? "Invoices" : undefined}>
                <NavLink to="/invoices" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <FileText className="h-5 w-5" />
                  {isExpanded && <span>Invoices</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={!isExpanded ? "Settings" : undefined}>
                <NavLink to="/settings" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <Settings className="h-5 w-5" />
                  {isExpanded && <span>Settings</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 text-red-500" tooltip={!isExpanded ? "Logout" : undefined}>
              <LogOut className="h-5 w-5" />
              {isExpanded && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
