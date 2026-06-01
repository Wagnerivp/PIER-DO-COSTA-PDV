import React, { useState } from 'react';
import { useApp } from '../services/AppContext';

export const Login = () => {
  const { login } = useApp();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      setError('');
    } else {
      setError('PIN inválido. Tente 1111 (Gerente) ou 2222 (Garçom).');
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center relative overflow-hidden bg-pier-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
        
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md relative z-10 border border-white/10 shadow-2xl">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pier-neon to-pier-green mb-2">PIER DO COSTA</h1>
                <p className="text-slate-400">Sistema de Gestão Integrado</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">PIN de Acesso</label>
                    <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-pier-neon transition-colors"
                        placeholder="••••"
                        maxLength={4}
                    />
                </div>

                {error && <p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">{error}</p>}

                <button 
                    type="submit"
                    className="w-full bg-gradient-to-r from-pier-neon to-pier-green text-pier-900 font-bold py-3 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all transform hover:scale-[1.02]"
                >
                    ENTRAR
                </button>

                <div className="mt-6 grid grid-cols-2 gap-2 text-xs text-slate-500">
                    <div className="bg-white/5 p-2 rounded text-center">Admin: 1111</div>
                    <div className="bg-white/5 p-2 rounded text-center">Garçom: 2222</div>
                </div>
            </form>
        </div>
    </div>
  );
};