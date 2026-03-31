import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile, getMyOrders } from '../utils/api';
import { getImageUrl } from '../utils/helpers';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';
import { useEffect } from 'react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders history.');
    } finally {
      setOrdersLoading(false); }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(formData);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.userSection}>
            <div className={styles.avatarBox}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>{user?.name?.[0]}</div>
              )}
            </div>
            <div className={styles.userText}>
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span className={styles.badge}>{user?.role?.toUpperCase()}</span>
                <span className={styles.reviewCounter}>⭐ {user?.review_count || 0} Reviews Posted</span>
              </div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}><FiLogOut /> Logout</button>
        </div>

        <div className={styles.layout}>
          <nav className={styles.sidebar}>
            <button className={`${styles.navBtn} ${activeTab === 'info' ? styles.navActive : ''}`} onClick={() => setActiveTab('info')}>
              <FiUser /> Profile Info
            </button>
            <button className={`${styles.navBtn} ${activeTab === 'orders' ? styles.navActive : ''}`} onClick={() => setActiveTab('orders')}>
              <FiPackage /> My Orders
            </button>
            <button className={`${styles.navBtn} ${activeTab === 'wishlist' ? styles.navActive : ''}`} onClick={() => setActiveTab('wishlist')}>
              <FiHeart /> Wishlist
            </button>
            <button className={`${styles.navBtn} ${activeTab === 'settings' ? styles.navActive : ''}`} onClick={() => setActiveTab('settings')}>
              <FiSettings /> Account Settings
            </button>
          </nav>

          <main className={styles.content}>
            {activeTab === 'info' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Personal Information</h3>
                  {!editing ? (
                    <button className={styles.editBtn} onClick={() => setEditing(true)}><FiEdit3 /> Edit</button>
                  ) : (
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={handleUpdate}><FiSave /> Save</button>
                      <button className={styles.cancelBtn} onClick={() => setEditing(false)}><FiX /></button>
                    </div>
                  )}
                </div>
                
                <form className={styles.form}>
                  <div className={styles.field}>
                    <label>Full Name</label>
                    <input 
                      type="text" className="input" disabled={!editing} 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Email Address</label>
                    <input type="email" className="input" disabled value={user?.email} />
                    <small>Email cannot be changed</small>
                  </div>
                  <div className={styles.field}>
                    <label>Phone Number</label>
                    <input 
                      type="tel" className="input" disabled={!editing} 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Your Order History</h3>
                  <button className="btn btn-ghost btn-sm" onClick={fetchOrders} disabled={ordersLoading}>
                    {ordersLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
                
                {orders.length > 0 ? (
                  <div className={styles.orderList}>
                    {orders.map(order => (
                      <div key={order.id} className={styles.orderItem}>
                        <div className={styles.orderHead}>
                          <div>
                            <span className={styles.orderId}>Order #{order.order_code || order.id.substring(0,8)}</span>
                            <span className={styles.orderDate}>{new Date(order.created_at).toLocaleDateString()}</span>
                          </div>
                          <span className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                            {order.status?.toUpperCase()}
                          </span>
                        </div>
                        <div className={styles.orderItemsPreview}>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className={styles.miniItem}>
                              <img src={getImageUrl(item.image)} alt="" />
                              <div className={styles.miniItemInfo}>
                                <strong>{item.name}</strong>
                                <span>Qty: {item.quantity} × ₹{item.price}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className={styles.orderFoot}>
                          <span>Total Amount: <strong>₹{order.total?.toLocaleString()}</strong></span>
                          <button className="btn btn-ghost btn-sm" onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                            {expandedOrder === order.id ? 'Hide Details' : 'View Details'}
                          </button>
                        </div>

                        {expandedOrder === order.id && (
                          <div className={styles.expandedDetails}>
                            <div className={styles.detailGrid}>
                              <div className={styles.detailSection}>
                                <h4>Shipping Address</h4>
                                <p>{order.shipping_address?.street}</p>
                                <p>{order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.zip}</p>
                                <p>Phone: {order.shipping_address?.phone}</p>
                              </div>
                              <div className={styles.detailSection}>
                                <h4>Payment Info</h4>
                                <p>Method: {order.payment_method}</p>
                                <p>Status: <span className={styles.paymentStatus}>{order.payment_status?.toUpperCase()}</span></p>
                              </div>
                            </div>
                            <div className={styles.fullItems}>
                              <h4>Detailed Item List</h4>
                              {order.items?.map((item, idx) => (
                                <div key={idx} className={styles.fullItem}>
                                  <div style={{ display: 'flex', gap: 12 }}>
                                    <img src={getImageUrl(item.image)} alt="" />
                                    <div>
                                      <strong>{item.name}</strong>
                                      {item.variantName && <span className={styles.itemVariant}>Variant: {item.variantName}</span>}
                                      {item.customization && (
                                        <div className={styles.itemCustomization}>
                                          {item.customization.text && <p>Note: "{item.customization.text}"</p>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className={styles.itemPricing}>
                                    <span>{item.quantity} × ₹{item.price}</span>
                                    <strong>₹{item.quantity * item.price}</strong>
                                  </div>
                                </div>
                              ))}
                              <div className={styles.summaryBreakdown}>
                                <div className={styles.summaryRow}><span>Subtotal:</span><span>₹{order.subtotal}</span></div>
                                <div className={styles.summaryRow}><span>Discount:</span><span>-₹{order.discount || 0}</span></div>
                                <div className={styles.summaryRow}><span>Shipping:</span><span>₹{order.shipping_charge || 0}</span></div>
                                <div className={`${styles.summaryRow} ${styles.finalTotal}`}><span>Total:</span><span>₹{order.total}</span></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.emptyCard}>
                    <FiPackage />
                    <p>{ordersLoading ? 'Loading your orders...' : "You haven't placed any orders yet."}</p>
                    {!ordersLoading && <Link to="/products" className="btn btn-primary">Start Gifting</Link>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className={styles.card}>
                <h3>Your Wishlist</h3>
                <p>Items you've hearted will appear here.</p>
                <Link to="/wishlist" className={styles.link}>View full wishlist →</Link>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.card}>
                <h3>Notification Preferences</h3>
                <div className={styles.settingItem}>
                  <div>
                    <strong>Marketing Emails</strong>
                    <p>Receive updates about new gift arrivals and sales.</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className={styles.settingItem}>
                  <div>
                    <strong>Order Updates</strong>
                    <p>Get real-time tracking and status notifications via WhatsApp.</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div style={{ marginTop: '40px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <p style={{ color: '#64748b', fontSize: '0.85rem', textAlign: 'center' }}>
                    Need to change your password or secure your account? Contact support at support@gokugifts.com
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
