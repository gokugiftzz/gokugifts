import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiTruck, FiArrowRight, FiDownload } from 'react-icons/fi';
import styles from './OrderSuccess.module.css';

const OrderSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId || 'DEMO-123456';

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.box}>
          <div className={styles.iconBox}>
            <FiCheckCircle size={80} color="var(--accent)" />
          </div>
          <h1 className={styles.title}>Thank You For Your Order!</h1>
          <p className={styles.subtitle}>Your order <strong>#{orderId}</strong> has been received and is being processed.</p>
          
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <FiPackage />
              <h3>Order Status</h3>
              <p>Processing / Preparing your gift</p>
            </div>
            <div className={styles.infoCard}>
              <FiTruck />
              <h3>Estimated Delivery</h3>
              <p>within 2 - 4 business days</p>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to="/profile" className="btn btn-primary">Track My Order <FiArrowRight /></Link>
            <button className="btn btn-ghost" onClick={() => window.print()}><FiDownload /> Download Invoice</button>
          </div>

          <p className={styles.emailNote}>We've sent a confirmation email with all details to your inbox.</p>
          
          <div className={styles.footerLinks}>
            <Link to="/products">New arrivals</Link>
            <Link to="/ai-finder">Gift helper</Link>
            <Link to="/">Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
