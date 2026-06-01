import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { CATEGORIES } from '../constants';
import { Trash2, Plus, Package, Search, Edit3, Save, X } from 'lucide-react';
import { Product } from '../types';

export const Products = () => {
  const { products, addProduct, updateProduct, removeProduct, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mobile View State
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('list');

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
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
    if (!name || !price) return;

    if (editingId) {
        const updated: Product = {
            id: editingId,
            name,
            price: parseFloat(price),
            cost: parseFloat(price) * 0.4,
            categoryId: category,
            stock: parseInt(stock)
        };
        updateProduct(updated);
        setEditingId(null);
        showToast('Produto atualizado com sucesso!');
    } else {
        const newProduct: Product = {
            id: `p-${Date.now()}`,
            name,
            price: parseFloat(price),
            cost: parseFloat(price) * 0.4,
            categoryId: category,
            stock: parseInt(stock)
        };
        addProduct(newProduct);
        showToast('Produto cadastrado com sucesso!');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setPrice('');
    setStock('100');
    setCategory(CATEGORIES[0].id);
  };

  const handleEdit = (product: Product) => {
      setEditingId(product.id);
      setName(product.name);
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setCategory(product.categoryId);
      // Switch to form view on mobile so user can see what they are editing
      setActiveTab('form');
  };

  const handleCancelEdit = () => {
    resetForm();
    setActiveTab('list');
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
            <div className={`glass-panel p-6 rounded-2xl h-fit overflow-y-auto ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                    {editingId ? <Edit3 size={20} className="text-pier-neon" /> : <Plus size={20} className="text-pier-neon" />} 
                    {editingId ? 'Editar Produto' : 'Cadastrar Novo'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Preço Venda (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none focus:bg-black/40 transition-all"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Estoque Inicial</label>
                            <input 
                                type="number"
                                value={stock}
                                onChange={e => setStock(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none focus:bg-black/40 transition-all"
                                required
                            />
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
                        <button className="flex-1 bg-gradient-to-r from-pier-neon to-pier-green hover:shadow-[0_0_15px_rgba(34,211,238,0.4)] text-pier-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
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

                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900/80 text-slate-400 text-sm sticky top-0 backdrop-blur-md z-10">
                            <tr>
                                <th className="p-3 rounded-tl-lg">Produto</th>
                                <th className="hidden sm:table-cell p-3">Categoria</th>
                                <th className="p-3">Preço</th>
                                <th className="hidden sm:table-cell p-3">Estoque</th>
                                <th className="p-3 rounded-tr-lg text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filtered.map(p => {
                                const cat = CATEGORIES.find(c => c.id === p.categoryId);
                                const isEditing = editingId === p.id;
                                return (
                                    <tr key={p.id} className={`transition-colors group ${isEditing ? 'bg-pier-neon/10 border-l-2 border-pier-neon' : 'hover:bg-white/5'}`}>
                                        <td className="p-3">
                                            <p className="font-medium text-white">{p.name}</p>
                                            <p className="sm:hidden text-xs text-slate-500">{cat?.name} • Est: {p.stock}</p>
                                        </td>
                                        <td className="hidden sm:table-cell p-3 text-slate-400 text-sm">
                                            <span className="flex items-center gap-2">{cat?.icon} {cat?.name}</span>
                                        </td>
                                        <td className="p-3 text-pier-neon font-bold font-mono">R$ {p.price.toFixed(2)}</td>
                                        <td className="hidden sm:table-cell p-3 text-slate-300">{p.stock}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(p)}
                                                    className={`p-2 rounded-lg transition-all flex items-center gap-2 ${isEditing ? 'bg-pier-neon text-pier-900 shadow-md' : 'text-blue-400 hover:bg-blue-500/10 bg-white/5 border border-white/5'}`}
                                                    title="Editar"
                                                >
                                                    <Edit3 size={16} /> 
                                                    <span className="hidden sm:inline text-xs font-bold">{isEditing ? 'Editando' : 'Editar'}</span>
                                                </button>
                                                <button 
                                                    onClick={() => setProductToDelete(p.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/10 bg-white/5 border border-white/5 rounded-lg transition-colors"
                                                    title="Excluir"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
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