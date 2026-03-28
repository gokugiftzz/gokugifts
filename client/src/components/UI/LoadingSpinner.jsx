import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ size = 'medium', fullPage = true }) => {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.spinner}>
          <div className={styles.ring}></div>
          <span className={styles.logo}>🎁</span>
        </div>
        <p className={styles.text}>Loading...</p>
      </div>
    );
  }
  return <div className={`${styles.spinner} ${styles[size]}`}><div className={styles.ring}></div></div>;
};

export default LoadingSpinner;
