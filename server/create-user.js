require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

async function createUser() {
  const email = 'jesronstark@gmail.com';
  const password = 'Admin@123';
  const hash = await bcrypt.hash(password, 12);

  const { data: existing } = await supabase
    .from('users').select('id').eq('email', email).maybeSingle();

  if (existing) {
    await supabase.from('users').update({ password: hash, role: 'admin' }).eq('id', existing.id);
    console.log('✅ Password reset for', email);
  } else {
    const { error } = await supabase.from('users').insert([{
      name: 'Jesron Stark',
      email,
      password: hash,
      phone: '9999999999',
      role: 'admin'
    }]);
    if (error) console.error('❌ Error:', error.message);
    else console.log('✅ Admin account created for', email);
  }

  console.log('\n--- CREDENTIALS ---');
  console.log('Email:', email);
  console.log('Password:', password);
}

createUser();
