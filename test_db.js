import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://zpozzczxckdwpmuscjpi.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwb3p6Y3p4Y2tkd3BtdXNjanBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzQ0NjMsImV4cCI6MjA5NTkxMDQ2M30.vjkoHfptxNajT5_wr6XCrVkkkkRj9Wjf_PrZQSKyI2I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('users').select('id').limit(1);
  if (error) {
    console.error("Error accessing app_state:", error.message);
  } else {
    console.log("Success! Data:", data);
  }
}

test();
