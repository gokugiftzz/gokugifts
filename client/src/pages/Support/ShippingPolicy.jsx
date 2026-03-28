import React from 'react';
import styles from './Support.module.css';

const ShippingPolicy = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Shipping Policy</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Where We Deliver</h2>
            <p>
              We currently ship within India to most major cities and towns. We're working hard to expand 
              our reach and bring GokuGiftz to every doorstep.
            </p>
          </section>

          <section className={styles.section}>
            <h2>Shipping Rates</h2>
            <ul>
              <li><strong>Free Shipping:</strong> On all orders above ₹999 within India.</li>
              <li><strong>Standard Delivery:</strong> A flat shipping fee of ₹49 for orders below ₹999.</li>
              <li><strong>Same Day Delivery:</strong> Available for select items and locations at an additional cost of ₹149.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Delivery Times</h2>
            <p>
              Our shipping times depend on the type of product chosen. Most of our gifts are shipped within 
              1-2 business days.
            </p>
            <ul>
              <li><strong>Major Cities:</strong> 2-4 business days.</li>
              <li><strong>Other Locations:</strong> 3-6 business days.</li>
              <li><strong>Custom Gifts:</strong> May involve 1-2 extra days for manufacturing before shipping.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Tracking Your Order</h2>
            <p>
              Once your order is shipped, you will receive a tracking ID via email and WhatsApp to stay updated 
              on the status of your gift.
            </p>
          </section>

          <div className={styles.contactBox}>
            <h3>Got a delivery concern?</h3>
            <p>Call us at <a href="tel:+919999999999">+91 99999 99999</a> (Mon-Sat, 9AM-8PM).</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
