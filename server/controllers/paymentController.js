const Razorpay = require('razorpay');
const crypto = require('crypto');
const supabase = require('../config/supabase');

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'placeholder_key_id';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret';

const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// @desc    Create Razorpay order
// @route   POST /api/payment/razorpay/create
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const options = {
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      notes: { orderId }
    };
    const razorpayOrder = await razorpay.orders.create(options);
    res.json({ success: true, order: razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await supabase
        .from('orders')
        .update({ payment_status: 'paid', razorpay_payment_id, status: 'confirmed' })
        .eq('id', orderId);
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
