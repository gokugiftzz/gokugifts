import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiPackage, FiHeart, FiSettings, FiLogOut, FiEdit3, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../utils/api';
import toast from 'react-hot-toast';
import styles from './Profile.module.css';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || ''
  });

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(formData);
      updateUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated! ✨');
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.userSection}>
            <div className={styles.avatarBox}>
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className={styles.avatarPlaceholder}>{user?.name?.[0]}</div>
              )}
            </div>
            <div className={styles.userText}>
              <h1>{user?.name}</h1>
              <p>{user?.email}</p>
              <span className={styles.badge}>{user?.role?.toUpperCase()}</span>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={logout}><FiLogOut /> Logout</button>
        </div>

        <div className={styles.layout}>
          <nav className={styles.sidebar}>
            <button className={`${styles.navBtn} ${activeTab === 'info' ? styles.navActive : ''}`} onClick={() => setActiveTab('info')}>
              <FiUser /> Profile Info
            </button>
            <button className={`${styles.navBtn} ${activeTab === 'orders' ? styles.navActive : ''}`} onClick={() => setActiveTab('orders')}>
              <FiPackage /> My Orders
            </button>
            <button className={`${styles.navBtn} ${activeTab === 'wishlist' ? styles.navActive : ''}`} onClick={() => setActiveTab('wishlist')}>
              <FiHeart /> Wishlist
            </button>
            <button className={`${styles.navBtn} ${activeTab === 'settings' ? styles.navActive : ''}`} onClick={() => setActiveTab('settings')}>
              <FiSettings /> Account Settings
            </button>
          </nav>

          <main className={styles.content}>
            {activeTab === 'info' && (
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>Personal Information</h3>
                  {!editing ? (
                    <button className={styles.editBtn} onClick={() => setEditing(true)}><FiEdit3 /> Edit</button>
                  ) : (
                    <div className={styles.editActions}>
                      <button className={styles.saveBtn} onClick={handleUpdate}><FiSave /> Save</button>
                      <button className={styles.cancelBtn} onClick={() => setEditing(false)}><FiX /></button>
                    </div>
                  )}
                </div>
                
                <form className={styles.form}>
                  <div className={styles.field}>
                    <label>Full Name</label>
                    <input 
                      type="text" className="input" disabled={!editing} 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className={styles.field}>
                    <label>Email Address</label>
                    <input type="email" className="input" disabled value={user?.email} />
                    <small>Email cannot be changed</small>
                  </div>
                  <div className={styles.field}>
                    <label>Phone Number</label>
                    <input 
                      type="tel" className="input" disabled={!editing} 
                      value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className={styles.card}>
                <h3>Your Recent Orders</h3>
                <div className={styles.emptyCard}>
                  <FiPackage />
                  <p>You haven't placed any orders yet.</p>
                  <Link to="/products" className="btn btn-primary">Start Gifting</Link>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className={styles.card}>
                <h3>Your Wishlist</h3>
                <p>Items you've hearted will appear here.</p>
                <Link to="/wishlist" className={styles.link}>View full wishlist →</Link>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.card}>
                <h3>Security & Privacy</h3>
                <div className={styles.settingItem}>
                  <div>
                    <strong>Two-Factor Authentication</strong>
                    <p>Add an extra layer of security to your account.</p>
                  </div>
                  <button className="btn btn-ghost">Enable</button>
                </div>
                <div className={styles.settingItem}>
                  <div>
                    <strong>Marketing Emails</strong>
                    <p>Receive updates about new gift arrivals and sales.</p>
                  </div>
                  <input type="checkbox" defaultChecked />
                </div>
                <div className={`${styles.settingItem} ${styles.danger}`}>
                  <div>
                    <strong>Delete Account</strong>
                    <p>Permanently remove your account and all data.</p>
                  </div>
                  <button className="btn btn-secondary">Delete</button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
