import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('app_state').select('data').eq('id', 1).maybeSingle();
  if (error) {
    console.error(error);
    return;
  }
  
  if (data && data.data) {
    const newState = data.data;
    
    // reset orders, commissionLogs, expenses, purchases
    newState.orders = [];
    newState.commissionLogs = [];
    newState.expenses = [];
    newState.purchases = [];
    
    // reset tables
    newState.tables = newState.tables.map(table => ({
        ...table,
        status: 'AVAILABLE',
        currentOrderId: undefined,
        waiterId: undefined,
        customName: undefined
    }));
    
    // close register
    newState.isRegisterOpen = false;
    newState.registerBalance = 0;
    
    newState.lastSavedAt = new Date().toISOString();

    const { error: upsertError } = await supabase.from('app_state').upsert({ id: 1, data: newState, updated_at: new Date().toISOString() });
    if (upsertError) {
      console.error(upsertError);
    } else {
      console.log('App state reset successfully!');
    }
  } else {
    console.log('No data found');
  }
}

run();
