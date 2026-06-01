import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { DollarSign, CheckCircle, Clock, TrendingUp, Filter, Users } from 'lucide-react';

export const WaiterPanel = () => {
  const { currentUser, commissionLogs, orders, users } = useApp();
  const [selectedWaiterFilter, setSelectedWaiterFilter] = useState<string>('ALL');

  // If Manager, show all. If Waiter, show only theirs.
  const isManager = currentUser?.role === 'MANAGER' || currentUser?.role === 'ADMIN';
  
  // Filter logic
  const targetWaiterId = isManager 
      ? (selectedWaiterFilter === 'ALL' ? undefined : selectedWaiterFilter)
      : currentUser?.id;

  // 1. Calculate "A RECEBER" (Potential Commission from OPEN tables)
  const openOrders = orders.filter(o => 
    o.status === 'OPEN' && 
    (targetWaiterId ? o.waiterId === targetWaiterId : true)
  );
  
  const potentialCommission = openOrders.reduce((acc, o) => acc + (o.subtotal * 0.10), 0);

  // 2. Calculate "RECEBIDO" (Commission from CLOSED tables - Logs)
  const relevantLogs = commissionLogs.filter(log => 
      targetWaiterId ? log.waiterId === targetWaiterId : true
  );

  const realizedCommission = relevantLogs.reduce((acc, l) => acc + l.amount, 0);

  const waiters = users.filter(u => u.role === 'WAITER');

  return (
    <div className="space-y-8 animate-fade-in h-[calc(100vh-6rem)] flex flex-col">
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
                        <option value="ALL">Todos os Garçons</option>
                        {waiters.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-pier-neon/20 bg-gradient-to-br from-pier-neon/5 to-transparent relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10"><TrendingUp size={64} /></div>
                <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-pier-neon" />
                    <p className="text-xs text-pier-neon uppercase tracking-wider font-bold">A Receber (Mesas Abertas)</p>
                </div>
                <p className="text-4xl font-bold text-white font-mono">R$ {potentialCommission.toFixed(2)}</p>
                <p className="text-xs text-slate-400 mt-2">Comissão projetada sobre mesas em atendimento</p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-pier-green/20 bg-gradient-to-br from-pier-green/5 to-transparent relative overflow-hidden">
                <div className="absolute right-0 top-0 p-4 opacity-10"><DollarSign size={64} /></div>
                 <div className="flex items-center gap-2 mb-2">
                    <CheckCircle size={18} className="text-pier-green" />
                    <p className="text-xs text-pier-green uppercase tracking-wider font-bold">Recebido (Pago)</p>
                </div>
                <p className="text-4xl font-bold text-white font-mono">R$ {realizedCommission.toFixed(2)}</p>
                 <p className="text-xs text-slate-400 mt-2">Valor acumulado já fechado em caixa</p>
            </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col border border-white/10">
            <div className="p-4 border-b border-white/10 bg-slate-900/50 flex justify-between items-center">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                    <Clock size={18} className="text-slate-400" /> Histórico de Lançamentos
                </h3>
                <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">Últimos lançamentos</span>
            </div>
            <div className="overflow-y-auto flex-1">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
                        <tr>
                            <th className="p-4 font-medium">Data</th>
                            {isManager && <th className="p-4 font-medium">Garçom</th>}
                            <th className="p-4 font-medium">Pedido</th>
                            <th className="p-4 font-medium text-right">Valor</th>
                            <th className="p-4 font-medium text-center">Status</th>
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
                                return (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 text-slate-300 whitespace-nowrap">{new Date(log.date).toLocaleString()}</td>
                                        {isManager && <td className="p-4 text-white font-medium">{waiterName}</td>}
                                        <td className="p-4 text-slate-500 font-mono text-xs">{log.orderId.split('-')[1]}</td>
                                        <td className="p-4 text-pier-neon font-bold text-right font-mono">R$ {log.amount.toFixed(2)}</td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-pier-green bg-pier-green/10 border border-pier-green/20 px-2.5 py-1 rounded-full">
                                                <CheckCircle size={10} /> PAGO
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};