import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Wallet, TrendingUp, CreditCard, Banknote, Landmark, CheckCircle, Search, RefreshCw, Trash2 } from 'lucide-react';

export const CashRegister = () => {
  const { currentUser, isRegisterOpen, registerBalance, openRegister, closeRegister, orders, tables, deleteOrder } = useApp();
  const [amountInput, setAmountInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals Local State
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deletePin, setDeletePin] = useState('');
  const [deleteError, setDeleteError] = useState(false);
  const [isClosePromptOpen, setIsClosePromptOpen] = useState(false);

  const closedOrders = orders.filter(o => o.status === 'CLOSED');
  const openOrders = orders.filter(o => o.status === 'OPEN');

  const totalSales = closedOrders.reduce((sum, o) => sum + o.total, 0);
  
  const totalCash = closedOrders.filter(o => o.paymentMethod === 'CASH').reduce((sum, o) => sum + o.total, 0);
  const totalCredit = closedOrders.filter(o => o.paymentMethod === 'CARD_CREDIT').reduce((sum, o) => sum + o.total, 0);
  const totalDebit = closedOrders.filter(o => o.paymentMethod === 'CARD_DEBIT').reduce((sum, o) => sum + o.total, 0);
  const totalPix = closedOrders.filter(o => o.paymentMethod === 'PIX').reduce((sum, o) => sum + o.total, 0);

  const handleOpenRegister = () => {
    const val = parseFloat(amountInput);
    if (!isNaN(val) && val >= 0) {
      openRegister(val);
      setAmountInput('');
    }
  };

  const handleCloseRegister = () => {
    setIsClosePromptOpen(true);
  };

  const confirmCloseRegister = () => {
    closeRegister();
    setIsClosePromptOpen(false);
  };

  const getPaymentName = (method: string) => {
    switch(method) {
        case 'CASH': return 'Dinheiro';
        case 'CARD_CREDIT': return 'Cartão Crédito';
        case 'CARD_DEBIT': return 'Cartão Débito';
        case 'PIX': return 'PIX';
        case 'MIXED': return 'Misto';
        default: return method;
    }
  };

  const handleDeleteOrder = (orderId: string) => {
      setOrderToDelete(orderId);
      setDeletePin('');
      setDeleteError(false);
  };

  const confirmDeleteOrder = () => {
      if(orderToDelete) {
          if(deleteOrder(orderToDelete, deletePin)) {
              setOrderToDelete(null);
          } else {
              setDeleteError(true);
          }
      }
  };

  const filteredOrders = closedOrders.filter(o => {
     const table = tables.find(t => t.id === o.tableId);
     const nameMatch = table?.customName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
     const idMatch = o.id.toLowerCase().includes(searchTerm.toLowerCase());
     return nameMatch || idMatch;
  });

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MANAGER' && currentUser?.role !== 'CASHIER') {
      return (
          <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">Sem permissão para acessar esta página.</p>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-10 relative">

        {/* Delete Order Pin Modal */}
        {orderToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-sm shadow-2xl">
                    <h3 className="text-xl font-bold text-white mb-2">Excluir Pedido</h3>
                    <p className="text-slate-400 mb-6 text-sm">Digite a senha de administrador:</p>
                    <input 
                        type="password" 
                        value={deletePin}
                        onChange={(e) => {
                            setDeletePin(e.target.value);
                            setDeleteError(false);
                        }}
                        className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-white text-center tracking-[0.5em] text-2xl focus:outline-none mb-2 ${deleteError ? 'border-red-500' : 'border-white/20 focus:border-pier-neon'}`}
                        placeholder="****"
                        maxLength={4}
                        autoFocus
                    />
                    {deleteError && <p className="text-red-400 text-xs text-center mb-4">Senha incorreta.</p>}
                    
                    <div className="flex gap-4 mt-6">
                        <button 
                            onClick={() => setOrderToDelete(null)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={confirmDeleteOrder}
                            className="flex-1 py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 font-bold rounded-xl transition-all"
                        >
                            CONFIRMAR
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Close Register Confirm */}
        {isClosePromptOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Fechar o Caixa?</h3>
                    <p className="text-slate-400 mb-8">Esta ação irá zerar o controle atual para o próximo turno. Tem certeza?</p>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsClosePromptOpen(false)}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={confirmCloseRegister}
                            className="flex-1 py-3 bg-pier-green text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
                        >
                            FECHAR CAIXA
                        </button>
                    </div>
                </div>
            </div>
        )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Controle de Caixa</h2>
            <p className="text-slate-400">Resumo financeiro e fluxo de caixa</p>
        </div>
        
        <div className="flex gap-4">
            {!isRegisterOpen ? (
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        placeholder="Fundo de Caixa"
                        className="bg-black/40 border border-white/20 rounded-lg px-3 py-2 text-white w-32 focus:border-pier-neon focus:outline-none"
                    />
                    <button 
                        onClick={handleOpenRegister}
                        className="bg-pier-green text-black font-bold px-4 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
                    >
                        Abrir Caixa
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-between gap-4 glass-card px-4 py-2 rounded-lg border-pier-neon/30">
                    <div>
                        <span className="text-xs text-slate-400 block">Fundo de Caixa</span>
                        <span className="text-sm font-bold text-white">R$ {registerBalance.toFixed(2)}</span>
                    </div>
                    <div className="h-6 w-px bg-white/10 mx-2"></div>
                    <button 
                        onClick={handleCloseRegister}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all text-sm font-bold flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Fechar Caixa
                    </button>
                </div>
            )}
        </div>
      </div>

      {!isRegisterOpen && (
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-4">
              <AlertCircle className="text-amber-400 mt-1" />
              <div>
                  <h4 className="font-bold text-amber-400">Caixa Fechado</h4>
                  <p className="text-sm text-slate-300">Os garçons não poderão iniciar novas vendas (abrir mesas) até que o caixa seja aberto.</p>
              </div>
          </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Vendas Realizadas</h3>
            <div className="p-3 bg-pier-green/10 rounded-xl text-pier-green">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">R$ {totalSales.toFixed(2)}</p>
          <p className="text-sm text-slate-400">{closedOrders.length} pedidos concluídos</p>
          <div className="absolute -bottom-6 -right-6 text-pier-green/5">
            <TrendingUp size={100} />
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Dinheiro Total</h3>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Banknote size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">R$ {(totalCash + (isRegisterOpen ? registerBalance : 0)).toFixed(2)}</p>
          <p className="text-sm text-slate-400">R$ {totalCash.toFixed(2)} vendas + Fundo</p>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">Cartões (C/D)</h3>
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">R$ {(totalCredit + totalDebit).toFixed(2)}</p>
          <div className="flex gap-4 text-xs font-medium mt-1">
             <span className="text-blue-300">Crédito: R$ {totalCredit.toFixed(2)}</span>
             <span className="text-cyan-300">Débito: R$ {totalDebit.toFixed(2)}</span>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-400 font-medium">PIX</h3>
            <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
              <Landmark size={24} />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">R$ {totalPix.toFixed(2)}</p>
          <p className="text-sm text-slate-400">Transações automáticas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-white/5">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2"><CheckCircle size={20} className="text-pier-green" /> Pedidos Fechados</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar pedido ou mesa..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-pier-neon"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="text-xs uppercase bg-black/40 text-slate-400">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">ID</th>
                            <th className="px-4 py-3">Mesa/Balcão</th>
                            <th className="px-4 py-3">Horário</th>
                            <th className="px-4 py-3">Pgto</th>
                            <th className="px-4 py-3 text-right">Total</th>
                            <th className="px-4 py-3 text-center rounded-r-lg">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-slate-500">Nenhum pedido finalizado.</td>
                            </tr>
                        ) : (
                            filteredOrders.map(order => {
                                const table = tables.find(t => t.id === order.tableId);
                                const isBalcao = table?.id?.startsWith('b');
                                return (
                                    <tr key={order.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{order.id.split('-')[1]}</td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${isBalcao ? 'text-amber-400' : 'text-white'}`}>
                                                {isBalcao ? 'Balcão' : 'Mesa'} {table?.number || ''}
                                            </span>
                                            {table?.customName && <span className="ml-2 text-xs opacity-70">({table.customName})</span>}
                                        </td>
                                        <td className="px-4 py-3 text-slate-400">
                                            {order.closedAt ? new Date(order.closedAt).toLocaleTimeString() : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 bg-white/10 rounded text-xs font-medium">
                                                {getPaymentName(order.paymentMethod || '')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-white">
                                            R$ {order.total.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button 
                                                onClick={() => handleDeleteOrder(order.id)}
                                                className="text-red-500/50 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Excluir Venda"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border-white/5">
            <h3 className="text-xl font-bold text-white mb-6">Status Operacional</h3>
            
            <div className="space-y-4">
                <div className="bg-black/30 p-4 rounded-xl flex justify-between items-center border border-white/5">
                    <span className="text-slate-400 font-medium">Pedidos em Aberto</span>
                    <span className="text-xl font-bold text-pier-neon">{openOrders.length}</span>
                </div>
                
                <div className="bg-black/30 p-4 rounded-xl flex justify-between items-center border border-white/5">
                    <span className="text-slate-400 font-medium">Tickets Médio</span>
                    <span className="text-xl font-bold text-white">
                        R$ {closedOrders.length > 0 ? (totalSales / closedOrders.length).toFixed(2) : '0.00'}
                    </span>
                </div>

                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                    <p className="text-slate-400 font-medium mb-3">Mesas Ocupadas</p>
                    <div className="w-full bg-slate-800 rounded-full h-2.5">
                        <div 
                            className="bg-red-500 h-2.5 rounded-full" 
                            style={{ width: `${(tables.filter(t => t.status === 'OCCUPIED').length / tables.length) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-right mt-2 text-slate-500">
                        {tables.filter(t => t.status === 'OCCUPIED').length} de {tables.length}
                    </p>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};
