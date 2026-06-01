import React, { PropsWithChildren } from 'react';
import { useApp } from '../services/AppContext';
import { LayoutDashboard, Armchair, Coffee, Users, LogOut, Settings, DollarSign, Zap, Wallet } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: PropsWithChildren) => {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'bg-pier-neon/20 text-pier-neon border-r-2 border-pier-neon' : 'text-slate-400 hover:text-white hover:bg-white/5';

  return (
    <div className="flex h-screen w-full overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Sidebar */}
      <aside className="w-20 lg:w-64 flex-shrink-0 glass-panel flex flex-col z-20 print:hidden">
        <div className="h-20 flex items-center justify-center border-b border-white/10">
          <h1 className="hidden lg:block text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pier-neon to-pier-green">
            PIER
          </h1>
          <span className="lg:hidden text-2xl">⚓</span>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-2">
          <Link to="/" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/')}`}>
            <LayoutDashboard size={22} />
            <span className="hidden lg:block font-medium">Dashboard</span>
          </Link>
          
          <Link to="/tables" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/tables')}`}>
            <Armchair size={22} />
            <span className="hidden lg:block font-medium">Mesas & PDV</span>
          </Link>

          <Link to="/fast-sale" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/fast-sale')}`}>
            <Zap size={22} />
            <span className="hidden lg:block font-medium">Venda Rápida</span>
          </Link>

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'CASHIER') && (
            <Link to="/cash-register" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/cash-register')}`}>
              <Wallet size={22} />
              <span className="hidden lg:block font-medium">Controle de Caixa</span>
            </Link>
          )}

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
            <Link to="/products" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/products')}`}>
                <Coffee size={22} />
                <span className="hidden lg:block font-medium">Produtos</span>
            </Link>
          )}

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
            <Link to="/team" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/team')}`}>
              <Users size={22} />
              <span className="hidden lg:block font-medium">Equipe</span>
            </Link>
          )}

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
            <Link to="/commissions" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/commissions')}`}>
              <DollarSign size={22} />
              <span className="hidden lg:block font-medium">Comissões</span>
            </Link>
          )}
          
          {currentUser?.role === 'WAITER' && (
             <Link to="/commissions" className={`px-6 py-4 flex items-center gap-4 transition-all ${isActive('/commissions')}`}>
             <DollarSign size={22} />
             <span className="hidden lg:block font-medium">Minhas Comissões</span>
           </Link>
          )}

        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pier-neon to-pier-green flex items-center justify-center text-pier-900 font-bold">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-white">{currentUser?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{currentUser?.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="hidden lg:block">Sair</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative print:overflow-visible print:h-auto print:static">
        <div className="absolute inset-0 pointer-events-none z-0 print:hidden">
           {/* ambient lights */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pier-neon/5 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pier-green/5 rounded-full blur-[100px]"></div>
        </div>
        <div className="relative z-10 p-4 lg:p-8 min-h-full print:p-0 print:m-0">
          {children}
        </div>
      </main>
    </div>
  );
};