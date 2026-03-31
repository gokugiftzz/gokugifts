const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Use Service Key for diagnostic
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function checkVariants() {
  try {
    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('*')
      .limit(5);
      
    if (error) {
      console.error('Error fetching variants:', error);
    } else {
      console.log('Sample Variants from DB:', JSON.stringify(variants, null, 2));
    }
    
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id, name')
      .limit(1);
      
    if (products && products.length > 0) {
      const pId = products[0].id;
      console.log(`\nChecking variants for product: ${products[0].name} (${pId})`);
      const { data: pVariants, error: pvErr } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', pId);
      console.log('Variants found for this product:', JSON.stringify(pVariants, null, 2));
    } else {
      console.log('\nNo products found in DB.');
    }
  } catch (e) {
    console.error('FATAL:', e.message);
  }
}

checkVariants();
