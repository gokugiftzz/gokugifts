import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { FiGrid, FiBox, FiShoppingBag, FiUsers, FiBarChart2, FiSettings, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={styles.adminPage}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>GOKUGIFTS <span>ADMIN</span></div>
          <a href="http://localhost:5173" className={styles.backBtn}><FiArrowLeft /> Back to Store</a>
        </div>
        
        <nav className={styles.nav}>
          <NavLink to="/" end className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiGrid /> Dashboard
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiBox /> Products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiShoppingBag /> Orders
          </NavLink>
          <NavLink to="/users" className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiUsers /> Users
          </NavLink>
          <NavLink to="/inventory" className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiPackage /> Inventory
          </NavLink>
          <NavLink to="/analytics" className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiBarChart2 /> Analytics
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : styles.link}>
            <FiSettings /> Settings
          </NavLink>
        </nav>

        <div className={styles.sidebarFooter}>
          <p>Logged in as</p>
          <strong>{user.name}</strong>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topHeader}>
          <h2>Admin Control Panel</h2>
          <div className={styles.headerActions}>
            <span className={styles.date}>{new Date().toDateString()}</span>
            <div className={styles.adminAvatar}>{user.name[0]}</div>
          </div>
        </header>
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
