import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Link } from 'react-router-dom';
import { TrendingUp, DollarSign, ShoppingBag, PlusCircle, Lock, Unlock, Package, Coffee, X, Armchair } from 'lucide-react';

export const Dashboard = () => {
  const { orders, isRegisterOpen, openRegister, closeRegister, registerBalance, currentUser } = useApp();
  const [showOpenRegisterModal, setShowOpenRegisterModal] = useState(false);
  const [initialCash, setInitialCash] = useState('');

  // Simple stats calculation
  const totalSales = orders.filter(o => o.status === 'CLOSED').reduce((acc, o) => acc + (o.total || 0), 0);
  const openOrdersCount = orders.filter(o => o.status === 'OPEN').length;
  
  // Calculate distinct payment methods
  const cashSales = orders.filter(o => o.paymentMethod === 'CASH').reduce((acc, o) => acc + o.total, 0);

  const handleToggleRegister = () => {
      if (isRegisterOpen) {
          if(confirm('Tem certeza que deseja fechar o caixa?')) {
              closeRegister();
          }
      } else {
          setShowOpenRegisterModal(true);
      }
  };

  const confirmOpenRegister = (e: React.FormEvent) => {
      e.preventDefault();
      const amount = parseFloat(initialCash);
      if (isNaN(amount)) return;
      openRegister(amount);
      setShowOpenRegisterModal(false);
      setInitialCash('');
  };

  // --- WAITER DASHBOARD (Mobile First Simplicity) ---
  if (currentUser?.role === 'WAITER') {
      return (
          <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-6rem)]">
              <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Olá, {currentUser.name.split(' ')[0]}</h2>
                    <p className="text-slate-400 text-sm">Pronto para atender?</p>
                  </div>
              </div>

              <div className="flex-1 grid grid-rows-2 gap-4">
                  <Link to="/tables" className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-pier-neon/10 to-transparent border-pier-neon/30 hover:border-pier-neon/60 active:scale-95 transition-all">
                      <div className="w-20 h-20 rounded-full bg-pier-neon/20 text-pier-neon flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)]">
                          <Armchair size={40} />
                      </div>
                      <div className="text-center">
                          <h3 className="text-2xl font-bold text-white">MAPA DE MESAS</h3>
                          <p className="text-slate-400">Abrir conta / Adicionar pedidos</p>
                      </div>
                  </Link>

                  <Link to="/my-commissions" className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-white/20 active:scale-95 transition-all">
                       <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 flex items-center justify-center">
                          <DollarSign size={32} />
                      </div>
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white">MINHAS COMISSÕES</h3>
                          <p className="text-slate-400">Ver saldo do dia</p>
                      </div>
                  </Link>
              </div>
          </div>
      );
  }

  // --- ADMIN/MANAGER DASHBOARD ---
  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">PDV - Pier do Costa</h2>
            <p className="text-slate-400">Painel do Operador</p>
        </div>
        
        <button 
            onClick={handleToggleRegister}
            className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${
                isRegisterOpen 
                ? 'bg-red-500/10 text-red-400 border border-red-500/50 hover:bg-red-500/20' 
                : 'bg-pier-neon/10 text-pier-neon border border-pier-neon/50 hover:bg-pier-neon/20'
            }`}
        >
            {isRegisterOpen ? <Unlock size={20} /> : <Lock size={20} />}
            {isRegisterOpen ? 'FECHAR CAIXA' : 'ABRIR CAIXA'}
        </button>
      </div>

      {/* Status do Caixa */}
      {!isRegisterOpen && (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl flex flex-col items-center justify-center text-center animate-fade-in">
              <Lock size={48} className="text-red-400 mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Caixa Fechado</h3>
              <p className="text-slate-400 max-w-md">O sistema de vendas está bloqueado. Abra o caixa para iniciar as operações do dia.</p>
          </div>
      )}

      {isRegisterOpen && (
        <div className="animate-fade-in space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/tables" className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-pier-neon/50">
                    <div className="w-16 h-16 rounded-full bg-pier-neon/10 text-pier-neon flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag size={32} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Nova Venda / Mesas</h3>
                        <p className="text-sm text-slate-400">Visualizar mapa de mesas</p>
                    </div>
                </Link>

                <Link to="/products" className="glass-card p-8 rounded-2xl flex flex-col items-center justify-center gap-4 group hover:border-pier-green/50">
                    <div className="w-16 h-16 rounded-full bg-pier-green/10 text-pier-green flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Package size={32} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-xl font-bold text-white">Gerenciar Produtos</h3>
                        <p className="text-sm text-slate-400">Adicionar ou remover itens</p>
                    </div>
                </Link>

                <div className="glass-panel p-6 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign size={20} className="text-pier-neon" /> Resumo do Caixa
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Fundo de Caixa</span>
                            <span className="text-white font-medium">R$ {registerBalance.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Dinheiro (Vendas)</span>
                            <span className="text-green-400 font-medium">R$ {cashSales.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/5 flex justify-between text-sm">
                            <span className="text-slate-400">Total em Gaveta</span>
                            <span className="text-pier-neon font-medium">R$ {(registerBalance + cashSales).toFixed(2)}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10 flex justify-between text-lg font-bold">
                            <span className="text-white">Faturamento</span>
                            <span className="text-pier-neon">R$ {totalSales.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400"><ShoppingBag /></div>
                    <div>
                        <p className="text-slate-400 text-xs">Vendas Hoje</p>
                        <p className="text-2xl font-bold text-white">{orders.filter(o => o.status === 'CLOSED').length}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 rounded-xl text-orange-400"><Coffee /></div>
                    <div>
                        <p className="text-slate-400 text-xs">Mesas Abertas</p>
                        <p className="text-2xl font-bold text-white">{openOrdersCount}</p>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Modal Abertura de Caixa */}
      {showOpenRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="glass-panel p-8 rounded-2xl w-full max-w-sm border border-pier-neon/20">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Abertura de Caixa</h3>
                    <button onClick={() => setShowOpenRegisterModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                  </div>
                  
                  <form onSubmit={confirmOpenRegister}>
                      <label className="block text-sm text-slate-400 mb-2">Fundo de Caixa (Dinheiro Inicial)</label>
                      <div className="relative mb-6">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">R$</span>
                          <input 
                              type="number"
                              step="0.01"
                              autoFocus
                              required
                              value={initialCash}
                              onChange={e => setInitialCash(e.target.value)}
                              className="w-full bg-black/40 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white focus:border-pier-neon focus:outline-none text-lg"
                              placeholder="0.00"
                          />
                      </div>
                      
                      <button 
                          type="submit"
                          className="w-full bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                      >
                          Confirmar Abertura
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};