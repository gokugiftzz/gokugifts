const supabase = require('../config/supabase');
const Razorpay = require('razorpay');
const { logActivity } = require('../utils/activityLogger');

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

    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `ORD-${timestamp}-${random}`;

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
        coupon_code: couponCode,
        history: [{ status: 'pending', time: new Date().toISOString(), message: 'Order placed successfully' }]
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
    const { status, trackingNumber, note } = req.body;
    
    // Fetch current order to get history
    const { data: currentOrder } = await supabase.from('orders').select('history').eq('id', req.params.id).single();
    const updatedHistory = [...(currentOrder?.history || [])];
    updatedHistory.push({
      status,
      time: new Date().toISOString(),
      message: note || `Order status updated to ${status}`
    });

    const updateData = { 
      status, 
      tracking_number: trackingNumber,
      history: updatedHistory
    };

    if (status === 'shipped') {
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
      updateData.estimated_delivery = deliveryDate.toISOString().split('T')[0];
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;

    // Log admin activity
    await logActivity(req, 'UPDATE_ORDER_STATUS', 'order', order.id, { from: currentOrder.status, to: status, order_code: order.order_code });

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
