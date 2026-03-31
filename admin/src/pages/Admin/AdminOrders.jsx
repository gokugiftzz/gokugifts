import React, { useState, useEffect, useMemo } from 'react';
import { FiShoppingBag, FiEye, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiTrendingUp, FiSearch, FiGift, FiX, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './AdminOrders.module.css';
import { getAllOrders, updateOrderStatus } from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getAllOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, updateData) => {
    try {
      if (isUpdatingStatus) return;
      setIsUpdatingStatus(true);
      
      const res = await updateOrderStatus(orderId, updateData);
      
      const status = updateData.status;
      toast.success(`Order ${status} successfully!`);
      
      // Update local state without fetching all again
      const updatedOrder = res.data.order;
      setOrders(orders.map(o => o.id === orderId ? updatedOrder : o));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updatedOrder);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Status Filter
      if (filterStatus !== 'all' && order.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
      
      // Search Filter (by Order ID, Customer Name, or Gift Name)
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesId = order.order_code?.toLowerCase().includes(query) || order.id?.toLowerCase().includes(query);
        const matchesCustomer = order.user?.name?.toLowerCase().includes(query) || order.user?.email?.toLowerCase().includes(query);
        const matchesGift = order.items?.some(item => item.name?.toLowerCase().includes(query));
        
        if (!matchesId && !matchesCustomer && !matchesGift) return false;
      }
      return true;
    });
  }, [orders, filterStatus, searchQuery]);

  // KPIs
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => ['pending', 'processing'].includes(o.status?.toLowerCase())).length;
  const totalRevenue = orders.reduce((sum, o) => ['cancelled', 'failed'].includes(o.status?.toLowerCase()) ? sum : sum + Number(o.total || 0), 0);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <FiClock className={styles.statusIconPending} />;
      case 'confirmed': return <FiCheckCircle className={styles.statusIconConfirmed} />;
      case 'processing': return <FiTrendingUp className={styles.statusIconProcessing} />;
      case 'packed': return <FiShoppingBag className={styles.statusIconPacked} />;
      case 'shipped': return <FiTruck className={styles.statusIconShipped} />;
      case 'delivered': return <FiCheckCircle className={styles.statusIconDelivered} />;
      default: return <FiXCircle className={styles.statusIconCancelled} />;
    }
  };

  if (loading) return <div className={styles.loading}>Loading Orders...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Order Management ({orders.length})</h1>
          <p className={styles.subtitle}>Track, group, and process customer gifts efficiently</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiBlue}`}>
            <FiShoppingBag />
          </div>
          <div className={styles.kpiInfo}>
            <p>Total Orders</p>
            <h3>{totalOrders}</h3>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiOrange}`}>
            <FiClock />
          </div>
          <div className={styles.kpiInfo}>
            <p>Pending / Processing</p>
            <h3>{pendingOrders}</h3>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIconWrapper} ${styles.kpiGreen}`}>
            <FiTrendingUp />
          </div>
          <div className={styles.kpiInfo}>
            <p>Total Revenue</p>
            <h3>₹{totalRevenue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className={styles.filtersBar}>
        <input 
          type="text" 
          placeholder="Search by Gift Name, Customer, or Order ID..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.filterSelect}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Gift Previews</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong>{order.order_code || `#${order.id.substring(0, 8)}`}</strong></td>
                <td>
                  <div className={styles.customerCell}>
                    <span className={styles.customerName}>{order.user?.name || 'Guest User'}</span>
                    <small>{order.user?.email || 'No Email'}</small>
                  </div>
                </td>
                <td>
                  <div className={styles.giftPreviewList}>
                    {order.items?.map((item, idx) => (
                      <div key={idx} className={styles.giftPreviewItem}>
                        <FiGift className={styles.giftPreviewIcon} />
                        <span>{item.quantity}x {item.name || 'Gift item'}</span>
                      </div>
                    ))}
                  </div>
                </td>
                <td><strong>₹{order.total}</strong></td>
                <td>
                  <div className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()] || styles.pending}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <button 
                    className={styles.viewButton}
                    onClick={() => setSelectedOrder(order)}
                  >
                    <FiEye /> View Details
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className={styles.empty}>No orders match your criteria.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2><FiShoppingBag /> Order {selectedOrder.order_code || `#${selectedOrder.id.substring(0, 8)}`}</h2>
              <button className={styles.closeModal} onClick={() => setSelectedOrder(null)}><FiX /></button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Order Meta Info */}
              <div className={styles.orderMetaGrid}>
                {/* Meta Items Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', gridColumn: '1 / -1' }}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Customer Name</span>
                    <span className={styles.metaValue}>{selectedOrder.user?.name || 'Guest'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Email Address</span>
                    <span className={styles.metaValue}>{selectedOrder.user?.email || 'N/A'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Payment Method</span>
                    <span className={styles.metaValue}>{selectedOrder.payment_method || 'UPI'}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Date Placed</span>
                    <span className={styles.metaValue}>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                {selectedOrder.shipping_address && (
                   <div className={styles.metaItem} style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                    <span className={styles.metaLabel}>Shipping Address</span>
                    <span className={styles.metaValue}>
                      {selectedOrder.shipping_address.name}, {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.zipcode}
                    </span>
                   </div>
                )}

                {/* Tags Generator */}
                <div className={styles.metaItem} style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                  <span className={styles.metaLabel}>Order Tags</span>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
                    {selectedOrder.total >= 2000 && <span style={{ background: '#fef08a', color: '#854d0e', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>HIGH VALUE ORDER</span>}
                    {selectedOrder.shipping_address?.name && selectedOrder.user?.name && selectedOrder.shipping_address.name.toLowerCase() !== selectedOrder.user.name.toLowerCase() && (
                      <span style={{ background: '#fce7f3', color: '#be185d', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>SURPRISE DELIVERY</span>
                    )}
                    {(selectedOrder.customizations?.urgentDelivery || (selectedOrder.gift_message && selectedOrder.gift_message.toLowerCase().includes('urgent'))) && (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>URGENT GIFT</span>
                    )}
                    {selectedOrder.total < 2000 && !(selectedOrder.shipping_address?.name && selectedOrder.user?.name && selectedOrder.shipping_address.name.toLowerCase() !== selectedOrder.user.name.toLowerCase()) && !selectedOrder.customizations?.urgentDelivery && (
                       <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>No Special Tags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Grouped Gifts Layout */}
              <h3 className={styles.sectionTitle}><FiGift /> Grouped Gift Items</h3>
              <div className={styles.giftsList}>
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className={styles.giftCard}>
                    <img 
                      src={item.image || 'https://via.placeholder.com/150?text=Gift'} 
                      alt={item.name} 
                      className={styles.giftImage} 
                    />
                    <div className={styles.giftDetails}>
                      <div className={styles.giftHeader}>
                        <h4 className={styles.giftName}>{item.name}</h4>
                        <div className={styles.giftPriceQty}>
                          {item.quantity} × ₹{item.price}
                        </div>
                      </div>
                      
                      <div className={styles.giftMetaTags}>
                        <span className={styles.tagProductCode}>ID: {item.product_code || item.productId?.substring(0,10) || 'GFT-UNKNOWN'}</span>
                        <span className={styles.tagGiftType}>{item.gift_type || 'Standard Gift'}</span>
                        {item.variantName && <span className={styles.tagGiftType}>Variant: {item.variantName}</span>}
                      </div>

                      {/* Customization Details specific to the gift */}
                      {(item.customization_message || item.customization_photo || (selectedOrder.customizations && selectedOrder.customizations[item.productId])) && (
                        <div className={styles.giftCustomization}>
                          <span className={styles.customMsgLabel}>Personalization Details:</span>
                          <p className={styles.customMsgText}>
                            {item.customization_message || (selectedOrder.customizations && selectedOrder.customizations[item.productId]?.message) || "No custom message attached."}
                          </p>
                          {/* Photo URL could go here if implemented on frontend */}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* General Order Customizations (Fallback) */}
              {selectedOrder.gift_message && (
                <div style={{ marginBottom: '20px', padding: '15px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fef3c7' }}>
                   <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem', color: '#b45309' }}>General Gift Message</h4>
                   <p style={{ margin: 0, fontStyle: 'italic', color: '#78350f' }}>"{selectedOrder.gift_message}"</p>
                </div>
              )}

              {/* Payment Summary */}
              <div className={styles.totalsBox}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal || selectedOrder.total}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Discount</span>
                  <span style={{color: '#059669'}}>-₹{selectedOrder.discount || 0}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Shipping</span>
                  <span>₹{selectedOrder.shipping_charge || 0}</span>
                </div>
                <div className={styles.totalRow}>
                  <span>Gift Wrapping</span>
                  <span>{selectedOrder.customizations?.giftWrap ? '₹49' : 'None'}</span>
                </div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.total}</span>
                </div>
              </div>

              {/* Order History Timeline */}
              <h3 className={styles.sectionTitle} style={{marginTop: '30px'}}><FiClock /> Status History Timeline</h3>
              <div className={styles.timeline}>
                {selectedOrder.history && Array.isArray(selectedOrder.history) && selectedOrder.history.length > 0 ? (
                  <div className={styles.timelineList}>
                    {selectedOrder.history.map((h, i) => (
                      <div key={i} className={styles.timelineItem}>
                        <div className={styles.timelineDot}></div>
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineHeader}>
                            <span className={styles.timelineStatus}>{h.status.toUpperCase()}</span>
                            <span className={styles.timelineTime}>{new Date(h.time).toLocaleString()}</span>
                          </div>
                          <p className={styles.timelineMessage}>{h.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noHistory}>No history available for this order.</p>
                )}
              </div>

              {/* Status Update Actions */}
              <div className={styles.statusActions}>
                <h3 className={styles.sectionTitle}><FiTrendingUp /> Update Order Status</h3>
                <div className={styles.updateStatusGrid}>
                  <div className={styles.inputGroup}>
                    <label>New Status</label>
                    <select 
                      className={styles.statusUpdateSelect}
                      value={selectedOrder.status} 
                      onChange={(e) => handleStatusChange(selectedOrder.id, { status: e.target.value })}
                      disabled={isUpdatingStatus}
                    >
                      <option value="pending">Mark as Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancel Order</option>
                    </select>
                  </div>
                  
                  {selectedOrder.status === 'shipped' && (
                    <div className={styles.inputGroup}>
                      <label>Tracking Number</label>
                      <input 
                        type="text" 
                        placeholder="e.g. DELIV-12345" 
                        defaultValue={selectedOrder.tracking_number}
                        onBlur={(e) => handleStatusChange(selectedOrder.id, { status: 'shipped', trackingNumber: e.target.value })}
                        className={styles.modalInput}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

