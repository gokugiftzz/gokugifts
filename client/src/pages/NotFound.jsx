import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch } from 'react-icons/fi';
import styles from './NotFound.module.css';

const NotFound = () => {
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.errorBox}>
          <h1 className={styles.code}>404</h1>
          <div className={styles.icon}>🎁❓</div>
          <h2 className={styles.title}>Gift Not Found!</h2>
          <p className={styles.text}>The page you are looking for has been misplaced or never existed. Maybe it's hidden in a gift box?</p>
          <div className={styles.actions}>
            <Link to="/" className="btn btn-primary"><FiHome /> Back Home</Link>
            <Link to="/products" className="btn btn-secondary"><FiSearch /> Shop Gifts</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
