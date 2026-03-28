require('dotenv').config();
const supabase = require('./config/supabase');

async function testConnection() {
  console.log('Testing Supabase Connection...');
  try {
    const { data, error, count } = await supabase.from('users').select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Connection Failed or Table Missing:');
      console.error(error);
    } else {
      console.log('Connection Successful!');
      console.log('Total Users count:', count);
    }
  } catch (err) {
    console.error('System Error:', err.message);
  }
}

testConnection();
