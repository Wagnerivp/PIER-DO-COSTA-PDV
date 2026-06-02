import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Table, User } from '../types';
import { Users, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { OrderView } from './OrderView';

export const Tables = () => {
  const { tables, users, openTable, updateTableName, cancelOrder, isRegisterOpen, currentUser } = useApp();
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableToReset, setTableToReset] = useState<string | null>(null);
  
  // Form States for Opening Table
  const [selectedWaiter, setSelectedWaiter] = useState<string>('');
  const [clientName, setClientName] = useState('');

  const waiters = users.filter(u => u.role === 'WAITER');

  const handleTableClick = (table: Table) => {
    if (table.status === 'AVAILABLE') {
      setSelectedTableId(table.id);
      setClientName('');
      if (currentUser?.role === 'WAITER') {
          setSelectedWaiter(currentUser.id);
      } else if (waiters.length > 0) {
          setSelectedWaiter(waiters[0].id);
      }
      setIsModalOpen(true);
    } else {
      setSelectedTableId(table.id);
    }
  };

  const handleOpenTable = () => {
    if (selectedTableId && selectedWaiter) {
      openTable(selectedTableId, selectedWaiter, clientName);
      setIsModalOpen(false);
    }
  };

  const handleResetTable = (e: React.MouseEvent, tableId: string) => {
      e.stopPropagation();
      e.preventDefault();
      setTableToReset(tableId);
  };

  const confirmResetTable = () => {
      if (tableToReset) {
          cancelOrder(tableToReset);
          setTableToReset(null);
      }
  };

  // If a table is selected and occupied, show the OrderView
  const activeTable = tables.find(t => t.id === selectedTableId);
  if (activeTable && activeTable.status !== 'AVAILABLE') {
      return <OrderView tableId={activeTable.id} onBack={() => setSelectedTableId(null)} />;
  }

  return (
    <div className="flex flex-col h-full animate-fade-in relative space-y-6 pb-2">

      {/* Reset Table Modal */}
      {tableToReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Excluir/Reiniciar Mesa?</h3>
                <p className="text-slate-400 mb-8">Isso limpará todos os pedidos em aberto e liberará a mesa. Os itens não faturados voltarão ao estoque.</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setTableToReset(null)}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 font-bold rounded-xl transition-all"
                    >
                        CANCELAR
                    </button>
                    <button 
                        onClick={confirmResetTable}
                        className="flex-1 px-4 py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 font-bold rounded-xl transition-all"
                    >
                        REINICIAR
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-3xl font-bold text-white">Salão</h2>
            <p className="text-slate-400">Mapa de mesas em tempo real</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-3 h-3 rounded-full bg-slate-600"></span> Livre
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> Ocupada
            </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-xl font-bold text-white mb-4 shrink-0">Salão Principal</h3>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 pr-2 pb-4">
            {tables.filter(t => t.id.startsWith('t')).map(table => {
                const isOccupied = table.status === 'OCCUPIED' || table.status === 'PAYMENT_PENDING';
                const waiter = users.find(u => u.id === table.waiterId);

                return (
                    <div 
                        key={table.id}
                        onClick={() => handleTableClick(table)}
                        className={`relative aspect-square rounded-2xl p-4 flex flex-col items-center justify-between border transition-all duration-300 group cursor-pointer select-none
                            ${isOccupied 
                                ? 'bg-red-500/10 border-red-500/50 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                                : 'bg-slate-800/50 border-white/10 hover:bg-slate-700/50 hover:border-pier-neon/50'
                            }
                        `}
                    >
                        {/* Delete Button for Occupied Tables */}
                        {isOccupied && currentUser?.role !== 'WAITER' && (
                            <button
                                type="button"
                                onClick={(e) => handleResetTable(e, table.id)}
                                className="absolute top-3 right-3 p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition-all z-20 hover:scale-110 shadow-lg border border-red-500/20"
                                title="Excluir Mesa / Reiniciar"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}

                        <div className="w-full flex justify-between items-start pointer-events-none">
                            <span className={`text-lg font-bold ${isOccupied ? 'text-red-400' : 'text-slate-400'}`}>
                                {table.number}
                            </span>
                            {/* Only show alert circle if we aren't hovering over the trash can area generally, but z-index handles clicks */}
                            {isOccupied ? (
                                <AlertCircle size={16} className="text-red-400 opacity-50" />
                            ) : null}
                        </div>
                        
                        <div className={`p-4 rounded-full pointer-events-none ${isOccupied ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-500 group-hover:text-pier-neon transition-colors'}`}>
                            {table.customName ? (
                                <span className="font-bold text-lg px-2 break-all line-clamp-2">{table.customName}</span>
                            ) : (
                                <Users size={32} />
                            )}
                        </div>

                        <div className="w-full text-center pointer-events-none">
                            {isOccupied ? (
                                <p className={`text-xs font-medium truncate text-red-300`}>{waiter?.name.split(' ')[0]}</p>
                            ) : (
                                <p className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">Abrir</p>
                            )}
                        </div>
                    </div>
                );
            })}
          </div>
      </div>

      {/* Modal to Open Table */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-pier-neon/20 animate-scale-in">
                <h3 className="text-2xl font-bold text-white mb-6">Abrir Mesa</h3>
                
                {waiters.length === 0 ? (
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center mb-6">
                        <AlertCircle className="mx-auto text-red-400 mb-2" />
                        <p className="text-red-300 text-sm">Não há garçons cadastrados no sistema.</p>
                        <p className="text-slate-500 text-xs mt-1">Cadastre um usuário com perfil 'Garçom' para continuar.</p>
                    </div>
                ) : (
                    <div className="mb-6 space-y-4">
                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Nome do Cliente / Mesa (Opcional)</label>
                            <input 
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-pier-neon focus:outline-none"
                                placeholder="Ex: Mesa João ou Aniversário"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-slate-400 mb-2">Selecionar Garçom <span className="text-red-400">*</span></label>
                            <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                                {waiters.map(w => (
                                    <button
                                        key={w.id}
                                        onClick={() => setSelectedWaiter(w.id)}
                                        className={`p-3 rounded-xl border text-left transition-all ${selectedWaiter === w.id ? 'bg-pier-neon/20 border-pier-neon text-white shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-slate-800 border-white/10 text-slate-400 hover:bg-slate-700'}`}
                                    >
                                        <span className="block font-bold">{w.name}</span>
                                        <span className="text-xs opacity-70">Garçom</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-3 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={handleOpenTable}
                        disabled={!selectedWaiter || waiters.length === 0 || (!isRegisterOpen && currentUser?.role !== 'ADMIN')}
                        className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all relative group"
                    >
                        Abrir Mesa
                        {(!isRegisterOpen && currentUser?.role !== 'ADMIN') && (
                             <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Caixa Fechado</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};