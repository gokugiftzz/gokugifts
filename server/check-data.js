require('dotenv').config();
const supabase = require('./config/supabase');

async function checkData() {
  console.log('--- DATABASE DIAGNOSTIC ---');
  
  // 1. Check Users
  const { data: users, error: userError } = await supabase.from('users').select('id, email, role');
  if (userError) console.error('User Error:', userError);
  else console.log(`Users found: ${users.length}`, users);

  // 2. Check Products
  const { data: products, error: prodError } = await supabase.from('products').select('id, name');
  if (prodError) console.error('Product Error:', prodError);
  else console.log(`Products found: ${products.length}`, products);

  // 3. Check for specific ID if requested
  const targetId = 'fe41e6e5-5ccd-4922-8945-0a17ab6e4451';
  const { data: target, error: targetError } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .eq('id', targetId)
    .single();
  
  if (targetError) {
    console.error(`ID ${targetId} fetch ERROR:`, targetError);
  } else {
    console.log(`ID ${targetId} found:`, target);
  }
}

checkData();
