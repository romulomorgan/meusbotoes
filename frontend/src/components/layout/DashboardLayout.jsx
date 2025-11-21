import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  MousePointer2, 
  CreditCard, 
  Settings, 
  LogOut, 
  Users,
  Menu,
  ShoppingBag,
  BellRing,
  ArrowLeft
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname === to;
    return (
      <Link to={to}>
        <Button 
          variant={isActive ? "secondary" : "ghost"} 
          className="w-full justify-start gap-2 mb-1"
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-4">
      <div className="px-6 mb-6">
        <h2 className="text-lg font-bold tracking-tight">Meus Botões</h2>
        <p className="text-xs text-muted-foreground">Painel de Controle</p>
      </div>
      
      <div className="flex-1 px-4 space-y-1">
        <NavItem to="/painel" icon={LayoutDashboard} label="Visão Geral" />
        <NavItem to="/meus-botoes" icon={MousePointer2} label="Meus Botões" />
        <NavItem to="/planos" icon={ShoppingBag} label="Assinar Planos" />
        <NavItem to="/meus-planos" icon={CreditCard} label="Meu Plano" />
        <NavItem to="/configuracoes" icon={Settings} label="Configurações" />
        
        {user?.role === 'admin' && (
          <>
            <div className="my-4 border-t border-border/50" />
            <p className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase">Admin</p>
            <NavItem to="/admin/usuarios" icon={Users} label="Usuários" />
            <NavItem to="/admin/pagamentos" icon={CreditCard} label="Pagamentos" />
            <NavItem to="/admin/renovacoes" icon={BellRing} label="Avisos Renovação" />
          </>
        )}
      </div>

      <div className="px-4 mt-auto">
        <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-lg bg-muted/50">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );

  // Check if we are on the root dashboard page to decide whether to show "Voltar"
  const isRootDashboard = location.pathname === '/painel';

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-background fixed inset-y-0 z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="font-bold">Meus Botões</span>
        </div>
        
        {/* Mobile Logout/Back */}
        <div className="flex items-center gap-2">
           {!isRootDashboard && (
             <Button variant="ghost" size="icon" onClick={handleBack} title="Voltar">
               <ArrowLeft className="h-5 w-5" />
             </Button>
           )}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        {/* Desktop Header / Breadcrumb Area (Optional, but good for "Voltar") */}
        <div className="hidden md:flex h-16 items-center px-8 border-b bg-background/50 backdrop-blur sticky top-0 z-40">
           {!isRootDashboard && (
             <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2 text-muted-foreground hover:text-foreground">
               <ArrowLeft className="h-4 w-4" />
               Voltar
             </Button>
           )}
        </div>

        <div className="container p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
