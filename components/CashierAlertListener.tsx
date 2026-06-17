import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useApp } from '../services/AppContext';
import { Printer, BellOff, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CashierAlertListener = () => {
    const { currentUser, tables, requestCheckout } = useApp();
    const [alert, setAlert] = useState<{id: string, table_id: string, table_number: number, waiter_name: string} | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'CASHIER' && currentUser.role !== 'MANAGER')) return;

        const channel = supabase.channel('custom-all-channel')
            .on(
                'postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'cashier_notifications', filter: "status=eq.PENDING" }, 
                (payload) => {
                    const newAlert = payload.new as any;
                    setAlert(newAlert);
                    
                    // Audio alert if possible
                    try {
                        const audio = new Audio('/alert.mp3'); // Fallback if exists
                        audio.play().catch(e => console.log('Audio play ignored without interaction'));
                    } catch(e) {}
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]);

    const handleAcknowledge = async () => {
        if (!alert) return;
        const currentAlert = alert;
        setAlert(null);
        await supabase.from('cashier_notifications').update({ status: 'RESOLVED' }).eq('id', currentAlert.id);
    };

    const handlePrintAndAcknowledge = async () => {
        if (!alert) return;
        const currentAlert = alert;
        setAlert(null);
        await supabase.from('cashier_notifications').update({ status: 'RESOLVED' }).eq('id', currentAlert.id);
        
        // Ensure table state is updated to PAYMENT_PENDING visually if needed
        requestCheckout(currentAlert.table_id);
        
        // Navigate to the tables screen so cashier can click the table and print
        navigate('/tables');
    };

    if (!alert) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-red-600 p-4 animate-in fade-in duration-300">
             <div className="bg-red-800 border-4 border-white/20 p-8 rounded-3xl w-full max-w-2xl shadow-2xl text-center shadow-[0_0_100px_rgba(220,38,38,0.8)] relative overflow-hidden">
                  
                  {/* Pulsing background effect */}
                  <div className="absolute inset-0 bg-red-500 opacity-20 animate-pulse"></div>

                  <div className="relative z-10 space-y-6">
                      <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                         <AlertTriangle size={48} className="text-white" />
                      </div>
                      
                      <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-wider drop-shadow-lg">
                          Alerta de Fechamento
                      </h2>
                      
                      <div className="bg-red-900/50 p-6 rounded-2xl border border-red-500/30 backdrop-blur-sm shadow-inner">
                          <p className="text-2xl text-red-100 font-medium mb-2">
                              A Mesa <span className="text-white font-black text-4xl">{alert.table_number}</span> solicitou o fechamento da conta!
                          </p>
                          <p className="text-lg text-red-200">
                              Garçom: <span className="font-bold text-white">{alert.waiter_name}</span>
                          </p>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 pt-4">
                          <button 
                              onClick={handlePrintAndAcknowledge}
                              className="flex-1 py-5 px-6 rounded-2xl bg-white text-red-600 font-black text-xl md:text-2xl uppercase flex items-center justify-center gap-3 shadow-[0_10px_0_rgba(220,38,38,1)] hover:translate-y-1 hover:shadow-[0_5px_0_rgba(220,38,38,1)] active:translate-y-2 active:shadow-none transition-all"
                          >
                              <Printer size={32} />
                              Imprimir Via
                          </button>
                          
                          <button 
                              onClick={handleAcknowledge}
                              className="md:w-1/3 py-5 px-6 rounded-2xl bg-red-950 text-red-200 font-bold text-lg hover:bg-black transition-colors flex items-center justify-center gap-2 border border-red-800"
                          >
                              <BellOff size={24} />
                              Silenciar Aviso
                          </button>
                      </div>
                  </div>
             </div>
        </div>
    );
};
