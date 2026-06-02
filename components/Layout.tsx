import React, { PropsWithChildren } from 'react';
import { useApp } from '../services/AppContext';
import { LayoutDashboard, Armchair, Coffee, Users, LogOut, Settings, DollarSign, Zap, Wallet, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: PropsWithChildren) => {
  const { currentUser, logout } = useApp();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'bg-pier-neon/20 text-pier-neon lg:border-r-2 lg:border-pier-neon lg:border-b-0 border-b-2 border-pier-neon' : 'text-slate-400 hover:text-white hover:bg-white/5';

  return (
    <div className="flex flex-col-reverse lg:flex-row h-screen w-full overflow-hidden print:h-auto print:overflow-visible print:block">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 flex-shrink-0 glass-panel flex lg:flex-col z-20 print:hidden overflow-x-auto lg:overflow-visible no-scrollbar border-t border-white/10 lg:border-t-0 lg:border-r pb-safe lg:pb-0-safe">
        <div className="h-20 lg:flex items-center justify-center border-b border-white/10 hidden">
          <h1 className="text-2xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pier-neon to-pier-green">
            PIER
          </h1>
        </div>

        <nav className="flex-1 flex flex-row lg:flex-col lg:py-6 overflow-x-auto no-scrollbar lg:gap-2 snap-x">
          <Link to="/" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/')}`}>
            <LayoutDashboard size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
            <span className="text-[10px] lg:text-base font-medium">Início</span>
          </Link>
          
          <Link to="/tables" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/tables')}`}>
            <Armchair size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
            <span className="text-[10px] lg:text-base font-medium">Mesas</span>
          </Link>

          <Link to="/fast-sale" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/fast-sale')}`}>
            <Zap size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
            <span className="text-[10px] lg:text-base font-medium">Venda</span>
          </Link>

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'CASHIER') && (
            <Link to="/cash-register" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/cash-register')}`}>
              <Wallet size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
              <span className="text-[10px] lg:text-base font-medium">Caixa</span>
            </Link>
          )}

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
            <>
                <Link to="/products" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/products')}`}>
                    <Coffee size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
                    <span className="text-[10px] lg:text-base font-medium">Prod.</span>
                </Link>
                <Link to="/finance" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/finance')}`}>
                    <TrendingUp size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
                    <span className="text-[10px] lg:text-base font-medium">Finanças</span>
                </Link>
            </>
          )}

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
            <Link to="/team" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/team')}`}>
              <Users size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
              <span className="text-[10px] lg:text-base font-medium">Equipe</span>
            </Link>
          )}

          {(currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN') && (
            <Link to="/commissions" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/commissions')}`}>
              <DollarSign size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
              <span className="text-[10px] lg:text-base font-medium">Comis.</span>
            </Link>
          )}
          
          {currentUser?.role === 'WAITER' && (
             <Link to="/commissions" className={`px-4 lg:px-6 py-4 flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-4 transition-all min-w-[70px] snap-center ${isActive('/commissions')}`}>
             <DollarSign size={22} className="w-[20px] h-[20px] lg:w-[22px] lg:h-[22px]" />
             <span className="text-[10px] lg:text-base font-medium">Comis.</span>
           </Link>
          )}

        </nav>

        <div className="hidden lg:block p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pier-neon to-pier-green flex items-center justify-center text-pier-900 font-bold shrink-0">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{currentUser?.name}</p>
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
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950 print:overflow-visible print:h-auto print:static relative z-0">
        <div className="hidden lg:block absolute inset-0 pointer-events-none -z-10 print:hidden">
           {/* ambient lights */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pier-neon/5 rounded-full blur-[100px]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pier-green/5 rounded-full blur-[100px]"></div>
        </div>
        
        {/* Mobile Header (Sair) */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 print:hidden">
           <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pier-neon to-pier-green flex items-center justify-center text-pier-900 font-bold shrink-0">
                 {currentUser?.name.charAt(0)}
               </div>
               <h1 className="text-lg font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pier-neon to-pier-green">
                 PIER DO COSTA
               </h1>
           </div>
           <button onClick={logout} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors">
               <LogOut size={20} />
               <span className="text-sm font-medium">Sair</span>
           </button>
        </div>

        <div className="flex-1 p-4 lg:p-8 print:p-0 print:m-0 flex flex-col min-h-0">
          {children}
        </div>
      </main>
    </div>
  );
};