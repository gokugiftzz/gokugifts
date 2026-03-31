const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function findProductWithVariants() {
  const { data: variants } = await supabase.from('product_variants').select('product_id').limit(1);
  if (variants && variants.length > 0) {
    const { data: product } = await supabase.from('products').select('name, id').eq('id', variants[0].product_id).single();
    console.log(`Product found WITH variants: ${product.name} (ID: ${product.id})`);
  } else {
    console.log('No variants exist in the entire database.');
  }
}
findProductWithVariants();
