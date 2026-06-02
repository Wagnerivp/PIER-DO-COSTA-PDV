import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { Plus, Search, Edit2, Trash2, Phone, User, X } from 'lucide-react';
import { Customer } from '../types';

export const Customers = () => {
    const { customers, addCustomer, updateCustomer, removeCustomer } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const openModal = (customer?: Customer) => {
        if (customer) {
            setEditingCustomer(customer);
            setName(customer.name);
            setPhone(customer.phone);
        } else {
            setEditingCustomer(null);
            setName('');
            setPhone('');
        }
        setIsModalOpen(true);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        setPhone(val);
    };

    const handleSave = () => {
        if (!name.trim() || !phone.trim()) return;

        if (editingCustomer) {
            updateCustomer({
                ...editingCustomer,
                name: name.trim(),
                phone: phone.trim()
            });
        } else {
            addCustomer({
                id: Date.now().toString(),
                name: name.trim(),
                phone: phone.trim()
            });
        }
        setIsModalOpen(false);
    };

    const normalizeString = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const filteredCustomers = customers.filter(c => 
        normalizeString(c.name).includes(normalizeString(searchTerm)) || c.phone.includes(searchTerm)
    );

    return (
        <div className="flex-1 flex flex-col h-full animate-fade-in p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Clientes</h1>
                    <p className="text-slate-400 mt-1">Gerencie os clientes cadastrados.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center gap-2 bg-pier-neon text-pier-900 px-6 py-3 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                >
                    <Plus size={20} />
                    Novo Cliente
                </button>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nome ou telefone..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white focus:outline-none focus:border-pier-neon"
                    />
                </div>
            </div>

            <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden flex-1">
                <div className="overflow-x-auto min-h-[300px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/10">
                                <th className="p-4 font-semibold text-slate-300">NOME</th>
                                <th className="p-4 font-semibold text-slate-300">TELEFONE</th>
                                <th className="p-4 font-semibold text-slate-300 text-right">AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-8 text-slate-500">
                                        Nenhum cliente encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white">{customer.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-slate-300">
                                            {customer.phone || '-'}
                                        </td>
                                        <td className="p-4 flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openModal(customer)}
                                                className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if(window.confirm('Excluir cliente?')) {
                                                        removeCustomer(customer.id);
                                                    }
                                                }}
                                                className="p-2 text-red-500/70 hover:text-white bg-red-500/10 hover:bg-red-500 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-pier-neon/20 animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">
                                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-pier-neon focus:bg-slate-800 transition-all"
                                        placeholder="Nome do cliente"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Telefone (Somente números)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input 
                                        type="tel" 
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-pier-neon focus:bg-slate-800 transition-all font-mono"
                                        placeholder="Ex: 11999998888"
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={!name.trim() || !phone.trim()}
                                className="w-full py-3 mt-4 rounded-xl bg-pier-neon text-pier-900 font-bold hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Salvar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
