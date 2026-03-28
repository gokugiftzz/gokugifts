import React from 'react';
import styles from './Support.module.css';

const VendorProgram = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Vendor Program</h1>
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Partner With Us</h2>
            <p>
              Are you a craftsperson, a local brand, or a gifting specialist? GokuGiftz provides you 
              with a platform to reach millions of customers looking for unique, personalized gifts.
            </p>
            <ul>
              <li><strong>Broad Reach:</strong> Access a pan-India customer base.</li>
              <li><strong>Zero Signup Fee:</strong> Onboard your products for free.</li>
              <li><strong>Logistics Support:</strong> We handle shipping labels and pickups.</li>
              <li><strong>Seller Dashboard:</strong> Manage your inventory and orders easily.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>What We Look For</h2>
            <p>
              We're looking for vendors who offer:
            </p>
            <ul>
              <li>Handmade & Artisanal products.</li>
              <li>Personalized gift options.</li>
              <li>High-quality materials.</li>
              <li>Reliable production times.</li>
            </ul>
          </section>

          <section className={styles.section}>
            <h2>How to Apply?</h2>
            <p>
              Click on the link below to apply and get onboarded as a partner: 
              <br/><br/>
              <button className="btn btn-primary">Join Vendor Program</button>
            </p>
          </section>

          <div className={styles.contactBox}>
            <h3>Questions?</h3>
            <p>Email our partnerships team at <a href="mailto:partners@gokugiftz.com">partners@gokugiftz.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProgram;
