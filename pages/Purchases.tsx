import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Purchase, PurchaseSupplier } from '../types';
import { ShoppingCart, Plus, Trash2, Edit2, CheckCircle, PackageSearch } from 'lucide-react';

const SUPPLIERS: { id: PurchaseSupplier; name: string }[] = [
    { id: 'COZINHA', name: 'Insumos Cozinha' },
    { id: 'AMBEV', name: 'Ambev' },
    { id: 'HEINEKEN', name: 'Heineken' },
    { id: 'DEPOSITO', name: 'Depósito' },
    { id: 'OUTROS', name: 'Outros' },
];

export const Purchases = () => {
    const { purchases, addPurchase, updatePurchase, removePurchase, currentUser } = useApp();
    const isManager = currentUser?.role === 'ADMIN' || currentUser?.role === 'MANAGER';
    
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [supplier, setSupplier] = useState<PurchaseSupplier>('COZINHA');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date || !paymentDate) return;

        if (editingId) {
            const existing = purchases.find(p => p.id === editingId);
            if (existing) {
                updatePurchase({
                    ...existing,
                    description,
                    amount: parseFloat(amount),
                    supplier,
                    date: new Date(date + 'T12:00:00Z'),
                    paymentDate: new Date(paymentDate + 'T12:00:00Z'),
                });
            }
            setEditingId(null);
        } else {
            addPurchase({
                id: `pur-${Date.now()}`,
                description,
                amount: parseFloat(amount),
                supplier,
                date: new Date(date + 'T12:00:00Z'),
                paymentDate: new Date(paymentDate + 'T12:00:00Z'),
                status: 'PENDING'
            });
        }
        
        setDescription('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setPaymentDate(new Date().toISOString().split('T')[0]);
    };

    const handleEdit = (p: Purchase) => {
        setEditingId(p.id);
        setDescription(p.description);
        setAmount(p.amount.toString());
        setSupplier(p.supplier);
        setDate(new Date(p.date).toISOString().split('T')[0]);
        setPaymentDate(new Date(p.paymentDate).toISOString().split('T')[0]);
    };

    if (!isManager) {
        return <div className="p-8 text-slate-400">Acesso Restrito.</div>;
    }

    // Sort by payment date, pending first
    const sortedPurchases = [...purchases].sort((a, b) => {
        if (a.status === 'PENDING' && b.status === 'PAID') return -1;
        if (a.status === 'PAID' && b.status === 'PENDING') return 1;
        return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
    });

    const totalPending = sortedPurchases.filter(p => p.status === 'PENDING').reduce((acc, p) => acc + p.amount, 0);
    const totalPaid = sortedPurchases.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in relative pb-10 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart className="text-pier-neon" size={32} /> Compras / Insumos
                </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent relative overflow-hidden">
                    <p className="text-xs text-red-500 uppercase tracking-wider font-bold mb-1">Total a Pagar (Pendente)</p>
                    <p className="text-3xl font-bold text-white font-mono">R$ {totalPending.toFixed(2)}</p>
                </div>
                <div className="glass-card p-6 rounded-2xl border border-pier-green/20 bg-gradient-to-br from-pier-green/5 to-transparent relative overflow-hidden">
                    <p className="text-xs text-pier-green uppercase tracking-wider font-bold mb-1">Total Pago</p>
                    <p className="text-3xl font-bold text-white font-mono">R$ {totalPaid.toFixed(2)}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-card p-6 rounded-2xl h-fit border border-white/10">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        {editingId ? <Edit2 size={20} className="text-pier-neon" /> : <Plus size={20} className="text-pier-neon" />}
                        {editingId ? 'Editar Compra' : 'Registrar Compra'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Fornecedor</label>
                            <select 
                                value={supplier}
                                onChange={(e) => setSupplier(e.target.value as PurchaseSupplier)}
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:border-pier-neon outline-none"
                            >
                                {SUPPLIERS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                            <input 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: Fardos de Heineken 600"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:border-pier-neon outline-none placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white font-mono focus:border-pier-neon outline-none placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Data da Compra</label>
                                <input 
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:border-pier-neon outline-none [color-scheme:dark]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Vencimento</label>
                                <input 
                                    type="date"
                                    value={paymentDate}
                                    onChange={(e) => setPaymentDate(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl p-3 text-white focus:border-pier-neon outline-none [color-scheme:dark]"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-pier-neon/20 mt-4">
                            {editingId ? 'Atualizar' : 'Registrar'}
                        </button>
                        {editingId && (
                            <button type="button" onClick={() => {
                                setEditingId(null);
                                setDescription('');
                                setAmount('');
                            }} className="w-full bg-white/5 border border-white/10 text-slate-300 font-bold py-2 rounded-xl mt-2 hover:bg-white/10 transition-all">
                                Cancelar
                            </button>
                        )}
                    </form>
                </div>

                <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-white/10 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead className="bg-slate-900/80 text-slate-400 text-sm">
                            <tr>
                                <th className="p-3">Status</th>
                                <th className="p-3">Data / Venc.</th>
                                <th className="p-3">Fornecedor</th>
                                <th className="p-3">Descrição</th>
                                <th className="p-3">Valor</th>
                                <th className="p-3 text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 whitespace-nowrap">
                            {sortedPurchases.map(p => {
                                const supplierName = SUPPLIERS.find(s => s.id === p.supplier)?.name || p.supplier;
                                const isOverdue = p.status === 'PENDING' && new Date(p.paymentDate) < new Date();
                                return (
                                    <tr key={p.id} className="hover:bg-white/5 transition-colors text-sm">
                                        <td className="p-3">
                                            {p.status === 'PAID' ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-pier-green bg-pier-green/10 px-2 py-1 rounded-full"><CheckCircle size={10} /> Pago</span>
                                            ) : isOverdue ? (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">Atrasado</span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">Pendente</span>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <p className="text-slate-300 font-medium">{new Date(p.date).toLocaleDateString('pt-BR')}</p>
                                            <p className={`text-xs ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-500'}`}>
                                                Venc: {new Date(p.paymentDate).toLocaleDateString('pt-BR')}
                                            </p>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-pier-neon font-medium">{supplierName}</span>
                                        </td>
                                        <td className="p-3">
                                            <span className="text-slate-300 truncate block max-w-xs" title={p.description}>{p.description}</span>
                                        </td>
                                        <td className="p-3 font-mono font-bold text-lg text-white">
                                            R$ {p.amount.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-1">
                                                {p.status === 'PENDING' && (
                                                    <button 
                                                        onClick={() => {
                                                            if(window.confirm('Marcar como PAGO?')) {
                                                                updatePurchase({...p, status: 'PAID'});
                                                            }
                                                        }}
                                                        className="text-pier-green hover:bg-pier-green/10 p-2 rounded-lg transition-colors title='Marcar Pago'"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleEdit(p)}
                                                    className="text-slate-500 hover:text-pier-neon transition-colors p-2"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (window.confirm('Excluir compra?')) {
                                                            removePurchase(p.id);
                                                        }
                                                    }}
                                                    className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {sortedPurchases.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        <PackageSearch size={32} className="mx-auto mb-2 opacity-50" />
                                        Nenhuma compra registrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
