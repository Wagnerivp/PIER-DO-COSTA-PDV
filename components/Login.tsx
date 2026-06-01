import React, { useState } from 'react';
import { useApp } from '../services/AppContext';
import { ShieldCheck, User, Coffee, ChevronLeft, Delete } from 'lucide-react';

export const Login = () => {
  const { users, login } = useApp();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumClick = (num: string) => {
      if (pin.length < 4) {
          const newPin = pin + num;
          setPin(newPin);
          setError('');
          
          if (newPin.length === 4) {
              if (!login(newPin)) {
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

  const getRoleIcon = (role: string) => {
      switch(role) {
          case 'ADMIN': case 'MANAGER': return <ShieldCheck size={32} className="text-pier-neon" />;
          case 'WAITER': return <Coffee size={32} className="text-amber-500" />;
          case 'CASHIER': default: return <User size={32} className="text-pier-green" />;
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

                    <div className="w-full grid grid-cols-1 gap-4">
                        {users.map(user => (
                            <button 
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="w-full bg-slate-900/50 hover:bg-slate-800 border border-white/10 hover:border-pier-neon/50 p-4 rounded-2xl flex items-center gap-4 transition-all active:scale-[0.98] group"
                            >
                                <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {getRoleIcon(user.role)}
                                </div>
                                <div className="text-left flex-1">
                                    <h3 className="text-lg font-bold text-white">{user.name}</h3>
                                    <p className="text-sm text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                // --- PIN PAD ---
                <div className="w-full animate-fade-in flex flex-col items-center">
                    <div className="w-full flex items-center justify-between mb-6">
                        <button onClick={clearSelection} className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="text-center">
                            <p className="text-sm text-slate-400">Entrando como</p>
                            <p className="font-bold text-white text-lg">{selectedUser.name}</p>
                        </div>
                        <div className="w-10"></div> {/* Spacer for centering */}
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
                                className="aspect-square bg-white/5 hover:bg-white/10 active:bg-pier-neon/20 border border-white/5 rounded-2xl text-2xl text-white font-medium transition-all active:scale-[0.95]"
                            >
                                {num}
                            </button>
                        ))}
                        <div className="aspect-square"></div>
                        <button
                            onClick={() => handleNumClick('0')}
                            className="aspect-square bg-white/5 hover:bg-white/10 active:bg-pier-neon/20 border border-white/5 rounded-2xl text-2xl text-white font-medium transition-all active:scale-[0.95]"
                        >
                            0
                        </button>
                        <button
                            onClick={handleDelete}
                            className="aspect-square bg-white/5 hover:bg-red-500/20 active:bg-red-500/40 border border-white/5 rounded-2xl text-red-400 flex items-center justify-center transition-all active:scale-[0.95]"
                        >
                            <Delete size={28} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};