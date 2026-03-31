// Auth and Admin Login removal as requested by USER
// All requests are now treated as "Authenticated Admin"

const protect = async (req, res, next) => {
  // Always use the dummy system admin for all requests
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
