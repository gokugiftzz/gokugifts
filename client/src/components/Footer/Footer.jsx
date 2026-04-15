import React from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.glow}></div>
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <img src="/logo.png" alt="GokuGiftz" className={styles.logoImg} />
            </Link>
            <p className={styles.tagline}>
              Making every moment magical with personalized gifts that speak from the heart. 🎁
            </p>
            {/* Social Links */}
            <div className={styles.social}>
              <a href="https://www.instagram.com/goku.giftz" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram"><FiInstagram /></a>
              <a href="#" className={styles.socialLink} aria-label="Facebook"><FiFacebook /></a>
              <a href="#" className={styles.socialLink} aria-label="Twitter"><FiTwitter /></a>
              <a href="#" className={styles.socialLink} aria-label="YouTube"><FiYoutube /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className={styles.links}>
            <h4 className={styles.heading}>Shop</h4>
            <Link to="/products" className={styles.link}>All Gifts</Link>
            <Link to="/products?occasion=birthday" className={styles.link}>Birthday Gifts</Link>
            <Link to="/products?occasion=anniversary" className={styles.link}>Anniversary Gifts</Link>
            <Link to="/products?occasion=wedding" className={styles.link}>Wedding Gifts</Link>
           
          </div>

          {/* Support */}
          <div className={styles.links}>
            <h4 className={styles.heading}>Support</h4>
            <Link to="/profile" className={styles.link}>Track Order</Link>
            <Link to="/returns-refunds" className={styles.link}>Returns & Refunds</Link>
            <Link to="/shipping-policy" className={styles.link}>Shipping Policy</Link>
            <Link to="/faq" className={styles.link}>FAQ</Link>
            <Link to="/bulk-orders" className={styles.link}>Bulk Orders</Link>
            <Link to="/vendor-program" className={styles.link}>Vendor Program</Link>
          </div>

          {/* Contact */}
          <div className={styles.links}>
            <h4 className={styles.heading}>Contact Us</h4>
            <a href="mailto:gokugiftzz@gmail.com" className={styles.contact}><FiMail /> gokugiftzz@gmail.com</a>
            <a href="tel:+918248526060" className={styles.contact}><FiPhone /> +91 824 852 6060</a>
            <span className={styles.contact}><FiMapPin /> Madurai, Natham, Tamil Nadu</span>
            <div className={styles.hours}>
              <span>Mon - Sat: 9AM - 8PM</span>
              <span>Sunday: 10AM - 6PM</span>
            </div>
          </div>
        </div>


        {/* Bottom */}
        <div className={styles.bottom}>
          <p>© {currentYear} GokuGiftz. Made with ❤️ in India. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
