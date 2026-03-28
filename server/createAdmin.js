require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

async function createAdmin() {
  try {
    const email = 'admin@gokugifts.com';
    const password = 'AdminPassword123';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Check if user exists
    const { data: existing } = await supabase.from('users').select('id').eq('email', email).maybeSingle();
    
    if (existing) {
       console.log('Admin already exists! Updating role to admin...');
       await supabase.from('users').update({ role: 'admin', password: hashedPassword }).eq('id', existing.id);
       console.log('Password reset to: ' + password);
    } else {
       console.log('Creating new admin user...');
       const { data, error } = await supabase
         .from('users')
         .insert([{ 
           name: 'System Admin', 
           email: email, 
           password: hashedPassword, 
           phone: '0000000000', 
           role: 'admin' 
         }]);
         
       if (error) throw error;
       console.log('Admin user created successfully!');
    }
    
    console.log('\\n--- ADMIN CREDENTIALS ---');
    console.log('Email: ' + email);
    console.log('Password: ' + password);
    console.log('-------------------------\\n');
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

createAdmin();
