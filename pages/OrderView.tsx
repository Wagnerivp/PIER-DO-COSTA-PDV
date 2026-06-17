import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../services/AppContext';
import { ArrowLeft, Search, Receipt, CreditCard, Banknote, QrCode, Calculator, Minus, Plus, Edit2, Users, X, RefreshCw, Trash2, Printer, MessageCircle, Bell } from 'lucide-react';
import { CATEGORIES } from '../constants';
import html2canvas from 'html2canvas';
import { supabase } from '../services/supabase';

interface Props {
  tableId: string;
  onBack: () => void;
}

export const OrderView = ({ tableId, onBack }: Props) => {
  const { tables, orders, products, addToOrder, removeFromOrder, closeAccount, payPartialAccount, updateTableName, cancelOrder, requestCheckout, currentUser, customers, addCustomer, updateCustomer } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('c-all');
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [isNotifying, setIsNotifying] = useState(false);
  
  // Partial Payment State (Conta Separada)
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialPaymentModalOpen, setPartialPaymentModalOpen] = useState(false);
  const [partialItems, setPartialItems] = useState<{productId: string, quantity: number, price: number, productName: string}[]>([]);

  // WhatsApp Share State
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  
  // Payment State
  const [includeService, setIncludeService] = useState(true);
  const [customServiceFee, setCustomServiceFee] = useState<number | null>(null);
  const [isEditingService, setIsEditingService] = useState(false);
  const [editServiceInput, setEditServiceInput] = useState('');

  const [cashReceived, setCashReceived] = useState<string>('');
  const [showCashInput, setShowCashInput] = useState(false);

  // Split Bill State
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitCount, setSplitCount] = useState(2);
  
  // Rename Table State
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  // Mobile layout state
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Prompt states
  const [resetTableModalOpen, setResetTableModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [paidReceiptData, setPaidReceiptData] = useState<any>(null);
  const [cashError, setCashError] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const table = tables.find(t => t.id === tableId);
  const order = orders.find(o => o.id === table?.currentOrderId);
  
  useEffect(() => {
      if (table?.customName) setTempName(table.customName);
  }, [table]);

  if (!table || !order) return null;

  const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredProducts = products.filter(p => 
    (selectedCategory === 'c-all' || p.categoryId === selectedCategory) && 
    normalizeString(p.name).includes(normalizeString(searchTerm))
  );

  const partialSubtotal = partialItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const currentSubtotal = isPartialPayment ? partialSubtotal : order.subtotal;
  
  const calculatedServiceFee = currentSubtotal * 0.1;
  const activeServiceFee = includeService 
      ? (customServiceFee !== null ? customServiceFee : calculatedServiceFee)
      : 0;

  const finalTotal = currentSubtotal + activeServiceFee;
  const changeAmount = cashReceived ? parseFloat(cashReceived) - finalTotal : 0;
  const waiterName = useApp().users.find(u => u.id === order.waiterId)?.name;

  const handleNotifyCashier = async () => {
      try {
          setIsNotifying(true);
          
          // Sincroniza via estado JSON (sem depender da tabela SQL estar criada)
          requestCheckout(tableId);
          
          // Tenta salvar via Realtime (caso a tabela exista), mas sem bloquear o app com erro
          const { error } = await supabase.from('cashier_notifications').insert({
              table_id: tableId,
              table_number: table?.number,
              waiter_name: currentUser?.name || 'Garçom'
          });
          if (error) {
              console.log('Ignorando erro de tabela SQL:', error);
          }
          
          alert("Pedido enviado ao caixa de forma garantida!");
      } catch (err) {
          console.error(err);
      } finally {
          setIsNotifying(false);
      }
  };

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
    
    // Build Receipt Data
    const receiptData = {
        isPartial: isPartialPayment,
        items: isPartialPayment ? partialItems.filter(i => i.quantity > 0) : order.items,
        subtotal: currentSubtotal,
        serviceFee: activeServiceFee,
        total: finalTotal,
        method: method,
        cashReceived: cashReceived ? parseFloat(cashReceived) : 0,
        change: changeAmount,
        date: new Date()
    };
    
    if (isPartialPayment) {
        payPartialAccount(tableId, partialItems, method, activeServiceFee);
        setPaidReceiptData(receiptData);
        setPaymentModalOpen(false);
        setIsPartialPayment(false);
        setShowCashInput(false);
        setCashReceived('');
        setCustomServiceFee(null);
        setPartialItems([]);
    } else {
        closeAccount(tableId, method, activeServiceFee);
        setPaidReceiptData(receiptData);
        setPaymentModalOpen(false);
    }
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, '');
      setCustomerPhone(val);
      const existing = customers.find(c => c.phone === val);
      if (existing) {
          setCustomerName(existing.name);
      }
  };

  const handleSendWhatsApp = async () => {
    if (!customerPhone) {
        showToast("Preencha o telefone do cliente.");
        return;
    }
    
    // Auto save customer
    const existingCustomer = customers.find(c => c.phone === customerPhone);
    if (!existingCustomer) {
        addCustomer({ id: Date.now().toString(), name: customerName || 'Cliente', phone: customerPhone });
    } else if (customerName && existingCustomer.name !== customerName) {
        updateCustomer({ ...existingCustomer, name: customerName });
    }
    
    setIsGeneratingReceipt(true);
    let receiptEl = document.getElementById('receipt-print-area');

    if (receiptEl) {
        try {
            // Need to temporarily show the receipt element to allow html2canvas to render it properly
            receiptEl.classList.remove('hidden', 'print:block', 'fixed', 'left-[-9999px]');
            receiptEl.classList.add('fixed', 'top-[5000px]', 'left-[5000px]'); // move deeply off-screen but standard display
            
            const canvas = await html2canvas(receiptEl, { scale: 2, useCORS: true });
            
            // Revert changes
            receiptEl.classList.remove('fixed', 'top-[5000px]', 'left-[5000px]');
            receiptEl.classList.add('hidden', 'print:block', 'fixed', 'left-[-9999px]');

            canvas.toBlob(async (blob) => {
                if (!blob) {
                    setIsGeneratingReceipt(false);
                    return;
                }
                const file = new File([blob], `cupom-mesa-${table.number}.png`, { type: 'image/png' });
                
                // Try Web Share API (Mobile native sharing)
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            title: 'Cupom Pier do Costa',
                            text: 'Aqui está seu cupom fiscal eletrônico!',
                            files: [file]
                        });
                        setWhatsappModalOpen(false);
                    } catch (error) {
                        console.error('Share failed', error);
                        // Fallback to whatsapp link
                        window.open(`https://wa.me/55${customerPhone}?text=Ol%C3%A1%20${encodeURIComponent(customerName)}%2C%20aqui%20est%C3%A1%20o%20resumo%20da%20sua%20conta%20no%20Pier%20do%20Costa!%20Total%3A%20R%24%20${finalTotal.toFixed(2)}`);
                    }
                } else {
                    // Desktop or unsupported: We download the image automatically and open Whatsapp Web
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cupom-mesa-${table.number}.png`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    showToast("A imagem foi baixada. Você pode anexá-la na conversa do WhatsApp.");
                    window.open(`https://wa.me/55${customerPhone}?text=Ol%C3%A1%20${encodeURIComponent(customerName)}%2C%20segue%20em%20anexo%20o%20seu%20cupom%20eletr%C3%B4nico%20do%20Pier%20do%20Costa!`);
                    setWhatsappModalOpen(false);
                }
                setIsGeneratingReceipt(false);
            }, 'image/png');
        } catch (error) {
            console.error(error);
            setIsGeneratingReceipt(false);
            showToast("Erro ao gerar cupom.");
        }
    }
  };

  return (
    <>
    {/* Toast Message */}
    {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-pier-green text-pier-900 px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
            <span>{toastMessage}</span>
        </div>
    )}

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
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in print:hidden">
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
    <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0 animate-fade-in print:hidden relative">
      {/* Mobile Tab Toggle */}
      <div className="md:hidden flex rounded-xl p-1 bg-slate-900 border border-white/10 shrink-0">
          <button 
              onClick={() => setMobileTab('catalog')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mobileTab === 'catalog' ? 'bg-slate-800 text-white shadow' : 'text-slate-400'}`}
          >
              Catálogo
          </button>
          <button 
              onClick={() => setMobileTab('cart')} 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors relative ${mobileTab === 'cart' ? 'bg-pier-neon text-pier-900 shadow' : 'text-slate-400'}`}
          >
              Comanda 
              {order.items.length > 0 && <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${mobileTab === 'cart' ? 'bg-pier-900 text-pier-neon' : 'bg-pier-neon text-pier-900'}`}>{order.items.length}</span>}
          </button>
      </div>

      {/* Left: Product Catalog */}
      <div className={`flex-1 flex-col gap-4 min-h-0 order-2 md:order-1 ${mobileTab === 'catalog' ? 'flex' : 'hidden md:flex'}`}>
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
      <div className={`w-full md:w-80 lg:w-[400px] glass-panel rounded-2xl flex-col h-full md:h-full border border-white/10 order-1 md:order-2 shrink-0 shadow-2xl overflow-hidden relative ${mobileTab === 'cart' ? 'flex animate-scale-in' : 'hidden md:flex'}`}>
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

        <div className="flex-1 w-full flex flex-col overflow-y-auto scrollbar-thin p-3 space-y-2 min-h-0">
                {order.items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-30 select-none py-10">
                    <Receipt size={48} className="mb-2 stroke-1" />
                    <p className="text-sm font-light">Nenhum item lançado</p>
                </div>
            ) : (
                order.items.map((item, idx) => {
                    const isSelected = selectedProductIds.includes(item.productId);
                    return (
                        <div key={`${item.productId}-${idx}`} className={`flex justify-between items-center p-3 rounded-xl border transition-all group animate-fade-in-up ${isSelected ? 'bg-pier-neon/10 border-pier-neon' : 'bg-white/5 border-white/5 hover:border-pier-neon/30'}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                                <button 
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedProductIds(prev => prev.filter(id => id !== item.productId));
                                        } else {
                                            setSelectedProductIds(prev => [...prev, item.productId]);
                                        }
                                    }}
                                    className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-pier-neon border-pier-neon text-black' : 'border-slate-500 bg-black/50 text-transparent'}`}
                                >
                                    ✓
                                </button>
                                
                                <div className="flex-1 min-w-0">
                                    <p className={`font-medium text-sm truncate ${isSelected ? 'text-pier-neon' : 'text-white'}`}>{item.productName}</p>
                                    <p className="text-xs text-slate-400">R$ {item.price.toFixed(2)} un</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col items-end">
                                    <span className={`font-bold text-sm ${isSelected ? 'text-pier-neon' : 'text-white'}`}>R$ {item.total.toFixed(2)}</span>
                                    <span className="text-xs text-slate-400 font-mono">x{item.quantity}</span>
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
                    );
                })
            )}

            {/* Floating Action Bar for Group Partial Payment */}
            {selectedProductIds.length > 0 && (
                <div className="fixed md:absolute bottom-32 md:bottom-36 left-4 right-4 md:left-2 md:right-2 z-[90] animate-fade-in-up">
                    <button 
                        onClick={() => {
                            setPartialItems(
                                order.items
                                    .filter(i => selectedProductIds.includes(i.productId))
                                    .map(i => ({productId: i.productId, quantity: i.quantity, price: i.price, productName: i.productName}))
                            );
                            setIsPartialPayment(true);
                            setPartialPaymentModalOpen(true);
                            setSelectedProductIds([]); // clear selection
                        }}
                        className="w-full bg-gradient-to-r from-pier-neon to-pier-cyan text-black font-black uppercase tracking-wide py-4 rounded-xl shadow-[0_10px_30px_rgba(34,211,238,0.5)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Banknote size={20} />
                        PAGAR {selectedProductIds.length} ITEN{selectedProductIds.length > 1 ? 'S' : ''} MENU{selectedProductIds.length > 1 ? 'S' : ''}
                    </button>
                </div>
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

            <div className="shrink-0 p-4 bg-slate-900 border-t border-white/10 shadow-[0_-5px_20px_rgba(0,0,0,0.2)] z-10 mt-auto">
                <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-slate-400 text-xs mt-2">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-mono text-sm">R$ {order.subtotal.toFixed(2)}</span>
                </div>
                
                <div className={`w-full flex justify-between items-center p-3 mt-2 rounded-xl border transition-all ${includeService ? 'bg-pier-neon/10 border-pier-neon text-pier-neon' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700/50'}`}>
                    <div 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => setIncludeService(!includeService)}
                    >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${includeService ? 'bg-pier-neon border-pier-neon' : 'border-slate-500'}`}>
                            {includeService && <div className="w-2 h-2 bg-slate-900 rounded-[2px]" />}
                        </div>
                        <span className="font-bold text-sm">Serviço {customServiceFee === null ? '(10%)' : '(Customizado)'}</span>
                    </div>
                    {includeService && (
                        <div className="flex items-center gap-2">
                             {isEditingService ? (
                                 <div className="flex items-center gap-1">
                                     <input 
                                         type="number"
                                         className="w-20 bg-black/50 border border-pier-neon rounded px-2 py-1 text-right font-mono text-sm text-pier-neon outline-none"
                                         value={editServiceInput}
                                         autoFocus
                                         onChange={e => setEditServiceInput(e.target.value)}
                                     />
                                     <button 
                                         onClick={() => {
                                             const val = parseFloat(editServiceInput);
                                             if (!isNaN(val) && val >= 0) {
                                                setCustomServiceFee(val);
                                             } else {
                                                setCustomServiceFee(null); // revert to 10%
                                             }
                                             setIsEditingService(false);
                                         }}
                                         className="bg-pier-neon text-slate-900 px-2 py-1 rounded text-xs font-bold"
                                     >
                                         OK
                                     </button>
                                 </div>
                             ) : (
                                 <div className="flex items-center gap-2">
                                     <span className="font-mono font-bold">R$ {activeServiceFee.toFixed(2)}</span>
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditServiceInput(activeServiceFee.toFixed(2));
                                            setIsEditingService(true);
                                        }}
                                        className="text-pier-neon/70 hover:text-white"
                                     >
                                         <Edit2 size={14} />
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}
                    {!includeService && (
                        <span className="font-mono font-bold text-slate-500">R$ 0.00</span>
                    )}
                </div>

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
                    IMPRIMIR VIA DO CLIENTE {includeService ? (customServiceFee !== null ? '(SERV. EDITADO)' : '(COM 10%)') : '(SEM TAXA)'}
                </button>
                <button
                    onClick={() => setWhatsappModalOpen(true)}
                    className="w-full p-4 rounded-xl border border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/20 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                    <MessageCircle size={20} />
                    ENVIAR COTA POR WHATSAPP
                </button>
                <button 
                    onClick={() => {
                        setIsPartialPayment(false);
                        setShowCashInput(false);
                        setPaymentModalOpen(true);
                    }}
                    disabled={order.items.length === 0}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold text-lg hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                    ENCERRAR VENDA E PAGAR
                </button>
                <button
                    onClick={handleNotifyCashier}
                    disabled={order.items.length === 0 || isNotifying}
                    className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Bell size={24} className={isNotifying ? "animate-pulse" : ""} />
                    {isNotifying ? "ENVIANDO..." : "SOLICITAR FECHAMENTO E IMPRESSÃO"}
                </button>
            </div>
        </div>
        </div>
      </div>

      {/* WhatsApp Modal */}
      {whatsappModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in print:hidden">
              <div className="glass-panel w-full max-w-sm rounded-2xl p-6 border border-white/10 animate-scale-in">
                  <div className="flex justify-between items-start mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageCircle className="text-green-400" /> WhatsApp
                    </h2>
                    <button onClick={() => setWhatsappModalOpen(false)} className="text-slate-400 hover:text-white p-2">
                        <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Telefone com DDD</label>
                          <input
                            type="tel"
                            maxLength={15}
                            value={customerPhone}
                            onChange={handlePhoneChange}
                            placeholder="Ex: 11999998888"
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 font-mono text-lg transition-colors"
                            autoFocus
                          />
                      </div>
                      <div className="relative">
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nome do Cliente</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => {
                                setCustomerName(e.target.value);
                                // Optional auto-fill if perfect match
                                const match = customers.find(c => c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === e.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase());
                                if (match && !customerPhone) setCustomerPhone(match.phone);
                            }}
                            placeholder="Buscar cliente ou digitar novo..."
                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-400 text-lg transition-colors"
                          />
                          {customerName && customerName.length >= 2 && !customers.find(c => c.name === customerName && c.phone === customerPhone) && (
                              <div className="absolute top-full left-0 w-full mt-1 bg-slate-800 border border-white/10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] z-[60] overflow-hidden divide-y divide-white/5 max-h-40 overflow-y-auto">
                                  {customers.filter(c => c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(customerName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase())).map(c => (
                                      <button
                                          key={c.id}
                                          type="button"
                                          onClick={() => {
                                              setCustomerName(c.name);
                                              setCustomerPhone(c.phone);
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-slate-700 transition-colors flex justify-between"
                                      >
                                          <span className="text-white">{c.name}</span>
                                          <span className="text-slate-400 font-mono text-sm">{c.phone}</span>
                                      </button>
                                  ))}
                              </div>
                          )}
                      </div>
                      
                      <button 
                        onClick={handleSendWhatsApp}
                        disabled={isGeneratingReceipt || !customerPhone}
                        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-black font-bold text-lg py-4 rounded-xl transition-all disabled:opacity-50"
                      >
                          {isGeneratingReceipt ? 'GERANDO CUPOM...' : 'ENVIAR CUPOM'}
                      </button>
                      <p className="text-center text-xs text-slate-500 mt-2">
                          Uma imagem do cupom será gerada e enviada via WhatsApp.
                      </p>
                  </div>
              </div>
          </div>
      )}

      {/* Success & Print Modal */}
      {paidReceiptData && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:hidden animate-fade-in">
              <div className="bg-slate-900 border border-pier-neon p-8 rounded-3xl w-full max-w-sm shadow-[0_0_50px_rgba(34,211,238,0.2)] text-center">
                  <div className="w-20 h-20 bg-pier-neon/20 rounded-full flex items-center justify-center mx-auto mb-6">
                     <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pier-neon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Pago com Sucesso!</h2>
                  <p className="text-slate-400 mb-8">
                     Valor total: <span className="text-white font-bold text-lg">R$ {paidReceiptData.total.toFixed(2)}</span>
                  </p>

                  <div className="flex flex-col gap-3">
                      <button 
                          onClick={() => window.print()}
                          className="w-full py-4 rounded-xl bg-gradient-to-r from-pier-neon to-pier-green text-black font-bold text-lg uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                      >
                          <Printer size={24} />
                          Imprimir Via do Cliente
                      </button>
                      <button 
                          onClick={() => {
                              setPaidReceiptData(null);
                              if (!paidReceiptData.isPartial) {
                                  onBack();
                              }
                          }}
                          className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all"
                      >
                          FECHAR
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Payment Modal */}
      {paymentModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:hidden">
              <div className="glass-panel w-full max-w-2xl rounded-2xl p-6 border border-white/10 animate-scale-in flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-start mb-4 shrink-0">
                    <h2 className="text-2xl font-bold text-white">Pagamento {isPartialPayment && <span className="text-pier-neon">(Conta Separada)</span>}</h2>
                    <div className="flex gap-2">
                    {isPartialPayment && (
                        <button onClick={handlePrintConference} className="flex items-center gap-2 text-pier-neon hover:text-white border border-pier-neon/30 px-3 py-1.5 rounded-lg hover:bg-pier-neon/20 transition-all text-sm">
                            <Printer size={16} /> Imprimir Via
                        </button>
                    )}
                    {!isPartialPayment && (
                        <>
                            <button onClick={handlePrintConference} className="flex items-center gap-2 text-pier-neon hover:text-white border border-pier-neon/30 px-3 py-1.5 rounded-lg hover:bg-pier-neon/20 transition-all text-sm">
                                <Printer size={16} /> Imprimir Via
                            </button>
                            <button onClick={() => {
                                setPartialItems(order.items.map(i => ({productId: i.productId, quantity: 0, price: i.price, productName: i.productName})));
                                setPartialPaymentModalOpen(true);
                                setPaymentModalOpen(false);
                            }} className="flex items-center gap-2 text-orange-400 hover:text-white border border-orange-400/30 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-all text-sm">
                                Fechar Separado
                            </button>
                            <button onClick={() => setShowSplitModal(true)} className="flex items-center gap-2 text-pier-neon hover:text-white border border-pier-neon/30 px-3 py-1.5 rounded-lg hover:bg-pier-neon/20 transition-all text-sm">
                                <Users size={16} /> Dividir Fixo
                            </button>
                        </>
                    )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin min-h-0">
                      {/* List of items being paid */}
                      <div className="space-y-2 mb-6 bg-black/20 p-3 rounded-xl border border-white/5">
                          {(isPartialPayment ? partialItems.filter(i => i.quantity > 0) : order.items).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="text-slate-300"><span className="text-pier-neon font-bold mr-2">{isPartialPayment ? item.quantity : item.quantity}x</span> {item.productName}</span>
                                  <span className="text-slate-400 font-mono">R$ {((isPartialPayment ? item.quantity : item.quantity) * item.price).toFixed(2)}</span>
                              </div>
                          ))}
                          {isPartialPayment && partialItems.filter(i => i.quantity > 0).length === 0 && (
                              <p className="text-center text-slate-500 text-sm py-2">Nenhum item selecionado</p>
                          )}
                          {!isPartialPayment && order.items.length === 0 && (
                              <p className="text-center text-slate-500 text-sm py-2">Mesa vazia</p>
                          )}
                      </div>
                  
                  <div className="text-center mb-6">
                      <p className="text-slate-400 mb-1">Valor Total</p>
                      <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pier-neon to-pier-green font-mono">
                        R$ {finalTotal.toFixed(2)}
                      </h1>
                  </div>

                  <div className={`w-full flex justify-between items-center p-3 mb-6 rounded-xl border transition-all ${includeService ? 'bg-pier-neon/10 border-pier-neon text-pier-neon' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700/50'}`}>
                    <div 
                        className="flex items-center gap-2 cursor-pointer flex-1"
                        onClick={() => setIncludeService(!includeService)}
                    >
                        <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${includeService ? 'bg-pier-neon border-pier-neon' : 'border-slate-500'}`}>
                            {includeService && <div className="w-2 h-2 bg-slate-900 rounded-[2px]" />}
                        </div>
                        <span className="font-bold text-sm">Serviço {customServiceFee === null ? '(10%)' : '(Customizado)'}</span>
                    </div>
                    {includeService && (
                        <div className="flex items-center gap-2">
                             {isEditingService ? (
                                 <div className="flex items-center gap-1">
                                     <input 
                                         type="number"
                                         className="w-20 bg-black/50 border border-pier-neon rounded px-2 py-1 text-right font-mono text-sm text-pier-neon outline-none"
                                         value={editServiceInput}
                                         autoFocus
                                         onChange={e => setEditServiceInput(e.target.value)}
                                     />
                                     <button 
                                         onClick={() => {
                                             const val = parseFloat(editServiceInput);
                                             if (!isNaN(val) && val >= 0) {
                                                setCustomServiceFee(val);
                                             } else {
                                                setCustomServiceFee(null); // revert to 10%
                                             }
                                             setIsEditingService(false);
                                         }}
                                         className="bg-pier-neon text-slate-900 px-2 py-1 rounded text-xs font-bold"
                                     >
                                         OK
                                     </button>
                                 </div>
                             ) : (
                                 <div className="flex items-center gap-2">
                                     <span className="font-mono font-bold">R$ {activeServiceFee.toFixed(2)}</span>
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditServiceInput(activeServiceFee.toFixed(2));
                                            setIsEditingService(true);
                                        }}
                                        className="text-pier-neon/70 hover:text-white"
                                     >
                                         <Edit2 size={14} />
                                     </button>
                                 </div>
                             )}
                        </div>
                    )}
                    {!includeService && (
                        <span className="font-mono font-bold text-slate-500">R$ 0.00</span>
                    )}
                </div>
                </div>

                <div className="shrink-0 pt-4 border-t border-white/10 mt-auto">
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
                      <div className="flex flex-col gap-2">
                        {isPartialPayment && (
                            <button
                                onClick={handlePrintConference}
                                className="w-full p-3 rounded-xl border border-pier-neon/30 text-pier-neon bg-pier-neon/5 hover:bg-pier-neon/20 font-bold flex items-center justify-center gap-2 transition-colors mb-2"
                            >
                                <Printer size={20} />
                                IMPRIMIR VIA (SEPARADA)
                            </button>
                        )}
                        <button onClick={() => { setPaymentModalOpen(false); setIsPartialPayment(false); setCustomServiceFee(null); }} className="w-full py-2 text-slate-400 hover:text-white text-sm">
                            Cancelar
                        </button>
                      </div>
                  )}
                  </div>
              </div>
          </div>
      )}

      {/* Partial Payment Selected Items Modal */}
      {partialPaymentModalOpen && (
          <div className="fixed inset-0 z-[105] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:hidden">
              <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-white/10 animate-scale-in flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                      <h3 className="text-xl font-bold text-white">Conta Separada</h3>
                      <button onClick={() => setPartialPaymentModalOpen(false)}><X size={20} className="text-slate-400" /></button>
                  </div>
                  
                  <p className="text-slate-400 text-sm mb-4 shrink-0">Selecione os itens e as quantidades que deseja pagar agora:</p>

                  <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-3 mb-6">
                      {partialItems.map((pItem, idx) => {
                          const originalItem = order.items.find(i => i.productId === pItem.productId);
                          if (!originalItem) return null;
                          return (
                              <div key={idx} className="flex flex-col gap-2 p-3 rounded-xl bg-slate-800/50 border border-white/5">
                                  <div className="flex justify-between items-start">
                                      <span className="font-bold text-white text-sm">{pItem.productName}</span>
                                      <span className="text-pier-neon font-mono text-xs">R$ {pItem.price.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center mt-1">
                                      <span className="text-xs text-slate-400">Restante na mesa: {originalItem.quantity - pItem.quantity}</span>
                                      <div className="flex items-center gap-3">
                                          <button 
                                            onClick={() => {
                                                const newItems = [...partialItems];
                                                newItems[idx].quantity = Math.max(0, newItems[idx].quantity - 1);
                                                setPartialItems(newItems);
                                            }}
                                            className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-white"
                                          >
                                              <Minus size={14} />
                                          </button>
                                          <span className="font-bold text-white min-w-[20px] text-center">{pItem.quantity}</span>
                                          <button 
                                            onClick={() => {
                                                const newItems = [...partialItems];
                                                newItems[idx].quantity = Math.min(originalItem.quantity, newItems[idx].quantity + 1);
                                                setPartialItems(newItems);
                                            }}
                                            disabled={pItem.quantity >= originalItem.quantity}
                                            className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                          >
                                              <Plus size={14} />
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>

                  <div className="shrink-0 pt-4 border-t border-white/10 mt-auto mb-4">
                      <div className="flex justify-between text-slate-400 text-xs mb-2">
                          <span className="text-sm">Subtotal dos Selecionados</span>
                          <span className="font-mono text-sm">R$ {partialSubtotal.toFixed(2)}</span>
                      </div>
                      
                      <div className={`w-full flex justify-between items-center p-3 mt-2 rounded-xl border transition-all ${includeService ? 'bg-pier-neon/10 border-pier-neon text-pier-neon' : 'bg-slate-800/50 border-white/10 text-slate-400 hover:bg-slate-700/50'}`}>
                          <div 
                              className="flex items-center gap-2 cursor-pointer flex-1"
                              onClick={() => setIncludeService(!includeService)}
                          >
                              <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${includeService ? 'bg-pier-neon border-pier-neon' : 'border-slate-500'}`}>
                                  {includeService && <div className="w-2 h-2 bg-slate-900 rounded-[2px]" />}
                              </div>
                              <span className="font-bold text-sm">Serviço {customServiceFee === null ? '(10%)' : '(Customizado)'}</span>
                          </div>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                          <span className="text-slate-400 text-sm">Total a Pagar</span>
                          <span className="text-2xl font-bold text-pier-neon font-mono">
                              R$ {(partialSubtotal + (includeService ? (customServiceFee !== null ? customServiceFee : partialSubtotal * 0.1) : 0)).toFixed(2)}
                          </span>
                      </div>
                  </div>

                  <div className="shrink-0 flex gap-3">
                      <button 
                          onClick={() => setPartialPaymentModalOpen(false)}
                          className="px-4 py-3 bg-white/5 text-slate-300 font-bold rounded-xl"
                      >
                          Voltar
                      </button>
                      <button 
                          onClick={() => {
                              const hasItems = partialItems.some(i => i.quantity > 0);
                              if (hasItems) {
                                  setIsPartialPayment(true);
                                  setPartialPaymentModalOpen(false);
                                  setPaymentModalOpen(true);
                              }
                          }}
                          disabled={!partialItems.some(i => i.quantity > 0)}
                          className="flex-1 bg-pier-neon text-pier-900 font-bold py-3 rounded-xl disabled:opacity-50"
                      >
                          Ir para Pagamento
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Split Bill Modal */}
      {showSplitModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
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
    <div id="receipt-print-area" className="hidden print:block fixed inset-0 bg-white z-[9999] p-0 m-0 overflow-auto">
        <div className="w-[58mm] mx-auto p-1 font-mono text-black text-[10px] leading-tight">
            <div className="text-center mb-3 border-b border-black pb-1 border-dashed flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><circle cx="12" cy="5" r="3"></circle><line x1="12" y1="22" x2="12" y2="8"></line><path d="M5 12H2a10 10 0 0 0 20 0h-3"></path></svg>
                <h1 className="text-sm font-bold uppercase">PIER DO COSTA</h1>
                <p>Restaurante & Bar</p>
                <p>{(paidReceiptData ? paidReceiptData.date : new Date()).toLocaleDateString()} {(paidReceiptData ? paidReceiptData.date : new Date()).toLocaleTimeString()}</p>
            </div>
            
            <div className="mb-3 border-b border-black pb-1 border-dashed">
                <div className="flex justify-between">
                    <span>MESA: {table.number}</span>
                    <span className="truncate ml-2">{table.customName}</span>
                </div>
                <div>Garçom: {waiterName}</div>
                <div className="font-bold text-center mt-1 text-xs">
                    {paidReceiptData ? 'Comprovante de Pagamento' : 'Conferência de Conta'}
                </div>
            </div>

            <div className="mb-3">
                <div className="flex font-bold border-b border-black border-dashed pb-1 mb-1">
                    <span className="w-6">Qtd</span>
                    <span className="flex-1 truncate">Item</span>
                    <span className="w-10 text-right">Total</span>
                </div>
                {(paidReceiptData ? paidReceiptData.items : (isPartialPayment ? partialItems.filter(i => i.quantity > 0) : order.items)).map((item: any, idx: number) => (
                    <div key={idx} className="flex mb-1">
                        <span className="w-6">{item.quantity}</span>
                        <span className="flex-1 truncate pr-1">{item.productName}</span>
                        <span className="w-10 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="border-t border-black border-dashed pt-1 space-y-1">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {(paidReceiptData ? paidReceiptData.subtotal : currentSubtotal).toFixed(2)}</span>
                </div>
                {(paidReceiptData ? paidReceiptData.serviceFee : activeServiceFee) > 0 && (
                    <div className="flex justify-between">
                        <span>Serviço:</span>
                        <span>R$ {(paidReceiptData ? paidReceiptData.serviceFee : activeServiceFee).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm mt-1 pt-1 border-t border-black">
                    <span>TOTAL:</span>
                    <span>R$ {(paidReceiptData ? paidReceiptData.total : finalTotal).toFixed(2)}</span>
                </div>
            </div>

            {paidReceiptData && (
                <div className="mt-3 border-t border-black border-dashed pt-2 space-y-1">
                    <div className="flex justify-between">
                        <span>Método pgto:</span>
                        <span className="font-bold">
                            {paidReceiptData.method === 'CARD_CREDIT' ? 'CRÉDITO' :
                             paidReceiptData.method === 'CARD_DEBIT' ? 'DÉBITO' :
                             paidReceiptData.method === 'PIX' ? 'PIX' : 'DINHEIRO'}
                        </span>
                    </div>
                    {paidReceiptData.method === 'CASH' && (
                        <>
                            <div className="flex justify-between">
                                <span>Valor recebido:</span>
                                <span>R$ {paidReceiptData.cashReceived.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Troco:</span>
                                <span>R$ {paidReceiptData.change.toFixed(2)}</span>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div className="text-center mt-6 text-[9px]">
                <p>{paidReceiptData ? 'VÁLIDO COMO RECIBO' : '*** NÃO É DOCUMENTO FISCAL ***'}</p>
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