import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { DollarSign, CheckCircle, Clock, TrendingUp, Filter, Users, MinusSquare, X, Trash2, Edit2 } from 'lucide-react';

export const WaiterPanel = () => {
  const { currentUser, commissionLogs, orders, users, addAdvance, deleteCommission, updateCommission, removeUser, updateUser } = useApp();
  const [selectedWaiterFilter, setSelectedWaiterFilter] = useState<string>('ALL');
  
  // Advance Modal State
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDescription, setAdvanceDescription] = useState('');
  const [advanceWaiterId, setAdvanceWaiterId] = useState<string>('');

  // If Manager, show all. If Waiter, show only theirs.
  const isManager = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN';
  
  // Filter logic
  const targetWaiterId = isManager 
      ? (selectedWaiterFilter === 'ALL' ? undefined : selectedWaiterFilter)
      : currentUser?.id;

  const relevantLogs = commissionLogs.filter(log => 
      targetWaiterId ? log.waiterId === targetWaiterId : true
  );

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0,0,0,0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const calculateTotals = (logs: any[], waiterOrders: any[]) => {
      const daily = logs.filter(l => new Date(l.date) >= startOfDay).reduce((acc, l) => acc + (l.amount || 0), 0);
      const weekly = logs.filter(l => new Date(l.date) >= startOfWeek).reduce((acc, l) => acc + (l.amount || 0), 0);
      const monthly = logs.filter(l => new Date(l.date) >= startOfMonth).reduce((acc, l) => acc + (l.amount || 0), 0);
      const pending = waiterOrders.filter(o => o.status === 'OPEN').reduce((acc, o) => acc + ((o.subtotal || 0) * 0.10), 0);
      return { daily, weekly, monthly, pending };
  };

  const dailyTotal = relevantLogs.filter(l => new Date(l.date) >= startOfDay).reduce((acc, l) => acc + (l.amount || 0), 0);
  const weeklyTotal = relevantLogs.filter(l => new Date(l.date) >= startOfWeek).reduce((acc, l) => acc + (l.amount || 0), 0);
  const monthlyTotal = relevantLogs.filter(l => new Date(l.date) >= startOfMonth).reduce((acc, l) => acc + (l.amount || 0), 0);

  // 1. Calculate "A RECEBER" (Potential Commission from OPEN tables)
  const openOrders = orders.filter(o => 
    o.status === 'OPEN' && 
    (targetWaiterId ? o.waiterId === targetWaiterId : true)
  );
  
  const potentialCommission = openOrders.reduce((acc, o) => acc + ((o.subtotal || 0) * 0.10), 0);

  const waiters = users.filter(u => u.role === 'WAITER');

  const handleAddAdvance = () => {
      const amount = parseFloat(advanceAmount);
      if (amount > 0 && advanceWaiterId) {
          addAdvance(advanceWaiterId, amount, advanceDescription || 'Vale adiantamento');
          setIsAdvanceModalOpen(false);
          setAdvanceAmount('');
          setAdvanceDescription('');
      }
  };

  return (
    <div className="space-y-8 animate-fade-in h-full overflow-y-auto pb-8 pr-2 scrollbar-thin">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h2 className="text-3xl font-bold text-white">
                    {isManager ? 'Gestão de Comissões' : 'Minhas Comissões'}
                </h2>
                {isManager && <p className="text-slate-400 text-sm">Acompanhe o desempenho da equipe</p>}
            </div>

            {isManager && (
                <div className="flex items-center gap-2 bg-slate-800 p-1 rounded-lg border border-white/10">
                    <div className="px-3 py-2 text-slate-400 flex items-center gap-2 border-r border-white/10">
                        <Filter size={16} /> <span className="text-sm font-medium">Filtrar:</span>
                    </div>
                    <select 
                        value={selectedWaiterFilter}
                        onChange={(e) => setSelectedWaiterFilter(e.target.value)}
                        className="bg-transparent text-white text-sm outline-none px-2 py-1 min-w-[150px]"
                    >
                        <option value="ALL" className="text-black">Todos os Garçons</option>
                        {waiters.map(w => (
                            <option key={w.id} value={w.id} className="text-black">{w.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-pier-neon/20 bg-gradient-to-br from-pier-neon/5 to-transparent relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10"><TrendingUp size={64} /></div>
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-pier-neon" />
                    <p className="text-xs text-pier-neon uppercase tracking-wider font-bold">A Receber</p>
                </div>
                <p className="text-3xl font-bold text-white font-mono">R$ {potentialCommission.toFixed(2)}</p>
                <p className="text-[10px] text-slate-400 mt-2">Mesas em atendimento</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-pier-green/20 bg-gradient-to-br from-pier-green/5 to-transparent relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10"><CheckCircle size={64} /></div>
                 <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-pier-green" />
                    <p className="text-xs text-pier-green uppercase tracking-wider font-bold">Hoje</p>
                </div>
                <p className="text-3xl font-bold text-white font-mono">R$ {dailyTotal.toFixed(2)}</p>
                 <p className="text-[10px] text-slate-400 mt-2">Total diário fechado</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10"><Clock size={64} /></div>
                 <div className="flex items-center gap-2 mb-2">
                    <Clock size={18} className="text-blue-400" />
                    <p className="text-xs text-blue-400 uppercase tracking-wider font-bold">Semana</p>
                </div>
                <p className="text-3xl font-bold text-white font-mono">R$ {weeklyTotal.toFixed(2)}</p>
                 <p className="text-[10px] text-slate-400 mt-2">Fechado na semana (abate vales)</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10"><DollarSign size={64} /></div>
                 <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} className="text-purple-400" />
                    <p className="text-xs text-purple-400 uppercase tracking-wider font-bold">Mês</p>
                </div>
                <p className="text-3xl font-bold text-white font-mono">R$ {monthlyTotal.toFixed(2)}</p>
                 <p className="text-[10px] text-slate-400 mt-2">Fechado no mês (abate vales)</p>
            </div>
        </div>

        {isManager && (
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsAdvanceModalOpen(true)}
                    className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold text-sm"
                >
                    <MinusSquare size={18} /> LANÇAR VALE (ADIANTAMENTO)
                </button>
            </div>
        )}

        {isManager && (
            <>
                <h3 className="font-bold text-xl text-white mt-8 mb-4">Comissões por Garçom</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {waiters.map(waiter => {
                        const waiterLogs = commissionLogs.filter(l => l.waiterId === waiter.id);
                        const waiterOrders = orders.filter(o => o.waiterId === waiter.id);
                        const totals = calculateTotals(waiterLogs, waiterOrders);
                        
                        return (
                            <div key={waiter.id} className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-pier-neon/30 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10">
                                            <Users size={20} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white uppercase">{waiter.name}</h4>
                                            <p className="text-xs text-slate-400">Garçom</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button 
                                            onClick={() => {
                                                const newName = window.prompt("Editar nome do garçom:", waiter.name);
                                                if (newName) {
                                                    updateUser({ ...waiter, name: newName });
                                                }
                                            }}
                                            className="p-1.5 text-slate-500 hover:text-pier-neon hover:bg-pier-neon/10 rounded-lg transition-colors"
                                            title="Editar Garçom"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button 
                                            onClick={() => {
                                                if (window.confirm(`Deseja realmente excluir o garçom ${waiter.name}?`)) {
                                                    removeUser(waiter.id);
                                                }
                                            }}
                                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                            title="Excluir Garçom"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">A Receber:</span>
                                        <span className="text-pier-neon font-bold font-mono text-base">R$ {totals.pending.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                                        <span className="text-slate-400">Hoje:</span>
                                        <span className="text-pier-green font-bold font-mono">R$ {totals.daily.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Semana:</span>
                                        <span className="text-blue-400 font-bold font-mono">R$ {totals.weekly.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-400">Mês:</span>
                                        <span className="text-purple-400 font-bold font-mono">R$ {totals.monthly.toFixed(2)}</span>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <button
                                        onClick={() => {
                                            setAdvanceWaiterId(waiter.id);
                                            setIsAdvanceModalOpen(true);
                                        }}
                                        className="w-full text-center py-2 text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors border border-white/5 uppercase"
                                    >
                                        Lançar Vale
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
        )}

        <div className="glass-panel rounded-2xl overflow-hidden border border-white/10 mt-8">
            <div className="p-4 border-b border-white/10 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Clock size={18} className="text-slate-400" /> Histórico de Lançamentos
                </h3>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">Últimos lançamentos</span>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-4 font-medium">Data</th>
                            {isManager && <th className="p-4 font-medium">Garçom</th>}
                            <th className="p-4 font-medium">Pedido</th>
                            <th className="p-4 font-medium text-right">Valor</th>
                            <th className="p-4 font-medium text-center">Status</th>
                            {isManager && <th className="p-4 font-medium text-center">Ações</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {relevantLogs.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                                    <DollarSign size={32} className="opacity-20" />
                                    <span>Nenhum registro encontrado.</span>
                                </td>
                            </tr>
                        ) : (
                            relevantLogs.slice().reverse().map(log => {
                                const waiterName = users.find(u => u.id === log.waiterId)?.name;
                                const isAdvance = log.type === 'ADVANCE';
                                return (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-slate-300 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                        {isManager && <td className="p-4 text-white font-medium">{waiterName}</td>}
                                        <td className="p-4 text-slate-500 font-mono text-xs">
                                            {isAdvance ? (log.description || 'Vale') : (log.orderId ? (log.orderId.includes('-') ? log.orderId.split('-')[1] : log.orderId) : '-')}
                                        </td>
                                        <td className={`p-4 font-bold text-right font-mono ${isAdvance ? 'text-red-400' : 'text-pier-neon'}`}>
                                            R$ {(log.amount || 0).toFixed(2)}
                                        </td>
                                        <td className="p-4 text-center">
                                            {isAdvance ? (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full uppercase">
                                                    <MinusSquare size={10} /> VALE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pier-green bg-pier-green/10 border border-pier-green/20 px-2.5 py-1 rounded-full uppercase">
                                                    <CheckCircle size={10} /> PAGO
                                                </span>
                                            )}
                                        </td>
                                        {isManager && (
                                            <td className="p-4 text-center">
                                                <button
                                                    onClick={() => {
                                                        const newVal = window.prompt('Digite o novo valor:', log.amount.toString());
                                                        if (newVal && !isNaN(parseFloat(newVal))) {
                                                            updateCommission(log.id, { amount: parseFloat(newVal) });
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-500 hover:text-pier-neon hover:bg-pier-neon/10 rounded-lg transition-colors mr-1"
                                                    title="Editar Lançamento"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('Deseja realmente excluir este lançamento?')) {
                                                            deleteCommission(log.id);
                                                        }
                                                    }}
                                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                    title="Excluir Lançamento"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal Lançar Vale */}
        {isAdvanceModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-red-500/30 animate-scale-in relative">
                    <button 
                        onClick={() => setIsAdvanceModalOpen(false)} 
                        className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                    
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-6">
                        <MinusSquare className="text-red-400" />
                        Lançar Vale 
                    </h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Selecione o Garçom</label>
                            <select 
                                value={advanceWaiterId}
                                onChange={(e) => setAdvanceWaiterId(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-all"
                            >
                                <option value="" disabled className="text-black">Escolha um garçom...</option>
                                {waiters.map(w => (
                                    <option key={w.id} value={w.id} className="text-black">{w.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Valor do Adiantamento</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">R$</span>
                                <input 
                                    type="number"
                                    value={advanceAmount}
                                    onChange={(e) => setAdvanceAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-red-400 transition-all font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Motivo (Opcional)</label>
                            <input 
                                type="text"
                                value={advanceDescription}
                                onChange={(e) => setAdvanceDescription(e.target.value)}
                                placeholder="Ex: Vale transporte, lanche..."
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-400 transition-all"
                            />
                        </div>

                        <button 
                            onClick={handleAddAdvance}
                            disabled={!advanceWaiterId || !advanceAmount || parseFloat(advanceAmount) <= 0}
                            className="w-full py-3 mt-4 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Confirmar Lançamento
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};