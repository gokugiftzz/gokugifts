import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiTag, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { validateCoupon } from '../utils/api';
import toast from 'react-hot-toast';
import styles from './Cart.module.css';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const navigate = useNavigate();

  const shipping = cartTotal > 999 ? 0 : 99;
  const discount = coupon?.discount || 0;
  const total = cartTotal + shipping - discount;

  const handleCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon({ code: couponCode, cartTotal });
      setCoupon(res.data);
      toast.success(`🎉 Coupon applied! You save ₹${res.data.discount}`);
    } catch (err) {
      // Demo coupons
      const demoCoupons = {
        'WELCOME10': { discount: Math.round(cartTotal * 0.1), code: 'WELCOME10' },
        'GIFT50': { discount: 50, code: 'GIFT50' },
        'GOKU20': { discount: Math.round(cartTotal * 0.2), code: 'GOKU20' }
      };
      const demo = demoCoupons[couponCode.toUpperCase()];
      if (demo) {
        setCoupon(demo);
        toast.success(`🎉 Coupon applied! You save ₹${demo.discount}`);
      } else {
        toast.error('Invalid coupon code');
      }
    } finally {
      setCouponLoading(false); }
  };

  if (cart.length === 0) return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className="empty-state">
          <span className="icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Start adding gifts you love for your loved ones!</p>
          <Link to="/products" className="btn btn-primary">Browse Gifts <FiArrowRight /></Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Shopping Cart</h1>
          <span className={styles.count}>{cartCount} item{cartCount !== 1 ? 's' : ''}</span>
        </div>

        <div className={styles.layout}>
          {/* Cart Items */}
          <div className={styles.items}>
            {cart.map(item => (
              <div key={item.cartId} className={styles.item}>
                <Link to={`/products/${item.productId}`} className={styles.itemImage}>
                  <img src={item.image || 'https://via.placeholder.com/100?text=🎁'} alt={item.name} onError={e => e.target.src = 'https://via.placeholder.com/100?text=🎁'} />
                </Link>
                <div className={styles.itemDetails}>
                  <Link to={`/products/${item.productId}`} className={styles.itemName}>{item.name}</Link>
                  {item.customization && (
                    <div className={styles.itemCustom}>
                      ✏️ {item.customization.text && `"${item.customization.text}"`} {item.customization.image && '📸 Custom photo'}
                    </div>
                  )}
                  <span className={styles.itemPrice}>₹{item.price?.toLocaleString()}</span>

                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qty}>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.cartId, item.quantity - 1)}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQuantity(item.cartId, item.quantity + 1)}><FiPlus /></button>
                  </div>
                  <div className={styles.itemTotal}>₹{(item.price * item.quantity)?.toLocaleString()}</div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(item.cartId)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            {/* Coupon */}
            <div className={styles.couponSection}>
              <div className={styles.couponInput}>
                <FiTag className={styles.couponIcon} />
                <input
                  type="text"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  className={styles.couponField}
                  onKeyDown={e => e.key === 'Enter' && handleCoupon()}
                />
                <button className={styles.couponBtn} onClick={handleCoupon} disabled={couponLoading}>
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
              <div className={styles.couponHints}>Try: <strong>WELCOME10</strong>, <strong>GIFT50</strong>, <strong>GOKU20</strong></div>
              {coupon && <div className={styles.couponApplied}>✅ "{coupon.code}" applied – Save ₹{discount}</div>}
            </div>

            {/* Price Breakdown */}
            <div className={styles.breakdown}>
              <div className={styles.row}>
                <span>Subtotal ({cartCount} items)</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>

              <div className={styles.row}>
                <span>Shipping</span>
                <span>{shipping === 0 ? <span style={{ color: '#06d6a0' }}>FREE</span> : `₹${shipping}`}</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.row} ${styles.discount}`}>
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className={`${styles.row} ${styles.total}`}>
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
            {shipping > 0 && (
              <p className={styles.freeShippingMsg}>Add ₹{(999 - cartTotal).toFixed(0)} more for FREE shipping!</p>
            )}

            <button
              className={`btn btn-primary ${styles.checkoutBtn}`}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <FiArrowRight />
            </button>

            <div className={styles.secureNote}>🔒 Secure & Encrypted Checkout</div>

            <Link to="/products" className={styles.continueLink}>
              <FiShoppingBag /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
