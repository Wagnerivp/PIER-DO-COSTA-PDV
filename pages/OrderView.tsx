import React, { useState, useEffect } from 'react';
import { useApp } from '../services/AppContext';
import { ArrowLeft, Search, Receipt, CreditCard, Banknote, QrCode, Calculator, Minus, Edit2, Users, X, RefreshCw, Trash2, Printer } from 'lucide-react';
import { CATEGORIES } from '../constants';

interface Props {
  tableId: string;
  onBack: () => void;
}

export const OrderView = ({ tableId, onBack }: Props) => {
  const { tables, orders, products, addToOrder, removeFromOrder, closeAccount, updateTableName, cancelOrder, requestCheckout, currentUser } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('c-all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  
  // Payment State
  const [includeService, setIncludeService] = useState(true);
  const [cashReceived, setCashReceived] = useState<string>('');
  const [showCashInput, setShowCashInput] = useState(false);

  // Split Bill State
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  
  // Rename Table State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Prompt states
  const [resetTableModalOpen, setResetTableModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [cashError, setCashError] = useState('');

  const table = tables.find(t => t.id === tableId);
  const order = orders.find(o => o.id === table?.currentOrderId);
  
  useEffect(() => {
      if (table?.customName) setTempName(table.customName);
  }, [table]);

  if (!table || !order) return null;

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'c-all' || p.categoryId === selectedCategory) && 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const finalTotal = includeService ? (order.subtotal * 1.1) : order.subtotal;
  const changeAmount = cashReceived ? parseFloat(cashReceived) - finalTotal : 0;
  const waiterName = useApp().users.find(u => u.id === order.waiterId)?.name;

  const handleCheckout = (method: string) => {
    setCashError('');
    if (method === 'CASH' && !showCashInput) {
        setShowCashInput(true);
        return;
    }
    // If Cash and Input shown, validate amount
    if (method === 'CASH' && showCashInput) {
        if (parseFloat(cashReceived) < finalTotal) {
            setCashError('Valor recebido menor que o total!');
            return;
        }
    }
    closeAccount(tableId, method, includeService);
    onBack();
  };

  const handleResetTable = (e: React.MouseEvent) => {
      e.stopPropagation();
      setResetTableModalOpen(true);
  };

  const confirmResetTable = () => {
      cancelOrder(tableId);
      onBack();
  };

  const handlePrintConference = () => {
      window.print();
  };

  const saveTableName = () => {
      updateTableName(tableId, tempName);
      setIsEditingName(false);
  };

  return (
    <>
    {/* Delete Item Modal */}
    {itemToRemove && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center">
                <h3 className="text-xl font-bold text-white mb-2">Excluir Item?</h3>
                <p className="text-slate-400 mb-6 text-sm">Tem certeza que deseja remover este item do pedido?</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setItemToRemove(null)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm"
                    >
                        CANCELAR
                    </button>
                    <button 
                        onClick={() => {
                            removeFromOrder(tableId, itemToRemove, true);
                            setItemToRemove(null);
                        }}
                        className="flex-1 py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 font-bold rounded-xl transition-all text-sm"
                    >
                        EXCLUIR
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* Reset Table Modal */}
    {resetTableModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                <h3 className="text-2xl font-bold text-white mb-2">Reiniciar Mesa?</h3>
                <p className="text-slate-400 mb-8">Isso cancelará o pedido aberto e liberará a mesa. Produtos retornarão ao estoque.</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setResetTableModalOpen(false)}
                        className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all text-sm"
                    >
                        CANCELAR
                    </button>
                    <button 
                        onClick={confirmResetTable}
                        className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg transition-all text-sm"
                    >
                        REINICIAR
                    </button>
                </div>
            </div>
        </div>
    )}

    {/* MAIN UI - HIDDEN WHEN PRINTING */}
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 animate-fade-in print:hidden">
      {/* Left: Product Catalog */}
      <div className="flex-1 flex flex-col gap-4 min-h-0 order-2 md:order-1">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">
            <ArrowLeft size={18} /> Voltar
          </button>
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
                type="text" 
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-800 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-pier-neon w-40 md:w-64 transition-all focus:w-full md:focus:w-72"
             />
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin shrink-0">
            <button
                onClick={() => setSelectedCategory('c-all')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-sm
                    ${selectedCategory === 'c-all' 
                        ? 'bg-pier-neon/20 border-pier-neon text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                        : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700/50'
                    }`}
            >
                <span className="font-medium">📍 Todas</span>
            </button>
            {CATEGORIES.map(cat => (
                <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap text-sm
                        ${selectedCategory === cat.id 
                            ? 'bg-pier-neon/20 border-pier-neon text-white shadow-[0_0_15px_rgba(34,211,238,0.2)]' 
                            : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700/50'
                        }`}
                >
                    <span>{cat.icon}</span>
                    <span className="font-medium">{cat.name}</span>
                </button>
            ))}
        </div>

        {/* Product Grid - Compact & Responsive */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pr-2 content-start pb-4 min-h-0">
            {filteredProducts.map(product => (
                <button 
                    key={product.id}
                    onClick={() => {
                        addToOrder(tableId, product, 1);
                    }}
                    className="glass-card p-3 rounded-xl flex flex-col justify-between gap-2 text-left group transition-all h-28 relative overflow-hidden hover:border-pier-neon hover:bg-white/5 active:scale-95"
                >
                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="bg-pier-neon text-pier-900 rounded-full p-1"><PlusCircleIcon size={12} /></div>
                    </div>
                    <span className="font-bold text-white text-sm line-clamp-2 leading-tight group-hover:text-pier-neon z-10">{product.name}</span>
                    <div className="z-10 mt-auto">
                        <span className="block text-sm text-pier-neon font-bold">R$ {product.price.toFixed(2)}</span>
                        <span className="text-[10px] text-slate-500">Est: {product.stock}</span>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Right: Cart/Order */}
      <div className="w-full md:w-80 lg:w-[400px] glass-panel rounded-2xl flex flex-col h-[45vh] md:h-full border border-white/10 order-1 md:order-2 shrink-0 shadow-2xl overflow-hidden relative">
        <div className="shrink-0 p-4 border-b border-white/10 bg-slate-900/80">
            <div className="flex justify-between items-start mb-2">
                <div className="flex-1 mr-2">
                    {isEditingName ? (
                        <div className="flex gap-2 items-center">
                            <input 
                                value={tempName}
                                onChange={e => setTempName(e.target.value)}
                                className="bg-black/40 border border-pier-neon/50 rounded px-2 py-1 text-white w-full text-sm focus:outline-none"
                                autoFocus
                                onBlur={saveTableName}
                                onKeyDown={(e) => e.key === 'Enter' && saveTableName()}
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                            setTempName(table.customName || `Mesa ${table.number}`);
                            setIsEditingName(true);
                        }}>
                            <h3 className="text-lg font-bold text-white truncate">
                                {table.customName || `Mesa ${table.number}`}
                            </h3>
                            <Edit2 size={12} className="text-slate-500 group-hover:text-pier-neon transition-colors" />
                        </div>
                    )}
                    <p className="text-xs text-slate-400 mt-1">Garçom: {waiterName}</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                    {table.status === 'PAYMENT_PENDING' ? (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase tracking-wide">Pagar</span>
                    ) : (
                        <span className="text-[10px] font-bold text-pier-neon bg-pier-neon/10 border border-pier-neon/30 px-2 py-0.5 rounded-full uppercase tracking-wide">Em Aberto</span>
                    )}
                    {currentUser?.role !== 'WAITER' && (
                        <button 
                            type="button"
                            onClick={handleResetTable} 
                            className="text-[10px] font-bold text-red-400 hover:text-white flex items-center gap-1 border border-red-500/30 px-2 py-1 rounded bg-red-500/5 hover:bg-red-500 transition-colors cursor-pointer z-50"
                            title="Cancelar pedido e liberar mesa"
                        >
                            <Trash2 size={10} /> REINICIAR
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0 scrollbar-thin">
            {order.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-30 select-none">
                    <Receipt size={48} className="mb-2 stroke-1" />
                    <p className="text-sm font-light">Nenhum item lançado</p>
                </div>
            ) : (
                order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pier-neon/30 transition-all group animate-fade-in-up">
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="font-medium text-white text-sm truncate">{item.productName}</p>
                            <p className="text-xs text-slate-400">R$ {item.price.toFixed(2)} un</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end">
                                <span className="font-bold text-white text-sm">R$ {item.total.toFixed(2)}</span>
                                <span className="text-xs text-pier-neon font-mono">x{item.quantity}</span>
                            </div>
                            <div className="flex bg-white/5 rounded-lg border border-white/5 overflow-hidden">
                                <button 
                                    onClick={() => removeFromOrder(tableId, item.productId)}
                                    className="w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border-r border-white/5"
                                    title="Diminuir quantidade"
                                >
                                    <Minus size={16} />
                                </button>
                                <button 
                                    onClick={() => setItemToRemove(item.productId)}
                                    className="px-3 h-10 flex items-center justify-center gap-1 text-red-500 hover:bg-red-500/20 transition-colors bg-red-500/10 font-bold text-xs"
                                >
                                    <Trash2 size={14} /> EXCLUIR
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            )}

            {order.deletedItems && order.deletedItems.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 px-1 flex items-center gap-1">
                        <Trash2 size={12} /> Itens Excluídos
                    </h4>
                    {order.deletedItems.map((delItem, idx) => (
                        <div key={`del-${idx}`} className="flex justify-between items-center p-2 rounded-lg bg-red-500/5 border border-red-500/10 opacity-70">
                            <div className="flex-1 min-w-0 pr-2">
                                <p className="font-medium text-white text-xs truncate line-through decoration-red-500/50">{delItem.productName}</p>
                                <p className="text-[10px] text-slate-400">Cancelado por: {delItem.deletedByUserName}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-xs text-red-400 font-mono">-x{delItem.quantity}</span>
                                <span className="text-[10px] text-slate-500">{new Date(delItem.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        <div className="shrink-0 p-4 bg-slate-900 border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.2)] z-10">
            <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-slate-400 text-xs mt-2">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-mono text-sm">R$ {order.subtotal.toFixed(2)}</span>
                </div>
                
                <button 
                    onClick={() => setIncludeService(!includeService)}
                    className={`w-full flex justify-between items-center p-3 mt-2 rounded-xl border transition-all ${includeService ? 'bg-pier-neon/10 border-pier-neon text-pier-neon' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700/50'}`}
                >
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${includeService ? 'bg-pier-neon border-pier-neon' : 'border-slate-500'}`}>
                            {includeService && <div className="w-2 h-2 bg-slate-900 rounded-[2px]" />}
                        </div>
                        <span className="font-bold text-sm">Serviço (10%)</span>
                    </div>
                    <span className="font-mono font-bold">R$ {(order.subtotal * 0.1).toFixed(2)}</span>
                </button>

                <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-white/10 items-end mt-2">
                    <span>Total</span>
                    <span className="text-pier-neon font-mono text-2xl">R$ {finalTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={handlePrintConference}
                    className="w-full p-4 rounded-xl border border-pier-neon/30 text-pier-neon bg-pier-neon/5 hover:bg-pier-neon/20 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                    <Printer size={20} />
                    IMPRIMIR VIA DO CLIENTE {includeService ? 'COM 10%' : 'SEM TAXA'}
                </button>
                <button 
                    onClick={() => {
                        setShowCashInput(false);
                        setPaymentModalOpen(true);
                    }}
                    disabled={order.items.length === 0}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold text-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    ENCERRAR VENDA E PAGAR
                </button>
            </div>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-white/10 animate-scale-in">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-white">Pagamento</h2>
                    <button onClick={() => setShowSplitModal(true)} className="flex items-center gap-2 text-pier-neon hover:text-white border border-pier-neon/30 px-3 py-1.5 rounded-lg hover:bg-pier-neon/20 transition-all text-sm">
                        <Users size={16} /> Dividir
                    </button>
                  </div>
                  
                  <div className="text-center mb-8">
                      <p className="text-slate-400 mb-1">Valor Total</p>
                      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pier-neon to-pier-green font-mono">
                        R$ {finalTotal.toFixed(2)}
                      </h1>
                  </div>

                  {!showCashInput ? (
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => handleCheckout('CARD_CREDIT')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-pier-neon/50 flex flex-col items-center gap-2 transition-all">
                            <CreditCard size={24} className="text-pier-neon" />
                            <span className="text-sm font-bold text-white">Crédito</span>
                        </button>
                        <button onClick={() => handleCheckout('CARD_DEBIT')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-pier-neon/50 flex flex-col items-center gap-2 transition-all">
                            <CreditCard size={24} className="text-pier-green" />
                            <span className="text-sm font-bold text-white">Débito</span>
                        </button>
                        <button onClick={() => handleCheckout('PIX')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-pier-neon/50 flex flex-col items-center gap-2 transition-all">
                            <QrCode size={24} className="text-pink-400" />
                            <span className="text-sm font-bold text-white">PIX</span>
                        </button>
                        <button onClick={() => handleCheckout('CASH')} className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/5 hover:border-pier-neon/50 flex flex-col items-center gap-2 transition-all">
                            <Banknote size={24} className="text-green-400" />
                            <span className="text-sm font-bold text-white">Dinheiro</span>
                        </button>
                      </div>
                  ) : (
                      <div className="mb-6 bg-white/5 p-4 rounded-xl border border-white/10">
                           <div className="flex items-center gap-2 mb-4 text-green-400">
                                <Calculator size={20} />
                                <h3 className="text-lg font-bold">Troco</h3>
                           </div>
                           
                           <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Recebido</label>
                                    <div className="relative">
                                    <input 
                                        type="number" 
                                        autoFocus
                                        value={cashReceived}
                                        onChange={(e) => {
                                            setCashReceived(e.target.value);
                                            setCashError('');
                                        }}
                                        className={`w-full bg-black/40 border rounded-lg px-3 py-2 text-xl text-white focus:outline-none transition-colors ${cashError ? 'border-red-500' : 'border-white/20 focus:border-pier-neon'}`}
                                        placeholder="0.00"
                                    />
                                    {cashError && <span className="text-red-400 text-[10px] absolute -bottom-4 left-0 truncate w-full">{cashError}</span>}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <label className="block text-xs text-slate-400 mb-1">Troco</label>
                                    <div className={`text-2xl font-bold font-mono ${changeAmount < 0 ? 'text-red-400' : 'text-pier-neon'}`}>
                                        R$ {changeAmount > 0 ? changeAmount.toFixed(2) : '0.00'}
                                    </div>
                                </div>
                           </div>

                           <div className="mt-4 flex gap-3">
                               <button 
                                 onClick={() => setShowCashInput(false)}
                                 className="px-4 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm"
                               >
                                   Voltar
                               </button>
                               <button 
                                 onClick={() => handleCheckout('CASH')}
                                 className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg text-sm"
                               >
                                   Pagar
                               </button>
                           </div>
                      </div>
                  )}

                  {!showCashInput && (
                    <button onClick={() => setPaymentModalOpen(false)} className="w-full py-2 text-slate-400 hover:text-white text-sm">
                        Cancelar
                    </button>
                  )}
              </div>
          </div>
      )}

      {/* Split Bill Modal */}
      {showSplitModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
              <div className="glass-panel p-6 rounded-2xl w-full max-w-sm border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold text-white">Dividir Conta</h3>
                      <button onClick={() => setShowSplitModal(false)}><X size={20} className="text-slate-400" /></button>
                  </div>
                  
                  <div className="text-center mb-6">
                      <p className="text-slate-400 mb-1">Total</p>
                      <p className="text-2xl font-bold text-white font-mono">R$ {finalTotal.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center justify-center gap-6 mb-8">
                      <button 
                        onClick={() => setSplitCount(Math.max(2, splitCount - 1))}
                        className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white hover:bg-slate-700 hover:border-pier-neon transition-all"
                      >
                          <Minus size={20} />
                      </button>
                      <div className="text-center">
                          <p className="text-4xl font-bold text-pier-neon font-mono">{splitCount}</p>
                          <p className="text-xs text-slate-500">Pessoas</p>
                      </div>
                      <button 
                        onClick={() => setSplitCount(splitCount + 1)}
                        className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white hover:bg-slate-700 hover:border-pier-neon transition-all"
                      >
                          <PlusCircleIcon size={20} />
                      </button>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 text-center mb-6 border border-white/10">
                      <p className="text-sm text-slate-400 mb-1">Por pessoa</p>
                      <p className="text-3xl font-bold text-green-400 font-mono">R$ {(finalTotal / splitCount).toFixed(2)}</p>
                  </div>

                  <button onClick={() => setShowSplitModal(false)} className="w-full bg-pier-neon text-pier-900 font-bold py-3 rounded-xl hover:shadow-lg transition-all">
                      Confirmar
                  </button>
              </div>
          </div>
      )}
    </div>

    {/* RECEIPT PRINT LAYOUT (Hidden on Screen, Visible on Print) */}
    {/* Using FIXED positioning to break out of any overflow:hidden parents */}
    <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 m-0 overflow-auto">
        <div className="w-[58mm] mx-auto p-1 font-mono text-black text-[10px] leading-tight">
            <div className="text-center mb-3 border-b border-black pb-1 border-dashed">
                <h1 className="text-sm font-bold uppercase">PIER DO COSTA</h1>
                <p>Restaurante & Bar</p>
                <p>{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
            </div>
            
            <div className="mb-3 border-b border-black pb-1 border-dashed">
                <div className="flex justify-between">
                    <span>MESA: {table.number}</span>
                    <span className="truncate ml-2">{table.customName}</span>
                </div>
                <div>Garçom: {waiterName}</div>
                <div className="font-bold text-center mt-1">Conferência de Conta</div>
            </div>

            <div className="mb-3">
                <div className="flex font-bold border-b border-black border-dashed pb-1 mb-1">
                    <span className="w-6">Qtd</span>
                    <span className="flex-1 truncate">Item</span>
                    <span className="w-10 text-right">Total</span>
                </div>
                {order.items.map((item, idx) => (
                    <div key={idx} className="flex mb-1">
                        <span className="w-6">{item.quantity}</span>
                        <span className="flex-1 truncate pr-1">{item.productName}</span>
                        <span className="w-10 text-right">{item.total.toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-black border-dashed pt-1 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {order.subtotal.toFixed(2)}</span>
                </div>
                {includeService && (
                    <div className="flex justify-between">
                        <span>Serviço (10%):</span>
                        <span>R$ {(order.subtotal * 0.1).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-black">
                    <span>TOTAL:</span>
                    <span>R$ {finalTotal.toFixed(2)}</span>
                </div>
            </div>

            <div className="text-center mt-6 text-[9px]">
                <p>*** NÃO É DOCUMENTO FISCAL ***</p>
                <p>Obrigado pela preferência!</p>
            </div>
        </div>
    </div>
    </>
  );
};

// Helper Icon components just for this file if not imported
const PlusCircleIcon = ({ size }: { size: number }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);