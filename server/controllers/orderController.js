const supabase = require('../config/supabase');
const Razorpay = require('razorpay');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'placeholder_key_id';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// @desc    Create order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      items, shippingAddress, paymentMethod, couponCode,
      giftMessage, customizations
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('name, price, stock')
        .eq('id', item.productId)
        .single();
        
      if (error || !product) {
        throw new Error(`Product "${item.name || 'Unknown'}" is no longer available.`);
      }
      
      subtotal += product.price * item.quantity;
    }

    let discount = 0;
    if (couponCode) {
      const { data: coupon } = await supabase.from('coupons').select('*').eq('code', couponCode.toUpperCase()).single();
      if (coupon && coupon.active && new Date(coupon.expires_at) > new Date()) {
        discount = coupon.type === 'percentage' ? (subtotal * coupon.value) / 100 : coupon.value;
      }
    }

    const shipping = subtotal > 999 ? 0 : 99;
    const total = subtotal - discount + shipping;

    const orderCode = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // 3️⃣ Save Order
    const { data: order, error } = await supabase
      .from('orders')
      .insert([{
        order_code: orderCode,
        user_id: req.user.id,
        items,
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
        subtotal,
        discount,
        shipping_charge: shipping,
        total,
        gift_message: giftMessage,
        customizations,
        status: 'pending',
        coupon_code: couponCode
      }])
      .select()
      .single();
    if (error) {
      console.error('Order Creation Error:', error);
      throw error;
    }

    // 4️⃣ Reduce Stock (Inventory Management)
    for (const item of items) {
      try {
        const { data: pData } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.productId)
          .single();
        
        if (pData) {
          const newStock = Math.max(0, pData.stock - item.quantity);
          await supabase
            .from('products')
            .update({ stock: newStock })
            .eq('id', item.productId);
        }
      } catch (err) {
        console.error(`Failed to update stock for product ${item.productId}:`, err);
      }
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    console.error('SERVER 500 ERROR:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders/my
exports.getMyOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
exports.getOrder = async (req, res) => {
  try {
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', req.params.id).single();
    if (error || !order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, tracking_number: trackingNumber })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*, user:users(name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
