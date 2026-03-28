import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiDollarSign, FiPlus, FiMoreVertical } from 'react-icons/fi';
import { getAdminStats } from '../../utils/api';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await getAdminStats();
      if (res.data?.analytics) {
        setStats(res.data.analytics);
      }
    } catch (err) {
      console.error('Analytics load failed', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Dashboard Analytics...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}><FiDollarSign /></div>
          <div className={styles.statInfo}>
            <span>Total Revenue</span>
            <h3>₹{stats?.totalRevenue?.toLocaleString() || 0}</h3>
            <p className={styles.positive}>Updated live</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.orange}`}><FiShoppingBag /></div>
          <div className={styles.statInfo}>
            <span>Total Orders</span>
            <h3>{stats?.totalOrders || 0}</h3>
            <p className={styles.positive}>Across all statuses</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.green}`}><FiUsers /></div>
          <div className={styles.statInfo}>
            <span>Total Users</span>
            <h3>{stats?.totalUsers || 0}</h3>
            <p className={styles.positive}>Registered customers</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.purple}`}><FiTrendingUp /></div>
          <div className={styles.statInfo}>
            <span>Inventory</span>
            <h3>{stats?.totalProducts || 0}</h3>
            <p className={styles.neutral}>Live products</p>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.tableCard}>
          <div className={styles.tableHeader}>
            <h3>Recent Orders</h3>
            <button className={styles.viewAll}>View All</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentOrders?.length > 0 ? stats.recentOrders.map(order => (
                <tr key={order.id}>
                  <td><strong>#{order.id.substring(0, 8)}</strong></td>
                  <td>{order.user?.name || 'Guest'}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.status} ${styles[order.status?.toLowerCase()]}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>₹{order.total}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No orders found yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.miniCard}>
          <h3>Platform Overview</h3>
          <div className={styles.productList}>
            <div className={styles.productItem}>
              <div className={styles.productInfo}>
                <strong>Database Sync</strong>
                <span>Supabase PostgreSQL • Online</span>
              </div>
              <div className={styles.productTrend} style={{ color: '#10b981' }}><FiTrendingUp /></div>
            </div>
            <div className={styles.productItem}>
              <div className={styles.productInfo}>
                <strong>API Server</strong>
                <span>Node.js Express • Connected</span>
              </div>
              <div className={styles.productTrend} style={{ color: '#10b981' }}><FiTrendingUp /></div>
            </div>
            <div className={styles.productItem}>
              <div className={styles.productInfo}>
                <strong>Total Products</strong>
                <span>{stats?.totalProducts || 0} items listed</span>
              </div>
              <div className={styles.productTrend}><FiShoppingBag /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
