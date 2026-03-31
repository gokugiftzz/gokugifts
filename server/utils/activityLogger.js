const supabase = require('../config/supabase');

const logActivity = async (req, action, targetType, targetId, details) => {
  try {
    await supabase.from('admin_activity_logs').insert([{
      admin_id: req.user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    }]);
  } catch (error) {
    console.error('Failed to log admin activity:', error);
  }
};

module.exports = { logActivity };
