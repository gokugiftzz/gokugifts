const { createClient } = require('@supabase/supabase-js');

// Prevent global runtime crashes (`FUNCTION_INVOCATION_FAILED`) 
// if Vercel is missing environment variables during boot.
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder_key';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
