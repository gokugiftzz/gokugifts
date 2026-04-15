const supabase = require('../config/supabase');

// @desc    Get dashboard analytics
// @route   GET /api/admin/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { count: totalUsers } = await supabase.from('users').select('id', { count: 'exact', head: true });
    const { count: totalProducts } = await supabase.from('products').select('id', { count: 'exact', head: true });
    const { count: totalOrders } = await supabase.from('orders').select('id', { count: 'exact', head: true });
    const { data: revenueData } = await supabase.from('orders').select('total').eq('payment_status', 'paid');
    const totalRevenue = revenueData?.reduce((sum, o) => sum + o.total, 0) || 0;

    // Recent orders
    const { data: rawRecentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    let recentOrders = rawRecentOrders || [];
    if (recentOrders.length > 0) {
      const userIds = [...new Set(recentOrders.map(o => o.user_id))].filter(Boolean);
      const { data: users } = await supabase.from('users').select('id, name, email').in('id', userIds);
      const userMap = (users || []).reduce((acc, user) => ({ ...acc, [user.id]: user }), {});
      recentOrders = recentOrders.map(o => ({ ...o, user: userMap[o.user_id] || null }));
    }

    // Sales by category
    const { data: allOrders } = await supabase.from('orders').select('items, total');
    const salesByStatus = {};
    for (const order of (allOrders || [])) {
      // simplified
    }

    // Monthly revenue (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
      const { data: monthOrders } = await supabase
        .from('orders')
        .select('total')
        .gte('created_at', monthStart)
        .lte('created_at', monthEnd)
        .eq('payment_status', 'paid');
      const revenue = monthOrders?.reduce((sum, o) => sum + o.total, 0) || 0;
      monthlyRevenue.push({
        month: d.toLocaleString('default', { month: 'short' }),
        revenue
      });
    }

    res.json({
      success: true,
      analytics: { totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders, monthlyRevenue }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all users (admin)
// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, role, avatar, phone, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { data: user, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, name, email, role')
      .single();
    if (error) throw error;
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    // Delete related to avoid hard FK crash
    await supabase.from('wishlist').delete().eq('user_id', userId);
    await supabase.from('reviews').delete().eq('user_id', userId);
    await supabase.from('orders').delete().eq('user_id', userId);
    
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete an order
// @route   DELETE /api/admin/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const { error } = await supabase.from('orders').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete all products (admin)
// @route   DELETE /api/admin/products/all
exports.deleteAllProducts = async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
    if (error) throw error;
    res.json({ success: true, message: 'All products erased' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
