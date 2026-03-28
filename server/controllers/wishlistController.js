const supabase = require('../config/supabase');

// @desc    Get wishlist
// @route   GET /api/wishlist
exports.getWishlist = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('wishlist')
      .select('*, product:products(*)')
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true, wishlist: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add to wishlist
// @route   POST /api/wishlist/:productId
exports.addToWishlist = async (req, res) => {
  try {
    const { data: existing } = await supabase
      .from('wishlist')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', req.params.productId)
      .single();
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already in wishlist' });
    }
    const { data, error } = await supabase
      .from('wishlist')
      .insert([{ user_id: req.user.id, product_id: req.params.productId }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ success: true, item: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
exports.removeFromWishlist = async (req, res) => {
  try {
    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('user_id', req.user.id)
      .eq('product_id', req.params.productId);
    if (error) throw error;
    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
