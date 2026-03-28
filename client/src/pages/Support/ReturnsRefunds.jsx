import React from 'react';
import styles from './Support.module.css';

const ReturnsRefunds = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Returns & Refunds</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Return Policy</h2>
            <p>
              At GokuGiftz, we strive for 100% satisfaction. If you're not completely happy with your purchase, 
              we're here to help. Our return policy is straightforward:
            </p>
            <ul>
              <li>Returns are accepted within 7 days from the date of delivery.</li>
              <li>Items must be unused, unwashed, and in their original packaging with tags intact.</li>
              <li>Proof of purchase (invoice or order number) is required for all returns.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Non-Returnable Items</h2>
            <p>
              Please note that certain items cannot be returned due to their nature:
            </p>
            <ul>
              <li><strong>Personalized & Custom Gifts:</strong> Items that have been customized with photos, names, or messages cannot be returned unless they arrive damaged or defective.</li>
              <li>Perishable items like chocolates or flowers.</li>
              <li>Intimate or sanitary goods.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>Refund Process</h2>
            <p>
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund. 
              If approved, the refund will be processed to your original payment method within 5-7 business days.
            </p>
          </section>

          <div className={styles.contactBox}>
            <h3>Need help?</h3>
            <p>Contact us at <a href="mailto:support@gokugiftz.com">support@gokugiftz.com</a> for any return-related queries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsRefunds;
