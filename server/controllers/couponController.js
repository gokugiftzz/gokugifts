const supabase = require('../config/supabase');

// @desc    Validate coupon
// @route   POST /api/coupons/validate
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();
    if (error || !coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    if (new Date(coupon.expires_at) < new Date()) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.min_order_value && cartTotal < coupon.min_order_value) {
      return res.status(400).json({ success: false, message: `Minimum order value is ₹${coupon.min_order_value}` });
    }
    const discount = coupon.type === 'percentage'
      ? Math.min((cartTotal * coupon.value) / 100, coupon.max_discount || Infinity)
      : coupon.value;
    res.json({ success: true, coupon, discount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create coupon (admin)
// @route   POST /api/coupons
exports.createCoupon = async (req, res) => {
  try {
    const { data, error } = await supabase.from('coupons').insert([req.body]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, coupon: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all coupons (admin)
// @route   GET /api/coupons
exports.getAllCoupons = async (req, res) => {
  try {
    const { data: coupons, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
