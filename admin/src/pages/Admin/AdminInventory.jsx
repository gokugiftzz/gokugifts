import React, { useState, useEffect } from 'react';
import { FiPackage, FiSearch, FiRefreshCw, FiPlus, FiCheckCircle, FiMinusCircle } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';
import styles from './AdminUsers.module.css'; // Reuse table styles for consistency

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({ prefix: 'GFT', start: 1001, end: 1999 });

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setInventory(data.inventory);
    } catch (error) {
      toast.error('Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleBulkImport = async () => {
    try {
      await axios.post(`${API_URL}/inventory/bulk`, bulkConfig, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      toast.success('Inventory IDs imported successfully');
      setShowBulkModal(false);
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Import failed');
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.product_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Inventory Management (999 IDs)</h1>
        <div className={styles.actions}>
          <div className="search-bar" style={{ display: 'flex', gap: '10px' }}>
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search IDs or Product Name..." 
                className="input" 
                style={{ paddingLeft: '35px' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary" onClick={() => setShowBulkModal(true)}>
              <FiPlus /> Initialize IDs
            </button>
            <button className="btn btn-ghost" onClick={fetchInventory} disabled={loading}>
              <FiRefreshCw className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID Code</th>
              <th>Assigned Product</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No inventory records found.</td></tr>
            ) : (
              filteredInventory.map((item) => (
                <tr key={item.id}>
                  <td><strong style={{ color: '#1e293b' }}>{item.product_code}</strong></td>
                  <td>{item.product_name || <em style={{ color: '#94a3b8' }}>Unassigned</em>}</td>
                  <td>
                    {item.is_used ? (
                      <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiMinusCircle /> Used
                      </span>
                    ) : (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <FiCheckCircle /> Available
                      </span>
                    )}
                  </td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showBulkModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ maxWidth: '400px', padding: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Initialize ID Pool</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group">
                <label>ID Prefix</label>
                <input 
                  type="text" className="input" 
                  value={bulkConfig.prefix} 
                  onChange={(e) => setBulkConfig({...bulkConfig, prefix: e.target.value})} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group">
                  <label>Start Number</label>
                  <input 
                    type="number" className="input" 
                    value={bulkConfig.start} 
                    onChange={(e) => setBulkConfig({...bulkConfig, start: parseInt(e.target.value)})} 
                  />
                </div>
                <div className="form-group">
                  <label>End Number</label>
                  <input 
                    type="number" className="input" 
                    value={bulkConfig.end} 
                    onChange={(e) => setBulkConfig({...bulkConfig, end: parseInt(e.target.value)})} 
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleBulkImport}>Import Batch</button>
                <button className="btn btn-ghost" onClick={() => setShowBulkModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInventory;
