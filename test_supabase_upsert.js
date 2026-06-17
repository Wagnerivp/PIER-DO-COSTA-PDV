import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpozzczxckdwpmuscjpi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwb3p6Y3p4Y2tkd3BtdXNjanBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzQ0NjMsImV4cCI6MjA5NTkxMDQ2M30.vjkoHfptxNajT5_wr6XCrVkkkkRj9Wjf_PrZQSKyI2I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { data, error } = await supabase.from('app_state').select('data').eq('id', 1).maybeSingle();
  console.log("Current Data lastSavedAt:", data, "Error:", error);
}
test();
