const supabase = require('../config/supabase');

const logActivity = async (req, action, targetType, targetId, details) => {
  try {
    // Safety check - prevent crashing if middleware didn't handle auth yet
    if (!req || !req.user || !supabase) return;
    
    const { error: logError } = await supabase.from('admin_activity_logs').insert([{
      admin_id: req.user.id,
      action,
      target_type: targetType,
      target_id: targetId,
      details: details || {},
      ip_address: req.ip || req.headers?.['x-forwarded-for'] || req.connection?.remoteAddress || '0.0.0.0'
    }]);

    if (logError) console.error('Audit Log Error (Table missing?):', logError.message);
  } catch (error) {
    // We never want logging to crash a main request
    console.error('Audit Log Critical Error:', error.message);
  }
};

module.exports = { logActivity };
