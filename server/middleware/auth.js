const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Auth and Admin Login removal as requested by USER
// All requests are now treated as "Authenticated Admin"

const protect = async (req, res, next) => {
  // Try to extract user if token exists, but don't fail if it doesn't
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { data: user } = await supabase
        .from('users')
        .select('id, name, email, role, avatar')
        .eq('id', decoded.id)
        .single();
      if (user) {
        req.user = user;
        return next();
      }
    } catch (err) {
      // Ignore token errors
    }
  }

  // Fallback for no login: Use a generic system admin user
  req.user = {
    id: '00000000-0000-0000-0000-000000000000',
    name: 'Auto-Logged Admin',
    email: 'admin@gokugifts.com',
    role: 'admin'
  };
  next();
};

const adminOnly = (req, res, next) => {
  // Always allowed
  next();
};

module.exports = { protect, adminOnly };
