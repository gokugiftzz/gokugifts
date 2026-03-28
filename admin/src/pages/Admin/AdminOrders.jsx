import React, { useState, useEffect } from 'react';
import { FiShoppingBag, FiEye, FiClock, FiCheckCircle, FiTruck, FiXCircle, FiTrendingUp } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './AdminOrders.module.css';
import { getAllOrders, updateOrderStatus } from '../../utils/api';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

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

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order ${newStatus} successfully!`);
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.status?.toLowerCase() === filterStatus.toLowerCase());

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return <FiClock className={styles.statusIconPending} />;
      case 'confirmed': return <FiCheckCircle className={styles.statusIconConfirmed} />;
      case 'processing': return <FiTrendingUp className={styles.statusIconProcessing} />;
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
          <p className={styles.subtitle}>Track and manage customer orders</p>
        </div>
        <div className={styles.filters}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={styles.select}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? filteredOrders.map(order => (
              <tr key={order.id}>
                <td><strong>#{order.id.substring(0, 8)}</strong></td>
                <td>
                  <div className={styles.customerCell}>
                    <span>{order.user?.name || 'Guest'}</span>
                    <small>{order.user?.email || 'No Email'}</small>
                  </div>
                </td>
                <td>{order.items?.length || 0} items</td>
                <td>₹{order.total}</td>
                <td>
                  <div className={`${styles.statusBadge} ${styles[order.status?.toLowerCase()]}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </div>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <select 
                      className={styles.statusUpdate}
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="7" className={styles.empty}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
