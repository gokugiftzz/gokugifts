import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiDownload, FiSearch, FiAlertTriangle, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './AdminProducts.module.css';
import { getProducts, deleteAllProducts, deleteProduct, createProduct } from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Gifts',
    stock: 10,
    same_day_delivery: false,
    customizable: false,
    imageURL: '', // fallback
    imageFile: null,
    variants: [] // Array of { variantName, price, discountPercentage, stock, image }
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getProducts({ limit: 100 });
      setProducts(res.data.products || []);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, imageFile: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        toast.error('Delete failed');
      }
    }
  };

  const handleEraseAll = async () => {
    if (window.confirm('⚠️ CRITICAL: Are you sure you want to erase ALL products? This cannot be undone!')) {
      try {
        await deleteAllProducts();
        toast.success('All products have been erased.');
        setProducts([]);
      } catch (err) {
        toast.error('Erase failed: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill required fields (Name, Price)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Use FormData for Multipart Upload
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', parseFloat(newProduct.price));
      formData.append('originalPrice', newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : ''); // Send empty string for null
      formData.append('category', newProduct.category);
      formData.append('stock', parseInt(newProduct.stock));
      formData.append('same_day_delivery', newProduct.same_day_delivery);
      formData.append('customizable', newProduct.customizable);
      
      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      } else if (newProduct.imageURL) {
        formData.append('images', newProduct.imageURL); // string url fallback
      } else {
        formData.append('images', 'https://via.placeholder.com/400x400?text=🎁'); // Default image if neither file nor URL
      }

      // Add Variants
      if (newProduct.variants.length > 0) {
        formData.append('variants', JSON.stringify(newProduct.variants));
      }

      await createProduct(formData);
      toast.success('Product created with variants successfully!');
      setShowModal(false);
      setNewProduct({ name: '', description: '', price: '', originalPrice: '', category: 'Gifts', stock: 10, same_day_delivery: false, customizable: false, imageURL: '', imageFile: null, variants: [] });
      setPreview(null);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to create product: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { variantName: '', price: '', discountPercentage: 0, stock: 10 }]
    });
  };

  const handleUpdateVariant = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    updatedVariants[index][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleRemoveVariant = (index) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter((_, i) => i !== index)
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Product Management</h1>
          <p className={styles.subtitle}>Showing {products.length} active products</p>
        </div>
        <div className={styles.actions}>
          <button className={`btn btn-secondary ${styles.eraseAllBtn}`} onClick={handleEraseAll}>
            <FiTrash2 /> Erase All
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> Add New Product
          </button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? products.map(product => (
              <tr key={product.id}>
                <td>
                  <div className={styles.productCell}>
                    <img src={product.images?.[0] || 'https://via.placeholder.com/100?text=🎁'} alt="" className={styles.productImg} />
                    <div className={styles.productInfo}>
                      <strong>{product.name}</strong>
                      <span title={product.id}>ID: {product.id.substring(0,8)}...</span>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>
                  <span className={`${styles.badge} ${product.stock > 50 ? styles.stockBadge : product.stock > 0 ? styles.lowStock : styles.outOfStock}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <div className={styles.rowActions}>
                    <button className={styles.iconBtn} title="View"><FiEye /></button>
                    <button className={styles.iconBtn} title="Edit"><FiEdit2 /></button>
                    <button className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete" onClick={() => handleDelete(product.id)}>
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5" className={styles.loading}>
                  <FiAlertTriangle size={36} /><br/><br/>
                  No products found. Start by adding one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Add New Product</h2>
              <button className={styles.closeBtn} onClick={() => { setShowModal(false); setPreview(null); setNewProduct({ name: '', description: '', price: '', originalPrice: '', category: 'Gifts', stock: 10, same_day_delivery: false, customizable: false, imageURL: '', imageFile: null }); }}><FiX /></button>
            </div>
            <form onSubmit={handleAddProduct} className={styles.modalBody}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input type="text" className="input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Magic Cushion" />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={newProduct.category} 
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})} 
                    placeholder="e.g. Birthday, Home Decor" 
                    required 
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Selling Price (₹)</label>
                  <input type="number" className="input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Original Price (Optional ₹)</label>
                  <input type="number" className="input" value={newProduct.originalPrice} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Initial Stock</label>
                  <input type="number" className="input" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Product Image</label>
                  <input type="file" accept="image/*" className="input" onChange={handleFileChange} />
                </div>
              </div>

              {preview && (
                 <div style={{ marginTop: 15, textAlign: 'center' }}>
                   <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: 5 }}>Image Preview:</p>
                   <img src={preview} alt="Preview" style={{ width: 100, height: 100, borderRadius: 10, objectFit: 'cover', border: '2px solid #eee' }} />
                 </div>
              )}
              
              <div className={styles.formGroup} style={{ marginTop: 16 }}>
                <label>Description</label>
                <textarea className="input" rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>

              <div className={styles.checkboxes}>
                <label>
                  <input type="checkbox" checked={newProduct.same_day_delivery} onChange={e => setNewProduct({...newProduct, same_day_delivery: e.target.checked})} />
                  Same Day Delivery
                </label>
                <label>
                  <input type="checkbox" checked={newProduct.customizable} onChange={e => setNewProduct({...newProduct, customizable: e.target.checked})} />
                  Customizable (Text/Photo)
                </label>
              </div>

              {/* Variants Section */}
              <div className={styles.variantsSection}>
                <div className={styles.variantsHeader}>
                  <h3>Product Variants</h3>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddVariant}>
                    <FiPlus /> Add Variant
                  </button>
                </div>
                
                {newProduct.variants.length > 0 ? (
                  <div className={styles.variantsList}>
                    {newProduct.variants.map((variant, index) => (
                      <div key={index} className={styles.variantItem}>
                        <div className={styles.variantInputs}>
                          <input 
                            type="text" 
                            className="input-sm" 
                            placeholder="Variant Name (e.g. Red / XL)" 
                            value={variant.variantName} 
                            onChange={e => handleUpdateVariant(index, 'variantName', e.target.value)}
                            required
                          />
                          <input 
                            type="number" 
                            className="input-sm" 
                            placeholder="Price" 
                            value={variant.price} 
                            onChange={e => handleUpdateVariant(index, 'price', e.target.value)}
                            required
                          />
                          <input 
                            type="number" 
                            className="input-sm" 
                            placeholder="DSQ %" 
                            value={variant.discountPercentage} 
                            onChange={e => handleUpdateVariant(index, 'discountPercentage', e.target.value)}
                          />
                          <input 
                            type="number" 
                            className="input-sm" 
                            placeholder="Stock" 
                            value={variant.stock} 
                            onChange={e => handleUpdateVariant(index, 'stock', e.target.value)}
                            required
                          />
                        </div>
                        <button type="button" className={styles.removeVariantBtn} onClick={() => handleRemoveVariant(index)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noVariants}>No variants added yet. (Optional)</p>
                )}
              </div>

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-ghost" onClick={() => { setShowModal(false); setPreview(null); setNewProduct({ name: '', description: '', price: '', originalPrice: '', category: 'Gifts', stock: 10, same_day_delivery: false, customizable: false, imageURL: '', imageFile: null }); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Uploading & Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
