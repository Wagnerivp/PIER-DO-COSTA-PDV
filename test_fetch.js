const url = 'https://zpozzczxckdwpmuscjpi.supabase.co/rest/v1/app_state?select=*&limit=1';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwb3p6Y3p4Y2tkd3BtdXNjanBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzMzQ0NjMsImV4cCI6MjA5NTkxMDQ2M30.vjkoHfptxNajT5_wr6XCrVkkkkRj9Wjf_PrZQSKyI2I';
fetch(url, { headers: { 'apikey': key, 'Authorization': `Bearer ${key}` } })
  .then(r => r.text())
  .then(console.log)
  .catch(console.error);
