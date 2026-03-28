const supabase = require('../config/supabase');

// @desc    Add review
// @route   POST /api/reviews/:productId
exports.addReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;
    // Check if already reviewed
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('product_id', req.params.productId)
      .single();
    if (existing) return res.status(400).json({ success: false, message: 'You have already reviewed this product' });

    const { data: review, error } = await supabase
      .from('reviews')
      .insert([{
        user_id: req.user.id,
        product_id: req.params.productId,
        rating: parseInt(rating),
        comment,
        images: images || []
      }])
      .select('*, user:users(name, avatar)')
      .single();
    if (error) throw error;

    // Update product average rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', req.params.productId);
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await supabase
      .from('products')
      .update({ rating: avgRating.toFixed(1), review_count: reviews.length })
      .eq('id', req.params.productId);

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get reviews for product
// @route   GET /api/reviews/:productId
exports.getReviews = async (req, res) => {
  try {
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, user:users(name, avatar)')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
