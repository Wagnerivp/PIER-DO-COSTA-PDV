import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { DollarSign, CheckCircle, Clock, TrendingUp, Filter, Users, MinusSquare, X, Trash2, Edit2, Coffee } from 'lucide-react';
import { User, Order, CommissionLog, Product } from '../types';

const WaiterCard = ({ 
    waiter, 
    commissionLogs, 
    orders, 
    totals, 
    updateUser, 
    removeUser, 
    setAdvanceWaiterId, 
    setIsAdvanceModalOpen, 
    resetWaiterCommissions,
    addConsumption,
    products,
    updateProduct
}: {
    waiter: User;
    commissionLogs: CommissionLog[];
    orders: Order[];
    totals: any;
    updateUser: any;
    removeUser: any;
    setAdvanceWaiterId: any;
    setIsAdvanceModalOpen: any;
    resetWaiterCommissions: any;
    addConsumption: any;
    products: Product[];
    updateProduct: any;
}) => {
    const [activeTab, setActiveTab] = useState<'RESUMO' | 'CONSUMO'>('RESUMO');
    const [consumptionProductId, setConsumptionProductId] = useState('');

    const handleAddConsumption = () => {
        const prod = products.find(p => p.id === consumptionProductId);
        if (!prod) return;

        addConsumption(waiter.id, prod.price, `Consumo: ${prod.name}`);
        
        // Abate from stock
        updateProduct({
            ...prod,
            stock: Math.max(0, prod.stock - 1),
            lastStockUpdate: new Date()
        });

        setConsumptionProductId('');
        alert('Consumo lançado com sucesso!');
    };

    const consumptionsAndAdvances = commissionLogs.filter(l => l.waiterId === waiter.id && (l.type === 'ADVANCE' || l.type === 'CONSUMPTION'));

    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-pier-neon/30 transition-colors">
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

            {/* Arrangement Info */}
            <div className="mb-4 bg-black/20 p-2 rounded-lg border border-white/5 flex items-center justify-center text-xs">
                {totals.isComissioned ? (
                    <span className="text-pier-neon font-bold uppercase tracking-wider">Arranjo: 10% Comissão</span>
                ) : totals.fixedSalary ? (
                    <span className="text-pier-green font-bold uppercase tracking-wider">Fixo: R$ {totals.fixedSalary.amount.toFixed(2)} / {totals.fixedSalary.period}</span>
                ) : (
                    <span className="text-slate-500 uppercase tracking-wider">Ajuste Manual</span>
                )}
            </div>
            
            <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                <button 
                    onClick={() => setActiveTab('RESUMO')} 
                    className={`text-xs font-bold uppercase transition-colors ${activeTab === 'RESUMO' ? 'text-pier-neon' : 'text-slate-500 hover:text-white'}`}
                >
                    Resumo
                </button>
                <button 
                    onClick={() => setActiveTab('CONSUMO')} 
                    className={`text-xs font-bold uppercase transition-colors ${activeTab === 'CONSUMO' ? 'text-pier-neon' : 'text-slate-500 hover:text-white'}`}
                >
                    Vales e Consumo
                </button>
            </div>

            {activeTab === 'RESUMO' ? (
                <>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">A Receber Líquido:</span>
                            <span className="text-pier-neon font-bold font-mono text-base">R$ {totals.pending.toFixed(2)}</span>
                        </div>
                        {totals.isComissioned && (
                            <>
                                <div className="flex justify-between items-center text-sm border-t border-white/5 pt-2">
                                    <span className="text-slate-400">Comissões Hoje:</span>
                                    <span className="text-pier-green font-bold font-mono">R$ {totals.daily.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Comissões Semana:</span>
                                    <span className="text-blue-400 font-bold font-mono">R$ {totals.weekly.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Comissões Mês:</span>
                                    <span className="text-purple-400 font-bold font-mono">R$ {totals.monthly.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>
                </>
            ) : (
                <div className="space-y-4">
                    <div className="flex flex-col gap-2 bg-slate-900/50 p-3 rounded-lg border border-white/5">
                        <select 
                            value={consumptionProductId}
                            onChange={(e) => setConsumptionProductId(e.target.value)}
                            className="bg-black/50 text-white text-xs p-2 rounded border border-white/10 outline-none focus:border-pier-neon w-full"
                        >
                            <option value="">Selecione um Produto...</option>
                            {products.sort((a,b) => a.name.localeCompare(b.name)).map(p => (
                                <option key={p.id} value={p.id}>
                                    {p.name} - R$ {p.price.toFixed(2)} (Estoque: {p.stock})
                                </option>
                            ))}
                        </select>
                        <button 
                            onClick={handleAddConsumption}
                            disabled={!consumptionProductId}
                            className="bg-pier-neon text-pier-900 px-3 py-2 rounded text-xs font-bold w-full disabled:opacity-50 transition-opacity"
                        >
                            Lançar Consumo (-1 Estoque)
                        </button>
                    </div>
                    
                    <div className="max-h-32 overflow-y-auto scrollbar-thin pr-1 space-y-2">
                        {consumptionsAndAdvances.slice().reverse().map(log => (
                            <div key={log.id} className="flex justify-between items-center text-xs bg-white/5 p-2 rounded">
                                <div className="flex flex-col">
                                    <span className="text-slate-300 font-semibold">{log.description || (log.type === 'CONSUMPTION' ? 'Consumo' : 'Vale')}</span>
                                    <span className="text-[10px] text-slate-500">{new Date(log.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <span className="text-red-400 font-mono font-bold">-R$ {Math.abs(log.amount || 0).toFixed(2)}</span>
                            </div>
                        ))}
                        {consumptionsAndAdvances.length === 0 && (
                            <p className="text-xs text-slate-500 text-center py-2">Nenhum registro.</p>
                        )}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
                <button
                    onClick={() => {
                        setAdvanceWaiterId(waiter.id);
                        setIsAdvanceModalOpen(true);
                    }}
                    className="w-full text-center py-2 text-[10px] sm:text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors border border-white/5 uppercase"
                >
                    Lançar Vale
                </button>
                <button
                    onClick={() => {
                        if (window.confirm(`Deseja realmente ZERAR TODOS os valores e comissões lançadas para o garçom ${waiter.name}?`)) {
                            resetWaiterCommissions(waiter.id);
                        }
                    }}
                    className="w-full text-center py-2 text-[10px] sm:text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20 uppercase"
                >
                    Zerar Valores
                </button>
            </div>
        </div>
    );
};

export const WaiterPanel = () => {
  const { currentUser, commissionLogs, orders, users, products, addConsumption, addAdvance, deleteCommission, updateCommission, removeUser, updateUser, resetWaiterCommissions, updateProduct } = useApp();
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

  const calculateTotals = (logs: any[], waiterOrders: any[], waiterName: string) => {
      const wName = waiterName.toLowerCase();
      
      const isFixed = wName.includes('igor') || wName.includes('marley') || wName.includes('alicia');
      const isComissioned = !isFixed;
      
      const daily = logs.filter(l => new Date(l.date) >= startOfDay).reduce((acc, l) => acc + (l.amount || 0), 0);
      const weeklyLogs = logs.filter(l => new Date(l.date) >= startOfWeek);
      const monthlyLogs = logs.filter(l => new Date(l.date) >= startOfMonth);
      
      const weekly = weeklyLogs.reduce((acc, l) => acc + (l.amount || 0), 0);
      const monthly = monthlyLogs.reduce((acc, l) => acc + (l.amount || 0), 0);
      
      let pending = 0;
      let fixedSalary = null;

      if (isComissioned) {
          const comissionPending = waiterOrders.filter(o => o.status === 'OPEN').reduce((acc, o) => acc + ((o.subtotal || 0) * 0.10), 0);
          // For commissioned, A Receber is pending commissions + accumulated past commissions - advances (which is in 'logs').
          // Actually, our old logic was A Receber just showing 'pending' for open tables. But 'A Receber' usually means TOTAL owed.
          // Wait, 'pending' was only OPEN tables before this prompt constraint. 
          // 'A Receber Líquido' should be total accumulated.
          const unpaidCommissions = logs.filter(l => l.status === 'PENDING').reduce((acc, l) => acc + (l.amount || 0), 0);
          // Assuming 'PENDING' logs are commissions not yet paid out. Wait, when order closes, we set them to 'PAID' and pay out immediately?
          // Actually, paid out commissions are just logs. Let's keep pending strictly as OPEN tables for commissioned, plus we subtract any ADVANCES.
          const advancesAndConsumptionsTotal = logs.filter(l => l.amount < 0).reduce((acc, l) => acc + l.amount, 0); // negative number
          const paidCommissions = logs.filter(l => l.amount > 0).reduce((acc, l) => acc + l.amount, 0); // positive
          // This can get messy if we don't have a payout button. The app has "ZERAR VALORES" which wipes the logs for that waiter.
          // IF they wipe logs, everything starts at 0. So ALL logs currently exist.
          const totalAccumulated = logs.reduce((acc, l) => acc + (l.amount || 0), 0);
          pending = totalAccumulated + comissionPending;
      } else {
          if (wName.includes('igor')) {
              fixedSalary = { amount: 1400, period: 'mês' };
              pending = 1400 + monthly; // negative logs will reduce this
          } else if (wName.includes('marley')) {
              fixedSalary = { amount: 250, period: 'semana' };
              pending = 250 + weekly;
          } else if (wName.includes('alicia')) {
              fixedSalary = { amount: 150, period: 'semana' };
              pending = 150 + weekly;
          }
      }

      return { daily, weekly, monthly, pending, fixedSalary, isComissioned };
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
      const amount = parseFloat(advanceAmount.replace(',', '.'));
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
                        const totals = calculateTotals(waiterLogs, waiterOrders, waiter.name);
                        
                        return (
                            <WaiterCard 
                                key={waiter.id}
                                waiter={waiter}
                                commissionLogs={commissionLogs}
                                orders={orders}
                                totals={totals}
                                updateUser={updateUser}
                                removeUser={removeUser}
                                setAdvanceWaiterId={setAdvanceWaiterId}
                                setIsAdvanceModalOpen={setIsAdvanceModalOpen}
                                resetWaiterCommissions={resetWaiterCommissions}
                                addConsumption={addConsumption}
                                products={products}
                            />
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
                                    type="text"
                                    inputMode="decimal"
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
                            disabled={!advanceWaiterId || !advanceAmount || parseFloat(advanceAmount.replace(',', '.')) <= 0}
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