require('dotenv').config();
const supabase = require('./config/supabase');

async function clear() {
  const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('All sample products have been successfully deleted from the database!');
  }
}

clear();
