import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { CATEGORIES } from '../constants';
import { Trash2, Plus, Package, Search, Edit3, Save, X } from 'lucide-react';
import { Product } from '../types';

export const Products = () => {
  const { products, addProduct, updateProduct, removeProduct, currentUser, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Mobile View State
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('list');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [stock, setStock] = useState('100');
  
  // UI States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !cost) return;

    if (editingId) {
        const existing = products.find(p => p.id === editingId);
        const stockDiff = parseInt(stock) - (existing?.stock || 0);
        
        const updated: Product = {
            id: editingId,
            name,
            price: parseFloat(price.replace(',', '.')),
            cost: parseFloat(cost.replace(',', '.')),
            categoryId: category,
            stock: parseInt(stock),
            lastStockUpdate: stockDiff !== 0 ? new Date() : existing?.lastStockUpdate
        };
        updateProduct(updated);
        setEditingId(null);
        showToast('Produto atualizado!');
    } else {
        const newProduct: Product = {
            id: `p-${Date.now()}`,
            name,
            price: parseFloat(price.replace(',', '.')),
            cost: parseFloat(cost.replace(',', '.')),
            categoryId: category,
            stock: parseInt(stock),
            lastStockUpdate: new Date()
        };
        addProduct(newProduct);
        showToast('Produto cadastrado!');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setCost('');
    setStock('100');
    setCategory(CATEGORIES[0].id);
  };

  const handleEdit = (product: Product) => {
      setEditingId(product.id);
      setName(product.name || '');
      setPrice(product.price?.toString() || '0');
      setCost(product.cost?.toString() || '0');
      setStock(product.stock?.toString() || '0');
      setCategory(product.categoryId);
      setActiveTab('form');
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab('list');
  };

  // Calculate monthly sales per product
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const monthlySalesMap: Record<string, number> = {};
  
  orders.forEach(o => {
      // Only count CLOSED orders for actual sales, or OPEN too? Let's say CLOSED.
      if (o.status === 'CLOSED' && o.closedAt && new Date(o.closedAt) >= startOfMonth) {
          o.items.forEach(item => {
              monthlySalesMap[item.productId] = (monthlySalesMap[item.productId] || 0) + item.quantity;
          });
      }
  });

  const getSubcategoryWeight = (name: string) => {
      const lower = name.toLowerCase();
      if (lower.includes('600') || lower.includes('600ml')) return 1;
      if (lower.includes('latão') || lower.includes('latao') || lower.includes('473')) return 2;
      if (lower.includes('long neck') || lower.includes('longneck') || lower.includes('330')) return 3;
      return 4; // Outros
  };

  const sortedProducts = [...products].sort((a, b) => {
      // 1. Categoria
      const catOrderA = CATEGORIES.findIndex(c => c.id === a.categoryId);
      const catOrderB = CATEGORIES.findIndex(c => c.id === b.categoryId);
      if (catOrderA !== catOrderB) return catOrderA - catOrderB;
      
      // 2. Subcategoria (600, Latao, Long Neck)
      const subA = getSubcategoryWeight(a.name);
      const subB = getSubcategoryWeight(b.name);
      if (subA !== subB) return subA - subB;

      // 3. Ordem alfabética
      const nameCompare = a.name.localeCompare(b.name);
      if (nameCompare !== 0) return nameCompare;

      // 4. Data da última atualização de estoque
      const d1 = a.lastStockUpdate ? new Date(a.lastStockUpdate).getTime() : 0;
      const d2 = b.lastStockUpdate ? new Date(b.lastStockUpdate).getTime() : 0;
      return d2 - d1; // newest first
  });

  const filtered = sortedProducts.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'MANAGER') {
      return (
          <div className="flex items-center justify-center h-full text-slate-400">
              Acesso restrito ao Operador/Gerente.
          </div>
      )
  }

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-6rem)] flex flex-col relative">
        {/* Toast */}
        {toastMessage && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-pier-green text-pier-900 px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
                <span>{toastMessage}</span>
            </div>
        )}

        {/* Delete Modal */}
        {productToDelete && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-slate-900 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                    <h3 className="text-2xl font-bold text-white mb-4">Excluir Produto?</h3>
                    <p className="text-slate-400 mb-8">Esta ação não pode ser desfeita. O produto não aparecerá mais no catálogo para novas vendas.</p>
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setProductToDelete(null)}
                            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 font-bold rounded-xl transition-all"
                        >
                            CANCELAR
                        </button>
                        <button 
                            onClick={() => {
                                removeProduct(productToDelete);
                                setProductToDelete(null);
                                showToast('Produto excluído!');
                            }}
                            className="flex-1 px-4 py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 font-bold rounded-xl transition-all"
                        >
                            EXCLUIR
                        </button>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center shrink-0">
            <h2 className="text-3xl font-bold text-white">Gestão de Produtos</h2>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex gap-2 lg:hidden shrink-0">
            <button
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'form' ? 'bg-pier-neon text-pier-900 shadow-lg' : 'bg-white/5 text-slate-400 border border-white/5'}`}
            >
                {editingId ? <Edit3 size={18} /> : <Plus size={18} />}
                {editingId ? 'Editando' : 'Novo'}
            </button>
            <button
                onClick={() => setActiveTab('list')}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'list' ? 'bg-pier-neon text-pier-900 shadow-lg' : 'bg-white/5 text-slate-400 border border-white/5'}`}
            >
                <Package size={18} />
                Ver Produtos
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0">
            {/* Form Section */}
            <div className={`glass-panel p-6 rounded-2xl flex flex-col h-full overflow-y-auto scrollbar-thin ${activeTab === 'form' ? 'block' : 'hidden lg:flex'}`}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4 shrink-0">
                    {editingId ? <Edit3 size={20} className="text-pier-neon" /> : <Plus size={20} className="text-pier-neon" />} 
                    {editingId ? 'Editar Produto' : 'Cadastrar Novo'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4 shrink-0">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Nome do Produto</label>
                        <input 
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none focus:bg-black/40 transition-all"
                            placeholder="Ex: Cerveja X"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Custo (R$)</label>
                            <input 
                                type="text"
                                inputMode="decimal"
                                value={cost}
                                onChange={e => setCost(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none focus:bg-black/40 transition-all font-mono"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Venda (R$)</label>
                            <input 
                                type="text"
                                inputMode="decimal"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none focus:bg-black/40 transition-all font-mono"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Estoque</label>
                            <input 
                                type="number"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none focus:bg-black/40 transition-all"
                                required
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center bg-pier-green/5 border border-pier-green/20 rounded-lg p-2 px-4 mt-2">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Lucro / Unidade</p>
                            <p className="text-sm font-bold text-pier-green font-mono">
                                R$ {Math.max(0, parseFloat((price || '0').replace(',', '.')) - parseFloat((cost || '0').replace(',', '.'))).toFixed(2)}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Margem Bruta</p>
                            <p className="text-sm font-bold text-pier-neon font-mono">
                                {parseFloat((price || '0').replace(',', '.')) > 0 ? Math.round(((parseFloat((price || '0').replace(',', '.')) - parseFloat((cost || '0').replace(',', '.'))) / parseFloat((price || '0').replace(',', '.'))) * 100) : 0}%
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    type="button"
                                    key={cat.id}
                                    onClick={() => setCategory(cat.id)}
                                    className={`p-2 rounded-lg border text-xs transition-all flex flex-col items-center gap-1 ${category === cat.id ? 'bg-pier-neon/20 border-pier-neon text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'}`}
                                >
                                    <span className="text-lg">{cat.icon}</span> 
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6 pt-4 border-t border-white/10">
                        {editingId && (
                            <button 
                                type="button"
                                onClick={handleCancelEdit}
                                className="flex-1 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={18} /> CANCELAR
                            </button>
                        )}
                        <button type="submit" className="flex-1 bg-gradient-to-r from-pier-neon to-pier-green hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] text-pier-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                            <Save size={18} />
                            {editingId ? 'ATUALIZAR' : 'CADASTRAR'}
                        </button>
                    </div>
                </form>
            </div>

            {/* List Section */}
            <div className={`lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col overflow-hidden min-h-0 ${activeTab === 'list' ? 'block' : 'hidden lg:flex'}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 shrink-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Package size={20} className="text-pier-neon" /> Catálogo ({products.length})
                    </h3>
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nome..."
                            className="w-full bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white focus:border-pier-neon focus:outline-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filtered.map(p => {
                            const cat = CATEGORIES.find(c => c.id === p.categoryId);
                            const isEditing = editingId === p.id;
                            const profit = Math.max(0, p.price - (p.cost || 0));
                            const monthlySales = monthlySalesMap[p.id] || 0;
                            // Suggest to buy enough for at least 1 month of stock based on sales
                            const suggestedPurchase = Math.max(0, monthlySales - p.stock);

                            return (
                                <div key={p.id} className={`p-5 rounded-2xl border transition-all flex flex-col gap-4 ${isEditing ? 'bg-pier-neon/10 border-pier-neon' : 'glass-card border-white/10 hover:border-pier-neon/50'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-lg text-white">{p.name}</h4>
                                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                                                <span>{cat?.icon}</span> {cat?.name} {p.lastStockUpdate ? `• Atualizado: ${new Date(p.lastStockUpdate).toLocaleDateString('pt-BR')}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex bg-slate-900 border border-white/10 rounded-lg overflow-hidden shrink-0">
                                            <button 
                                                onClick={() => handleEdit(p)}
                                                className={`p-2 transition-colors ${isEditing ? 'bg-pier-neon text-pier-900' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                                                title="Editar"
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => setProductToDelete(p.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-colors border-l border-white/10"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-sm bg-black/20 p-3 rounded-xl border border-white/5">
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Custo</p>
                                            <p className="text-white font-mono">R$ {(p.cost || 0).toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Venda</p>
                                            <p className="text-pier-neon font-bold font-mono">R$ {p.price.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Lucro</p>
                                            <p className="text-pier-green font-bold font-mono">R$ {profit.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-slate-500 uppercase font-bold">Estoque / Vendas</p>
                                            <p className="text-white font-mono">
                                                <span className={p.stock < 10 ? 'text-red-400' : ''}>{p.stock}</span> / {monthlySales}
                                            </p>
                                        </div>
                                    </div>

                                    {suggestedPurchase > 0 ? (
                                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center justify-between">
                                            <p className="text-xs text-orange-400 font-medium">Estoque baixo para a demanda do mês!</p>
                                            <p className="text-xs font-bold text-orange-400 bg-orange-400/20 px-2 py-1 rounded-md">Comprar +{suggestedPurchase}</p>
                                        </div>
                                    ) : (
                                        <div className="bg-pier-green/5 border border-pier-green/10 rounded-xl p-3 flex items-center justify-center">
                                            <p className="text-xs text-pier-green font-medium">Estoque adequado 🚀</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    {filtered.length === 0 && (
                        <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-2">
                            <Search size={32} className="opacity-20" />
                            <p>Nenhum produto encontrado.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};