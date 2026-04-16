import React, { useState, useEffect } from 'react';
import { FiUsers, FiMail, FiPhone, FiCalendar, FiShield, FiMoreVertical, FiXCircle, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './AdminUsers.module.css';
import { getAllUsers, updateUserRole, deleteUser } from '../../utils/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      console.log('Executing confirmed delete for User ID:', deleteId);
      await deleteUser(deleteId);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error('Delete User Failed:', err.response?.data || err.message);
      toast.error(`Failed to delete user: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading Users...</div>;

  return (
    <div className={styles.container}>
      {/* Confirmation Modal */}
      {deleteId && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmIcon}><FiXCircle /></div>
            <h3>Are you absolutely sure?</h3>
            <p>This will permanently delete the user and all their associated data. This action cannot be undone.</p>
            <div className={styles.confirmActions}>
              <button className="btn btn-ghost" onClick={() => setDeleteId(null)} disabled={isDeleting}>Cancel</button>
              <button className={styles.deleteBtnFinal} onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                      onClick={() => setDeleteId(user.id)}
                      className={styles.deleteBtn}
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
