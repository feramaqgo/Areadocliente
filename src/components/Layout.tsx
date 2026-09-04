import React, { useState } from 'react';
import { 
  FileText, 
  Wrench, 
  Cpu, 
  BookOpen, 
  BarChart2, 
  Bell, 
  LogOut, 
  User, 
  Menu, 
  X, 
  Search,
  Settings,
  HelpCircle,
  Megaphone
} from 'lucide-react';
import { Usuario } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: Usuario | null;
  currentRoute: string;
  onNavigate: (route: string, entityId?: string) => void;
  onLogout: () => void;
  unreadCount: number;
  onMarkNotificationsRead: () => void;
}

export default function Layout({ 
  children, 
  currentUser, 
  currentRoute, 
  onNavigate, 
  onLogout,
  unreadCount,
  onMarkNotificationsRead
}: LayoutProps) {
  const [mobileMenuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Cpu },
    { id: 'orcamentos', label: 'Orçamentos', icon: FileText },
    { id: 'chamados', label: 'Chamados', icon: Wrench },
    { id: 'maquinas', label: 'Máquinas', icon: Cpu },
    { id: 'manuais-pecas', label: 'Manuais & Peças', icon: BookOpen },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart2 },
    { id: 'atualizacoes', label: 'Atualizações', icon: Megaphone },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-[#1a1c1c] flex flex-col font-sans antialiased">
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e2bfb1] shadow-sm z-50 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-[#54595F] hover:text-[#ff6801] p-1 rounded-md"
            aria-label="Toggle Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Logo Feramaq B2B */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleNavClick('dashboard')}>
            <div className="bg-[#ff6801] text-white p-1 rounded font-bold font-headline tracking-tighter text-lg w-8 h-8 flex items-center justify-center shadow-sm">
              F
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-extrabold text-[#ff6801] tracking-tight leading-none text-base">FERAMAQ</span>
              <span className="text-[9px] text-[#54595F] tracking-widest font-semibold uppercase leading-none mt-0.5">Área do Cliente</span>
            </div>
          </div>
        </div>

        {/* Center Search bar (Hidden on mobile) */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 w-4 h-4 text-[#54595F] pointer-events-none" />
          <input 
            type="text" 
            placeholder="Buscar chamados, máquinas ou peças..." 
            className="w-full h-10 pl-10 pr-4 bg-[#f3f3f3] border border-[#e2bfb1] rounded-lg text-sm text-[#1a1c1c] placeholder-[#54595F] focus:outline-none focus:border-[#ff6801] focus:ring-1 focus:ring-[#ff6801]/30 transition-all"
            onChange={(e) => {
              // Can emit event if wanted, handled via layout contexts
            }}
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notification Button */}
          <div className="relative">
            <button 
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                if (unreadCount > 0) {
                  onMarkNotificationsRead();
                }
              }}
              className="p-2 text-[#54595F] hover:bg-[#f3f3f3] hover:text-[#ff6801] rounded-full transition-colors relative"
              title="Notificações"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e2bfb1] rounded-xl shadow-lg z-50 overflow-hidden">
                <div className="p-3 border-b border-[#eeeeee] flex justify-between items-center bg-[#f9f9f9]">
                  <span className="font-headline font-bold text-xs uppercase tracking-wider text-[#54595F]">Notificações</span>
                  <button 
                    onClick={() => setNotificationsOpen(false)}
                    className="text-xs text-[#ff6801] hover:underline"
                  >
                    Fechar
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-[#eeeeee]">
                  {unreadCount > 0 ? (
                    <div className="p-4 text-center text-sm text-[#54595F]">
                      Você possui {unreadCount} novos comunicados não lidos.
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-[#54595F]">
                      Nenhuma notificação nova.
                    </div>
                  )}
                  <div 
                    onClick={() => {
                      handleNavClick('atualizacoes');
                      setNotificationsOpen(false);
                    }}
                    className="p-3 text-center text-xs text-[#ff6801] hover:bg-[#f3f3f3] cursor-pointer font-semibold"
                  >
                    Ver feed de atualizações
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Vertical Separator */}
          <div className="w-px h-6 bg-[#eeeeee] hidden sm:block"></div>

          {/* User Profile Avatar Summary */}
          <div 
            onClick={() => handleNavClick('perfil')}
            className="flex items-center gap-2 cursor-pointer hover:bg-[#f3f3f3] p-1.5 rounded-lg transition-colors"
            title="Ver meu Perfil"
          >
            <div className="w-8 h-8 rounded-full bg-[#dee3ea] flex items-center justify-center text-[#ff6801] font-bold text-xs border border-[#ff6801]/30">
              {currentUser?.nome ? currentUser.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CP'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-[#1a1c1c] leading-tight">
                {currentUser?.nome || 'Construtora Prime'}
              </span>
              <span className="text-[10px] text-[#54595F] leading-none">
                {currentUser?.cargo || 'Cliente Admin'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <div className="flex flex-1 pt-16 h-full relative">
        
        {/* Sidebar Left (Desktop) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-[#e2bfb1] fixed top-16 bottom-0 left-0 z-40 p-4">
          <div className="mb-6 px-2 py-3 bg-[#f9f9f9] rounded-lg border border-[#e2bfb1]/30">
            <span className="text-[10px] uppercase font-headline font-bold text-[#54595F] tracking-widest block">EMPRESA VINCULADA</span>
            <span className="text-sm font-extrabold text-[#1a1c1c] block mt-1 leading-tight">
              Construtora Prime S/A
            </span>
            <span className="text-[11px] text-[#54595F] block mt-0.5">
              CNPJ: 12.345.678/0001-90
            </span>
          </div>

          <nav className="flex-1 flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentRoute === item.id || 
                (item.id === 'chamados' && (currentRoute === 'chamados-novo' || currentRoute === 'chamado-detalhe')) ||
                (item.id === 'orcamentos' && currentRoute === 'orcamento-detalhe') ||
                (item.id === 'maquinas' && currentRoute === 'maquina-detalhe');
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left font-medium ${
                    isActive 
                      ? 'bg-[#ff6801] text-white font-semibold shadow-sm shadow-[#ff6801]/20' 
                      : 'text-[#54595F] hover:bg-[#f3f3f3] hover:text-[#ff6801]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#54595F]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Sidebar Bottom Footer Actions */}
          <div className="pt-4 border-t border-[#eeeeee] flex flex-col gap-1">
            <button 
              onClick={() => handleNavClick('perfil')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                currentRoute === 'perfil' ? 'text-[#ff6801] bg-[#f3f3f3]' : 'text-[#54595F] hover:text-[#ff6801] hover:bg-[#f3f3f3]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Gestão de Usuários</span>
            </button>
            <button 
              onClick={() => handleNavClick('configuracoes')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                currentRoute === 'configuracoes' ? 'text-[#ff6801] bg-[#f3f3f3]' : 'text-[#54595F] hover:text-[#ff6801] hover:bg-[#f3f3f3]'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configurações</span>
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair do Portal</span>
            </button>
          </div>
        </aside>

        {/* Mobile Hamburger Drawer Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMenuOpen(false)}>
            <div 
              className="fixed top-0 bottom-0 left-0 w-72 bg-white z-50 p-5 flex flex-col shadow-2xl transition-transform"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="bg-[#ff6801] text-white p-1 rounded font-bold font-headline text-base w-7 h-7 flex items-center justify-center">F</div>
                  <span className="font-headline font-extrabold text-[#ff6801] text-sm">FERAMAQ</span>
                </div>
                <button onClick={() => setMenuOpen(false)} className="p-1 rounded bg-[#f3f3f3] text-[#54595F]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-3 bg-[#f9f9f9] rounded-lg border border-[#e2bfb1]/30">
                <span className="text-[9px] uppercase font-headline font-bold text-[#54595F] tracking-widest block">EMPRESA</span>
                <span className="text-xs font-extrabold text-[#1a1c1c] block mt-0.5 leading-tight">Construtora Prime Ltda</span>
              </div>

              <nav className="flex-grow flex flex-col gap-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentRoute === item.id || 
                    (item.id === 'chamados' && (currentRoute === 'chamados-novo' || currentRoute === 'chamado-detalhe')) ||
                    (item.id === 'orcamentos' && currentRoute === 'orcamento-detalhe') ||
                    (item.id === 'maquinas' && currentRoute === 'maquina-detalhe');
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left font-medium ${
                        isActive 
                          ? 'bg-[#ff6801] text-white font-semibold' 
                          : 'text-[#54595F] hover:bg-[#f3f3f3]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-[#eeeeee] flex flex-col gap-1 mt-auto">
                <button 
                  onClick={() => handleNavClick('perfil')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#54595F] hover:bg-[#f3f3f3]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Gestão de Usuários</span>
                </button>
                <button 
                  onClick={() => handleNavClick('configuracoes')}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-[#54595F] hover:bg-[#f3f3f3]"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configurações</span>
                </button>
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 mt-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Portal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Body Pane */}
        <main className="flex-1 lg:pl-64 min-h-screen overflow-x-hidden flex flex-col pb-16 lg:pb-0">
          <div className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Mobile Tab Bar (Bottom navigation) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#e2bfb1] shadow-lg flex items-center justify-around px-2 z-45 pb-safe">
          <button 
            onClick={() => handleNavClick('dashboard')}
            className={`flex flex-col items-center justify-center w-12 py-1 ${
              currentRoute === 'dashboard' ? 'text-[#ff6801]' : 'text-[#54595F]'
            }`}
          >
            <Cpu className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium leading-none">Início</span>
          </button>
          <button 
            onClick={() => handleNavClick('maquinas')}
            className={`flex flex-col items-center justify-center w-12 py-1 ${
              currentRoute === 'maquinas' || currentRoute === 'maquina-detalhe' ? 'text-[#ff6801]' : 'text-[#54595F]'
            }`}
          >
            <Cpu className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium leading-none">Máquinas</span>
          </button>
          {/* Main Floating style Action button for Chamados */}
          <button 
            onClick={() => handleNavClick('chamados')}
            className={`flex flex-col items-center justify-center w-14 h-14 -mt-4 bg-white border border-[#e2bfb1] rounded-full shadow-md ${
              currentRoute === 'chamados' || currentRoute === 'chamados-novo' || currentRoute === 'chamado-detalhe' ? 'text-[#ff6801] border-[#ff6801]' : 'text-[#54595F]'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentRoute.includes('chamado') ? 'bg-[#ff6801] text-white' : 'bg-[#f3f3f3]'}`}>
              <Wrench className="w-5 h-5" />
            </div>
          </button>
          <button 
            onClick={() => handleNavClick('manuais-pecas')}
            className={`flex flex-col items-center justify-center w-12 py-1 ${
              currentRoute === 'manuais-pecas' ? 'text-[#ff6801]' : 'text-[#54595F]'
            }`}
          >
            <BookOpen className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium leading-none">Peças</span>
          </button>
          <button 
            onClick={() => handleNavClick('perfil')}
            className={`flex flex-col items-center justify-center w-12 py-1 ${
              currentRoute === 'perfil' ? 'text-[#ff6801]' : 'text-[#54595F]'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium leading-none">Perfil</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
