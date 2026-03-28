import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import styles from './Auth.module.css';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to GokuGiftz 🎁');
      window.history.back();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.logo}>🎁</div>
          <h1 className={styles.title}>Create Account</h1>
          <p className={styles.subtitle}>Join GokuGiftz and start gifting with love!</p>
          <div className={styles.couponBanner}>Use code <strong>WELCOME10</strong> for 10% off your first order!</div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your full name" className="input" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className="input" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number (optional)</label>
              <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" className="input" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min. 8 characters" className="input" required minLength="8" />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" className="input" required />
            </div>
            <button type="submit" className={`btn btn-primary ${styles.submitBtn}`} disabled={loading}>
              {loading ? 'Creating account...' : 'Create My Account 🎉'}
            </button>
          </form>

          <p className={styles.termsText}>By creating an account, you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a></p>
          <p className={styles.switchText}>Already have an account? <Link to="/login" className={styles.switchLink}>Login</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
