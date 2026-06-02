import React, { useState, useEffect } from 'react';
import { useApp } from '../services/AppContext';
import { ShieldCheck, User, Coffee, ChevronLeft, X } from 'lucide-react';
import { supabase } from '../services/supabase';

export const Login = () => {
  const { login, directLogin, users } = useApp();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [perfis, setPerfis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerfis();

    // Subscribe to realtime changes on 'perfis'
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'perfis',
        },
        (payload) => {
          fetchPerfis();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPerfis = async () => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (data && data.length > 0) {
        setPerfis(data);
      } else {
        // Fallback para usuários locais do constants se a tabela não existir
        setPerfis(users.map(u => ({
          id: u.id,
          nome: u.name,
          cargo: u.role,
          ativo: true,
          pin: u.pin
        })));
      }
    } catch (e) {
       // Fallback
       setPerfis(users.map(u => ({
          id: u.id,
          nome: u.name,
          cargo: u.role,
          ativo: true,
          pin: u.pin
        })));
    }
    setLoading(false);
  };

  const handleNumClick = (num: string) => {
      if (pin.length < 4) {
          const newPin = pin + num;
          setPin(newPin);
          setError('');
          
          if (newPin.length === 4) {
              if (selectedUser?.pin === newPin) {
                  // Mapeia para o objeto User aceito pelo Context
                  directLogin({
                      id: selectedUser.id,
                      name: selectedUser.nome,
                      role: selectedUser.cargo,
                      pin: selectedUser.pin,
                      commissionBalance: 0
                  });
              } else {
                  setError('PIN incorreto');
                  setPin('');
              }
          }
      }
  };

  const handleDelete = () => {
      setPin(prev => prev.slice(0, -1));
      setError('');
  };

  const clearSelection = () => {
      setSelectedUser(null);
      setPin('');
      setError('');
  };

  const handleUserClick = (perfil: any) => {
      setSelectedUser(perfil);
  };

  const getRoleIcon = (role: string) => {
      switch(role) {
          case 'ADMIN': return <ShieldCheck size={32} className="text-pier-neon" />;
          case 'GARCOM': case 'WAITER': return <Coffee size={32} className="text-amber-500" />;
          case 'CAIXA': case 'CASHIER': default: return <User size={32} className="text-pier-green" />;
      }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-pier-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        
        <div className="glass-panel p-6 sm:p-8 rounded-3xl w-full max-w-md relative z-10 border border-white/10 shadow-2xl flex flex-col items-center">
            
            {!selectedUser ? (
                // --- USER SELECTION ---
                <div className="w-full animate-fade-in flex flex-col items-center">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pier-neon to-pier-green mb-2">PIER DO COSTA</h1>
                        <p className="text-slate-400">Selecione seu perfil</p>
                    </div>

                    <div className="w-full flex flex-col gap-4">
                        {loading ? (
                            <p className="text-slate-400 text-center py-8 animate-pulse">Carregando perfis...</p>
                        ) : perfis.length > 0 ? (
                             perfis.map(perfil => (
                                <button 
                                    key={perfil.id}
                                    onClick={() => handleUserClick(perfil)}
                                    // Min. 48px hit area via p-4 and items-center
                                    className="w-full min-h-[64px] bg-slate-900/50 hover:bg-slate-800 border border-white/10 hover:border-pier-neon/50 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] group"
                                >
                                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {getRoleIcon(perfil.cargo)}
                                    </div>
                                    <div className="text-left flex-1">
                                        <h3 className="text-lg font-bold text-white">{perfil.nome}</h3>
                                        <p className="text-sm text-slate-400 capitalize">{perfil.cargo.toLowerCase()}</p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-8">Nenhum perfil ativo encontrado.</p>
                        )}
                    </div>
                </div>
            ) : (
                // --- PIN PAD ---
                <div className="w-full animate-fade-in flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-6">
                        <button onClick={clearSelection} className="p-4 -ml-4 text-slate-400 hover:text-white transition-colors bg-transparent border-none">
                            <ChevronLeft size={28} />
                        </button>
                        <div className="text-center">
                            <p className="text-sm text-slate-400">Entrando como</p>
                            <p className="font-bold text-white text-lg">{selectedUser.nome}</p>
                        </div>
                        <div className="w-12"></div> {/* Spacer for centering */}
                    </div>

                    {/* PIN Display */}
                    <div className="flex gap-4 mb-8 justify-center">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${pin.length > i ? 'bg-pier-neon shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-110' : 'bg-slate-700'}`}></div>
                        ))}
                    </div>

                    {error && <p className="text-red-400 text-sm mb-4 animate-[shake_0.5s_ease-in-out]">{error}</p>}

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <button
                                key={num}
                                onClick={() => handleNumClick(num.toString())}
                                className="h-16 aspect-auto bg-white/5 hover:bg-white/10 active:bg-pier-neon/20 border border-white/5 rounded-2xl text-2xl text-white font-medium transition-all active:scale-[0.95] flex items-center justify-center min-w-[48px] min-h-[48px]"
                            >
                                {num}
                            </button>
                        ))}
                        <div className="h-16 aspect-auto"></div>
                        <button
                            onClick={() => handleNumClick('0')}
                            className="h-16 aspect-auto bg-white/5 hover:bg-white/10 active:bg-pier-neon/20 border border-white/5 rounded-2xl text-2xl text-white font-medium transition-all active:scale-[0.95] flex items-center justify-center min-w-[48px] min-h-[48px]"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            className="h-16 aspect-auto bg-white/5 hover:bg-red-500/20 active:bg-red-500/40 border border-white/5 rounded-2xl text-red-400 flex items-center justify-center transition-all active:scale-[0.95] min-w-[48px] min-h-[48px]"
                        >
                            <X size={28} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};