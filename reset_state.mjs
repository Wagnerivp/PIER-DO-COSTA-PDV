import { createClient } from '@supabase/supabase-js';

const VITE_SUPABASE_URL = "https://zpozzczxckdwpmuscjpi.supabase.co";
const VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwb3p6Y3p4Y2tkd3BtdXNjanBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzQ0NjMsImV4cCI6MjA5NTkxMDQ2M30.vjkoHfptxNajT5_wr6XCrVkkkkRj9Wjf_PrZQSKyI2I";

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
