import React, { useState, useMemo } from 'react';
import { useApp } from '../services/AppContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Landmark } from 'lucide-react';
import { Product } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
  total: number;
}

export const FastSale = () => {
  const { products, processDirectSale, isRegisterOpen } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5); // top 5 results
  }, [searchTerm, products]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.product.price }
            : item
        );
      }
      return [...prev, { product, quantity: 1, total: product.price }];
    });
    setSearchTerm(''); // Clear search after adding
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity, total: newQuantity * item.product.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleFinalize = (method: string) => {
    if (cart.length === 0) return;
    processDirectSale(cart, method);
    setCart([]);
    setIsPaymentModalOpen(false);
    showToast('Venda finalizada com sucesso!');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.total, 0);

  if (!isRegisterOpen) {
      return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="text-amber-400 p-4 bg-amber-500/10 rounded-full">
                  <Banknote size={48} />
              </div>
              <h2 className="text-2xl font-bold text-white">Caixa Fechado</h2>
              <p className="text-slate-400">Abra o caixa no Controle de Caixa para iniciar vendas.</p>
          </div>
      );
  }

  return (
    <div className="flex flex-col h-full animate-fade-in max-w-5xl mx-auto w-full relative space-y-4">
      {/* Toast */}
      {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-pier-green text-pier-900 px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
              <span>{toastMessage}</span>
          </div>
      )}
      <div className="shrink-0">
        <h2 className="text-3xl font-bold text-white">Venda Rápida (Balcão)</h2>
        <p className="text-slate-400">Terminal Ponto de Venda</p>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 pb-4">
        {/* Left Side: Product Search */}
        <div className="lg:col-span-2 flex flex-col min-h-0 space-y-4">
            <div className="relative shrink-0">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Digite o nome do produto..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-black/40 border border-white/10 rounded-xl text-lg text-white focus:outline-none focus:border-pier-neon shadow-lg font-medium"
                        autoFocus
                    />
                </div>
                
                {searchTerm && filteredProducts.length > 0 && (
                    <div className="absolute top-16 left-0 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="w-full text-left px-6 py-4 hover:bg-slate-700 transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <h4 className="font-bold text-white text-lg">{product.name}</h4>
                                    <p className="text-sm text-slate-400">Estoque: {product.stock}</p>
                                </div>
                                <span className="font-mono text-pier-neon font-bold text-lg">R$ {product.price.toFixed(2)}</span>
                            </button>
                        ))}
                    </div>
                )}
                {searchTerm && filteredProducts.length === 0 && (
                    <div className="absolute top-16 left-0 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl z-50 p-6 text-center text-slate-400">
                        Nenhum produto encontrado.
                    </div>
                )}
            </div>

            {/* Visual list of products (optional quick add grid) */}
            <h3 className="text-lg font-bold text-white pt-4">Adicionais Rápidos</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {products.filter(p => !p.categoryId.includes('ticket')).slice(0, 6).map(product => (
                    <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="bg-slate-800/50 hover:bg-slate-700 border border-white/5 hover:border-pier-neon/50 rounded-xl p-4 text-left transition-all group"
                    >
                        <h5 className="font-bold text-white text-sm truncate group-hover:text-pier-neon transition-colors">{product.name}</h5>
                        <p className="text-xs text-slate-400 mt-1 font-mono">R$ {product.price.toFixed(2)}</p>
                    </button>
                ))}
            </div>
        </div>

        {/* Right Side: Cart */}
        <div className="lg:col-span-1 border border-white/10 rounded-2xl bg-black/20 flex flex-col h-[60vh] md:h-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5 rounded-t-2xl">
                <ShoppingCart className="text-pier-neon" size={24} />
                <h3 className="text-xl font-bold text-white">Carrinho</h3>
                <span className="ml-auto bg-pier-neon/20 text-pier-neon px-2 py-0.5 rounded-md font-bold text-sm">{cart.length} itens</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2 opacity-50">
                        <ShoppingCart size={48} />
                        <p>Carrinho vazio</p>
                    </div>
                ) : (
                    cart.map(item => (
                        <div key={item.product.id} className="bg-slate-800/50 p-3 rounded-xl border border-white/5 flex flex-col gap-3">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-white text-sm line-clamp-2">{item.product.name}</h4>
                                <button 
                                    onClick={() => removeFromCart(item.product.id)}
                                    className="text-red-400/50 hover:text-red-400 p-1 transition-colors"
                                    title="Remover produto"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center bg-black/40 rounded-lg border border-white/10 overflow-hidden">
                                    <button 
                                        onClick={() => updateQuantity(item.product.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                                    <button 
                                        onClick={() => updateQuantity(item.product.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <span className="font-mono text-white font-bold">R$ {item.total.toFixed(2)}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-4 border-t border-white/10 bg-black/40 rounded-b-2xl">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-slate-400 font-medium text-lg">Total</span>
                    <span className="text-2xl font-bold border-b-2 border-pier-neon text-white font-mono">
                        R$ {cartTotal.toFixed(2)}
                    </span>
                </div>
                <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    disabled={cart.length === 0}
                    className="w-full py-4 bg-pier-green text-black font-bold rounded-xl text-lg hover:shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                    Finalizar Venda
                </button>
            </div>
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative">
                <h3 className="text-2xl font-bold text-white mb-2">Finalizar Pagamento</h3>
                <p className="text-slate-400 mb-6 font-mono text-xl">Total: R$ {cartTotal.toFixed(2)}</p>

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleFinalize('CASH')}
                        className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white p-4 rounded-xl transition-all flex flex-col items-center gap-2 group"
                    >
                        <Banknote size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Dinheiro</span>
                    </button>
                    <button 
                        onClick={() => handleFinalize('CARD_CREDIT')}
                        className="bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white p-4 rounded-xl transition-all flex flex-col items-center gap-2 group"
                    >
                        <CreditCard size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Crédito</span>
                    </button>
                    <button 
                        onClick={() => handleFinalize('CARD_DEBIT')}
                        className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-white p-4 rounded-xl transition-all flex flex-col items-center gap-2 group"
                    >
                        <CreditCard size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">Débito</span>
                    </button>
                    <button 
                        onClick={() => handleFinalize('PIX')}
                        className="bg-purple-500/10 border border-purple-500/30 text-purple-400 hover:bg-purple-500 hover:text-white p-4 rounded-xl transition-all flex flex-col items-center gap-2 group"
                    >
                        <Landmark size={24} className="group-hover:scale-110 transition-transform" />
                        <span className="font-bold">PIX</span>
                    </button>
                </div>
                
                <button
                    onClick={() => setIsPaymentModalOpen(false)}
                    className="mt-8 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors font-medium"
                >
                    Cancelar
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

