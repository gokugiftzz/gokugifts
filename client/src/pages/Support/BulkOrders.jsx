import React from 'react';
import styles from './Support.module.css';

const BulkOrders = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Bulk & Corporate Orders</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Why GokuGiftz for Bulk Orders?</h2>
            <p>
              Looking for corporate gifts, wedding favors, or bulk orders for a special event? 
              GokuGiftz provides premium solutions designed to make a lasting impression.
            </p>
            <ul>
              <li><strong>Volume Discounts:</strong> Get up to 40% off on bulk orders.</li>
              <li><strong>Custom Branding:</strong> Add your company logo or branding on gifts.</li>
              <li><strong>Individual Shipping:</strong> We can ship to multiple addresses for you.</li>
              <li><strong>Dedicated Manager:</strong> A single point of contact to handle your order seamlessly.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Available Options</h2>
            <ul>
              <li>Corporate Gift Hampers</li>
              <li>Employee Appreciation Gifts</li>
              <li>Client & Vendor Gifting</li>
              <li>Wedding Favors & Invitations</li>
              <li>Seasonal Gifting (Diwali, New Year, Christmas)</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>How to Place a Bulk Order?</h2>
            <p>
              Simply email us with your requirements and a rough estimate of the quantity you'll need. 
              Our bulk gifting specialists will get back to you within 24 hours with a custom quote.
            </p>
          </section>

          <div className={styles.contactBox}>
            <h3>Ready to partner?</h3>
            <p>Email us at <a href="mailto:bulk@gokugiftz.com">bulk@gokugiftz.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOrders;
