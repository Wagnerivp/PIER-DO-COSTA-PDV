import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Expense } from '../types';
import { DollarSign, Plus, Trash2, TrendingUp, TrendingDown, Package, Users, Settings, Droplets } from 'lucide-react';

export const Finance = () => {
  const { orders, expenses, addExpense, removeExpense, products, commissionLogs, users } = useApp();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Expense['category']>('MAINTENANCE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    addExpense({
      id: `exp-${Date.now()}`,
      description,
      amount: parseFloat(amount),
      category,
      date: new Date()
    });

    setDescription('');
    setAmount('');
  };

  // Metrics Calculation
  const closedOrders = orders.filter(o => o.status === 'CLOSED');
  
  // Total Revenue Month
  const totalRevenue = closedOrders.reduce((acc, o) => acc + o.total, 0);

  // Total COGS (Cost of Goods Sold)
  const totalCost = closedOrders.reduce((acc, order) => {
    return acc + order.items.reduce((itemAcc, item) => {
        const product = products.find(p => p.id === item.productId);
        return itemAcc + ((product?.cost || 0) * item.quantity);
    }, 0);
  }, 0);

  // Paid Commissions
  const paidCommissions = commissionLogs.reduce((acc, l) => acc + l.amount, 0); // Might want to consider only Paid or all ?
  
  // Expenses
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Gross Profit (Revenue - COGS)
  const grossProfit = totalRevenue - totalCost;

  // Net Profit (Gross Profit - Commissions - Expenses)
  const netProfit = grossProfit - paidCommissions - totalExpenses;

  // Breakdown by Category
  const getExpenseByCategory = (cat: string) => expenses.filter(e => e.category === cat).reduce((acc, e) => acc + e.amount, 0);

  const getIcon = (cat: string) => {
      switch(cat) {
          case 'MAINTENANCE': return <Settings size={18} />;
          case 'CLEANING': return <Droplets size={18} />;
          case 'SALARY': return <Users size={18} />;
          case 'SUPPLIES': return <Package size={18} />;
          default: return <DollarSign size={18} />;
      }
  };

  const getLabel = (cat: string) => {
      switch(cat) {
          case 'MAINTENANCE': return 'Manutenção';
          case 'CLEANING': return 'Limpeza';
          case 'SALARY': return 'Funcionários';
          case 'SUPPLIES': return 'Insumos';
          default: return 'Outros';
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-10 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-white">Gestão Financeira</h2>
        
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <p className="text-slate-400 text-sm mb-1">Receita Total</p>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-pier-green/10 text-pier-green rounded-xl">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">R$ {totalRevenue.toFixed(2)}</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <p className="text-slate-400 text-sm mb-1">Custos Produtos Vendidos</p>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
                        <TrendingDown size={24} />
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">R$ {totalCost.toFixed(2)}</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <p className="text-slate-400 text-sm mb-1">Despesas Operacionais</p>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                        <DollarSign size={24} />
                    </div>
                    <p className="text-3xl font-bold font-mono text-white">R$ {(totalExpenses + paidCommissions).toFixed(2)}</p>
                </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-pier-neon/30 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-pier-neon/10 to-pier-green/10 opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                    <p className="text-pier-neon text-sm mb-1 font-bold">Lucro Líquido</p>
                    <div className="flex items-center gap-4">
                        <p className={`text-4xl font-bold font-mono ${netProfit >= 0 ? 'text-pier-neon' : 'text-red-400'}`}>
                            R$ {netProfit.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 glass-panel p-6 rounded-2xl h-fit border border-white/10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                    <Plus size={20} className="text-pier-neon" /> Novo Gasto
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Descrição</label>
                        <input 
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none transition-all"
                            placeholder="Ex: Conta de Luz"
                            required
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Valor (R$)</label>
                            <input 
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon font-mono focus:outline-none transition-all"
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-slate-400 mb-1">Categoria</label>
                            <select 
                                value={category}
                                onChange={e => setCategory(e.target.value as any)}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:border-pier-neon focus:outline-none appearance-none transition-all"
                            >
                                <option value="MAINTENANCE" className="bg-slate-900 border-none outline-none">Manutenção</option>
                                <option value="CLEANING" className="bg-slate-900">Limpeza</option>
                                <option value="SALARY" className="bg-slate-900">Funcionários</option>
                                <option value="SUPPLIES" className="bg-slate-900">Insumos</option>
                                <option value="OTHER" className="bg-slate-900">Outros</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-pier-neon/20 mt-4">
                        Registrar Despesa
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10">
                    <h4 className="text-sm font-bold text-slate-300 mb-4">Resumo por Categoria</h4>
                    <div className="space-y-3">
                        {['MAINTENANCE', 'CLEANING', 'SALARY', 'SUPPLIES', 'OTHER'].map(cat => {
                            const catValue = getExpenseByCategory(cat);
                            if (catValue === 0 && cat !== 'SALARY') return null;
                            const totalCat = cat === 'SALARY' ? catValue + paidCommissions : catValue;
                            
                            return (
                                <div key={cat} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2 text-slate-400">
                                        {getIcon(cat)} <span>{getLabel(cat)} {cat === 'SALARY' ? '(inc. Comissões)' : ''}</span>
                                    </div>
                                    <span className="font-mono text-white">R$ {totalCat.toFixed(2)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10">
                 <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">
                    Últimas Despesas
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase text-slate-400 bg-white/5">
                            <tr>
                                <th className="p-3 rounded-l-lg font-medium">Data</th>
                                <th className="p-3 font-medium">Descrição</th>
                                <th className="p-3 font-medium">Categoria</th>
                                <th className="p-3 font-medium">Valor</th>
                                <th className="p-3 rounded-r-lg font-medium text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                            {expenses.sort((a,b) => b.date.getTime() - a.date.getTime()).map(exp => (
                                <tr key={exp.id} className="hover:bg-white/5">
                                    <td className="p-3 text-slate-300">{exp.date.toLocaleDateString()}</td>
                                    <td className="p-3 text-white font-medium">{exp.description}</td>
                                    <td className="p-3">
                                        <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold bg-white/10 text-slate-300 px-2 py-1 rounded">
                                            {getIcon(exp.category)} {getLabel(exp.category)}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono font-bold text-red-400">R$ {exp.amount.toFixed(2)}</td>
                                    <td className="p-3 text-right">
                                        <button 
                                            onClick={() => removeExpense(exp.id)}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-2"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-8 text-slate-500">Nenhuma despesa registrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
  );
};
