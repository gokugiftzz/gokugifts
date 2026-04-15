import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiCalendar, FiShield, FiMoreVertical } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './AdminUsers.module.css';
import { getAllUsers, updateUserRole, deleteUser } from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change user role to ${newRole}?`)) {
      try {
        await updateUserRole(userId, { role: newRole });
        toast.success('User role updated successfully');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to update role');
      }
    }
  };

  const handleUserDelete = async (userId) => {
    if (window.confirm('🚨 WARNING: Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading) return <div className={styles.loading}>Loading Users...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>User Management ({users.length})</h1>
          <p className={styles.subtitle}>Manage platform users and roles</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Role</th>
              <th>Joined Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className={styles.userCell}>
                    <div className={styles.avatar}>
                      {user.avatar ? <img src={user.avatar} alt="" /> : <FiUsers />}
                    </div>
                    <div className={styles.userInfo}>
                      <strong>{user.name}</strong>
                      <span>ID: {user.id.substring(0, 8)}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactItem}><FiMail /> {user.email}</div>
                    {user.phone && <div className={styles.contactItem}><FiPhone /> {user.phone}</div>}
                  </div>
                </td>
                <td>
                  <span className={`${styles.roleBadge} ${styles[user.role?.toLowerCase()]}`}>
                    <FiShield /> {user.role}
                  </span>
                </td>
                <td>
                  <div className={styles.dateCell}>
                    <FiCalendar /> {new Date(user.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td>
                  <span className={styles.activeBadge}>Active</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <select 
                      className={styles.roleSelect}
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="user">Switch to User</option>
                      <option value="vendor">Switch to Vendor</option>
                      <option value="admin">Promote to Admin</option>
                    </select>
                    <button 
                      onClick={() => handleUserDelete(user.id)}
                      style={{ background: '#fef2f2', color: '#e63946', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className={styles.empty}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
