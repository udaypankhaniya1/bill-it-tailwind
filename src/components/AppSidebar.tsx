
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
} from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/slices/authSlice';
import { FileText, Plus, Home, Settings, LogOut } from 'lucide-react';

export const AppSidebar = () => {
  const { toast } = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // In a real app, sign out from Supabase
    dispatch(logout());
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-6 py-4">
          <h2 className="text-xl font-bold text-invoice-blue">InvoiceMaster</h2>
          <p className="text-sm text-gray-500">Create professional invoices</p>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/dashboard" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/create-invoice" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <Plus className="h-5 w-5" />
                  <span>Create Invoice</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/invoices" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <FileText className="h-5 w-5" />
                  <span>Invoices</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink to="/settings" className={({ isActive }) => 
                  isActive ? 'flex items-center gap-3 text-invoice-blue font-medium' : 'flex items-center gap-3'
                }>
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 text-red-500">
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
