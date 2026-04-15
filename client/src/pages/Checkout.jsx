import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiChevronLeft, FiMapPin, FiTruck, FiCheckCircle, FiAlertCircle, FiMessageSquare } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../utils/api';
import { getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Checkout.module.css';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    street: '', city: '', state: '', zip: '', phone: user?.phone || ''
  });

  const shipping = cartTotal > 999 ? 0 : 99;
  const total = cartTotal + shipping;

  const handleWhatsAppOrder = async (e) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }

    setLoading(true);
    
    try {
      // 1. Create a real order in the database first
      const orderData = {
        items: cart.map(item => ({
          productId: item.productId, // The cart context uses productId
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          customization: item.customText ? { text: item.customText } : null
        })),
        shippingAddress: {
          street: address.street,
          city: address.city,
          state: address.state,
          zip: address.zip,
          phone: address.phone
        },
        paymentMethod: 'WhatsApp Pay / UPI'
      };

      const res = await createOrder(orderData);
      const dbOrderId = res.data.order.id;

      // 2. Build WhatsApp Message with the Real Order ID
      let message = `╔══════════════════════════════╗\n`;
      message += `🎁 *New Order from GokuGiftz!*\n`;
      message += `╚══════════════════════════════╝\n\n`;
      message += `📦 *Order ID:* #${dbOrderId.substring(0, 8)}\n\n`;

      message += `👤 *Customer Details*\n`;
      message += `━━━━━━━━━━━━━━━━━━\n`;
      message += `Name: ${user.name}\n`;
      message += `Phone: ${address.phone}\n\n`;

      message += `📍 *Delivery Address*\n`;
      message += `━━━━━━━━━━━━━━━━━━\n`;
      message += `${address.street}, ${address.city},\n${address.state} - ${address.zip}\n\n`;

      message += `🛍️ *Order Items*\n`;
      message += `━━━━━━━━━━━━━━━━━━\n`;
      cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) - ₹${item.price * item.quantity}\n`;
        if (item.customText) message += `  _Note: ${item.customText}_\n`;
      });
      message += `\n`;

      message += `💰 *Order Summary*\n`;
      message += `━━━━━━━━━━━━━━━━━━\n`;
      message += `Subtotal: ₹${cartTotal.toLocaleString()}\n`;
      message += `Delivery: ${shipping === 0 ? 'FREE' : `₹${shipping}`}\n`;
      message += `━━━━━━━━━━━━━━\n`;
      message += `*Total Amount: ₹${total.toLocaleString()}*\n\n`;

      message += `━━━━━━━━━━━━━━━━━━\n`;
      message += `🙏 Please confirm my order and share the payment details.\n\n`;
      message += `✨ Looking forward to your confirmation!`;

      const encodedMsg = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/918248526060?text=${encodedMsg}`;
      
      // 3. Open WhatsApp and complete flow
      window.open(whatsappURL, '_blank');
      toast.success('Order placed & redirecting to WhatsApp... 📱');
      clearCart();
      navigate('/order-success', { state: { orderId: dbOrderId } });

    } catch (err) {
      console.error('WhatsApp Order Error:', err);
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        toast.error(serverMsg);
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={styles.emptyContainer}>
        <div className="empty-state">
          <FiAlertCircle size={48} color="var(--primary)" />
          <h3>Account Required</h3>
          <p>Please login or create an account to secure your order and continue checkout.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
            <Link to="/login" className="btn btn-primary">Login to Continue</Link>
            <Link to="/register" className="btn" style={{ background: '#f1f5f9', color: '#0f172a' }}>Sign Up here</Link>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className="empty-state">
          <FiAlertCircle size={48} color="var(--primary)" />
          <h3>Your cart is empty</h3>
          <p>You need to add items to your cart before checking out.</p>
          <Link to="/products" className="btn btn-primary">Go Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.steps}>
          <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
            <span className={styles.stepNum}>{step > 1 ? <FiCheckCircle /> : 1}</span>
            <span className={styles.stepLabel}>Shipping</span>
          </div>
          <div className={styles.stepLine}></div>
          <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
            <span className={styles.stepNum}>{step > 2 ? <FiCheckCircle /> : 2}</span>
            <span className={styles.stepLabel}>Review</span>
          </div>
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <form onSubmit={handleWhatsAppOrder}>
              {step === 1 ? (
                <div className={styles.section}>
                  <h2 className={styles.sectionTitle}><FiMapPin /> Shipping Details</h2>
                  <div className={styles.formGrid}>
                    <div className={styles.full}>
                      <label>Street Address</label>
                      <input 
                        type="text" className="input" required 
                        value={address.street}
                        onChange={e => setAddress({...address, street: e.target.value})}
                        placeholder="House No, Street, Landmark"
                      />
                    </div>
                    <div>
                      <label>City</label>
                      <input 
                        type="text" className="input" required 
                        value={address.city}
                        onChange={e => setAddress({...address, city: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>State</label>
                      <input 
                        type="text" className="input" required 
                        value={address.state}
                        onChange={e => setAddress({...address, state: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>ZIP Code</label>
                      <input 
                        type="text" className="input" required 
                        value={address.zip}
                        onChange={e => setAddress({...address, zip: e.target.value})}
                      />
                    </div>
                    <div>
                      <label>WhatsApp Number</label>
                      <input 
                        type="tel" className="input" required 
                        value={address.phone}
                        onChange={e => setAddress({...address, phone: e.target.value})}
                        placeholder="For delivery updates"
                      />
                    </div>
                  </div>
                  <button type="submit" className={`btn btn-primary ${styles.nextBtn}`}>
                    Review Order & Pay on WhatsApp <FiChevronLeft style={{transform: 'rotate(180deg)'}} />
                  </button>
                </div>
              ) : (
                <div className={styles.section}>
                  <div className={styles.backLink} onClick={() => setStep(1)}>
                    <FiChevronLeft /> Back to Details
                  </div>
                  <h2 className={styles.sectionTitle}><FiMessageSquare /> Order via WhatsApp</h2>
                  
                  <div className={styles.whatsappNotice}>
                    <p>
                      Click the button below to send your order details to our team on WhatsApp. 
                      We will verify your items and share a direct payment link to complete your order.
                    </p>
                    <ul>
                      <li>✅ Fast confirmation</li>
                      <li>✅ Safe & Secure Payment</li>
                      <li>✅ Direct chat with support</li>
                    </ul>
                  </div>

                  <button type="submit" className={`btn btn-primary ${styles.payBtn}`} disabled={loading} style={{ background: '#25D366' }}>
                    {loading ? 'Processing...' : (
                      <>
                        <FiMessageSquare style={{ marginRight: '8px' }} />
                        Place Order on WhatsApp
                      </>
                    )}
                  </button>

                </div>
              )}
            </form>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.orderSummary}>
              <h3>Order Summary</h3>
              <div className={styles.itemList}>
                {cart.map(item => (
                  <div key={item.cartId} className={styles.orderItem}>
                    <img src={getImageUrl(item.image)} alt={item.name} />
                    <div className={styles.orderItemInfo}>
                      <span className={styles.orderItemName}>{item.name}</span>
                      <span className={styles.orderItemPrice}>Qty: {item.quantity} × ₹{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.totals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Payable Amount</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
