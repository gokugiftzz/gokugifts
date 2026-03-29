require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

async function testLogin() {
  const email = 'admin@gokugifts.com';
  const password = 'AdminPassword123';

  console.log('--- LOGIN TEST ---');

  // Step 1: Find user
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) {
    console.error('❌ User NOT FOUND in DB:', error?.message);
    return;
  }

  console.log('✅ User found:', { id: user.id, email: user.email, role: user.role });
  console.log('   Password hash stored:', user.password?.substring(0, 30) + '...');

  // Step 2: Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    console.log('✅ PASSWORD MATCHES - login should work!');
  } else {
    console.log('❌ PASSWORD DOES NOT MATCH');
    
    // Rehash and update
    console.log('   Forcing password rehash...');
    const newHash = await bcrypt.hash(password, 12);
    const { error: updateErr } = await supabase
      .from('users')
      .update({ password: newHash })
      .eq('id', user.id);
    
    if (updateErr) {
      console.error('   ❌ Update failed:', updateErr.message);
    } else {
      console.log('   ✅ Password forcefully updated. Try logging in now.');
    }
  }
}

testLogin();
