require('dotenv').config();
const supabase = require('./config/supabase');

async function testConnection() {
  console.log('Testing Supabase Connection...');
  console.log('URL:', process.env.SUPABASE_URL);
  
  try {
    // 1. Try to list bucket or do simple select from metadata
    const { data: tables, error: tableError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });

    if (tableError) {
      console.error('Error selecting from users table:');
      console.error('Code:', tableError.code);
      console.error('Message:', tableError.message);
      console.error('Hint:', tableError.hint);
      
      if (tableError.code === 'PGRST116' || tableError.message.includes('not found')) {
        console.log('\nSUGGESTION: The "users" table was not found. Please run your schema.sql script in the Supabase SQL Editor.');
      }
    } else {
      console.log('Connection Successful!');
      console.log('The "users" table is present.');
    }
  } catch (err) {
    console.error('System Error (Network or Config):', err);
  }
}

testConnection();
