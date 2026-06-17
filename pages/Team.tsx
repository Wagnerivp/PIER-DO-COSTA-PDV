import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { User, Shield, Briefcase, DollarSign, Trash2, Edit2, Key, Users } from 'lucide-react';
import { User as UserType } from '../types';

export const Team = () => {
  const { users, addUser, updateUser, removeUser, currentUser } = useApp();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'MANAGER' | 'WAITRESS' | 'WAITER' | 'CASHIER'>('WAITER');
  
  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Confirm Delete
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const showToast = (msg: string) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 3000);
  };

  const resetForm = () => {
      setName('');
      setPin('');
      setRole('WAITER');
      setEditingId(null);
      setIsModalOpen(false);
  };

  const handleEdit = (user: UserType) => {
      setName(user.name);
      setPin(user.pin);
      setRole(user.role);
      setEditingId(user.id);
      setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!name || !pin || !role) return;
      
      // Check for PIN conflicts if adding new, or changing pin
      const conflict = users.find(u => u.pin === pin && u.id !== editingId);
      if (conflict) {
          showToast('Este PIN já está em uso por outro funcionário.');
          return;
      }

      if (editingId) {
          const userToUpdate = users.find(u => u.id === editingId);
          if (userToUpdate) {
              updateUser({
                  ...userToUpdate,
                  name,
                  pin,
                  role
              });
              showToast('Funcionário atualizado!');
          }
      } else {
          addUser({
              id: `u-${Date.now()}`,
              name,
              pin,
              role,
              commissionBalance: 0
          });
          showToast('Funcionário adicionado com sucesso!');
      }
      
      resetForm();
  };
  
  const confirmDelete = () => {
      if (userToDelete) {
          removeUser(userToDelete);
          setUserToDelete(null);
          showToast('Funcionário removido!');
      }
  };

  const roleLabels = {
      'ADMIN': 'Administrador',
      'MANAGER': 'Gerente',
      'CASHIER': 'Caixa',
      'WAITER': 'Garçom',
      'WAITRESS': 'Garçonete' // Just in case, though standard uses WAITER for both conceptually, maybe we keep WAITER
  };

  return (
    <div className="space-y-6 animate-fade-in relative pb-10">
      {/* Toast */}
      {toastMessage && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-pier-green text-pier-900 px-6 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
              <span>{toastMessage}</span>
          </div>
      )}

      {/* Delete Modal */}
      {userToDelete && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Excluir Funcionário?</h3>
                  <p className="text-slate-400 mb-8">Esta ação removerá o acesso do funcionário ao sistema. Tem certeza?</p>
                  <div className="flex gap-4">
                      <button 
                          onClick={() => setUserToDelete(null)}
                          className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 font-bold text-white rounded-xl transition-all"
                      >
                          CANCELAR
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="flex-1 px-4 py-3 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/50 font-bold rounded-xl transition-all"
                      >
                          EXCLUIR
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl relative">
                  <h2 className="text-2xl font-bold text-white mb-6">
                      {editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Nome</label>
                          <input 
                              required
                              type="text" 
                              value={name} 
                              onChange={(e) => setName(e.target.value)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pier-neon"
                              placeholder="Nome do funcionário"
                          />
                      </div>
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">PIN (Senha)</label>
                          <input 
                              required
                              type="password"
                              maxLength={4} 
                              value={pin} 
                              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} // Numeric only
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pier-neon tracking-[0.5em]"
                              placeholder="****"
                          />
                      </div>
                      <div>
                          <label className="block text-sm text-slate-400 mb-1">Cargo</label>
                          <select 
                              value={role} 
                              onChange={(e) => setRole(e.target.value as any)}
                              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pier-neon"
                          >
                              <option value="ADMIN">Administrador (Acesso Total)</option>
                              <option value="MANAGER">Gerente</option>
                              <option value="CASHIER">Caixa</option>
                              <option value="WAITER">Garçom</option>
                          </select>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                              type="button" 
                              onClick={resetForm}
                              className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all"
                          >
                              Cancelar
                          </button>
                          <button 
                              type="submit" 
                              className="flex-1 py-3 bg-pier-green text-black font-bold rounded-xl hover:shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
                          >
                              Salvar
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      <div className="flex justify-between items-center shrink-0">
          <div>
              <h2 className="text-3xl font-bold text-white">Gestão da Equipe</h2>
              <p className="text-sm text-slate-400">Usuários e Acessos</p>
          </div>
          <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-pier-neon/10 hover:bg-pier-neon/20 text-pier-neon border border-pier-neon/30 px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
          >
              <Users size={18} /> Novo Usuário
          </button>
      </div>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider backdrop-blur-md">
                    <tr>
                        <th className="p-4 font-medium">Nome</th>
                        <th className="p-4 font-medium">Cargo</th>
                        <th className="p-4 font-medium">PIN</th>
                        <th className="p-4 font-medium text-center">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                    {users.map(user => (
                         <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                             <td className="p-4 text-white font-medium flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs">
                                     {user.name.charAt(0)}
                                </div>
                                {user.name} 
                                {user.id === currentUser?.id && <span className="text-[10px] bg-pier-neon/20 text-pier-neon px-2 py-0.5 rounded ml-2">VOCÊ</span>}
                             </td>
                             <td className="p-4">
                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded border ${
                                    user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                    user.role === 'MANAGER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                    user.role === 'CASHIER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                    'bg-pier-green/10 text-pier-green border-pier-green/20'
                                }`}>
                                   {user.role === 'ADMIN' ? <Shield size={12} /> : 
                                    user.role === 'MANAGER' ? <Briefcase size={12} /> : 
                                    user.role === 'CASHIER' ? <DollarSign size={12} /> : 
                                    <User size={12} />}
                                   {roleLabels[user.role as keyof typeof roleLabels]}
                                </span>
                             </td>
                             <td className="p-4 font-mono text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                     <Key size={12} /> ****
                                </div>
                             </td>
                             <td className="p-4 text-center">
                                 <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleEdit(user)}
                                        className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setUserToDelete(user.id)}
                                        disabled={user.id === currentUser?.id}
                                        className="p-2 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                        title={user.id === currentUser?.id ? "Não pode excluir a si mesmo" : "Excluir"}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                 </div>
                             </td>
                         </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};
