import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiDownload, FiSearch, FiAlertTriangle, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import styles from './AdminProducts.module.css';
import { getProducts, deleteAllProducts, deleteProduct, createProduct, updateProduct } from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialProductState = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Gifts',
    stock: 10,
    customizable: false,
    productType: 'single', // 'single' | 'variable'
    imageFiles: [], 
    existingImages: [],
    variants: [] 
  };

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [previews, setPreviews] = useState([]);

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

  const handleMainFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewProduct({ ...newProduct, imageFiles: files });
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const handleVariantFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedVariants = [...newProduct.variants];
      updatedVariants[index].imageFile = file;
      updatedVariants[index].imagePreview = URL.createObjectURL(file);
      setNewProduct({ ...newProduct, variants: updatedVariants });
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

  const handleEdit = (product) => {
    setIsEditing(true);
    setEditingProductId(product.id);
    const hasVariants = product.product_variants && product.product_variants.length > 0;
    
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || '',
      category: product.category,
      stock: product.stock,
      customizable: product.customizable || false,
      productType: hasVariants ? 'variable' : 'single',
      imageFiles: [],
      existingImages: product.images || [],
      variants: hasVariants ? product.product_variants.map(v => ({
        ...v, 
        variantName: v.variant_name, 
        discountPercentage: v.discount_percentage,
        imagePreview: v.image
      })) : []
    });
    setPreviews(product.images || []);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error('Please fill required fields (Name, Price)');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('price', parseFloat(newProduct.price));
      if(newProduct.originalPrice) formData.append('originalPrice', parseFloat(newProduct.originalPrice)); 
      formData.append('category', newProduct.category);
      formData.append('stock', parseInt(newProduct.stock));
      formData.append('customizable', newProduct.customizable);
      
      // Main Images
      if (newProduct.imageFiles.length > 0) {
        newProduct.imageFiles.forEach(file => formData.append('images', file));
      } else if (newProduct.existingImages.length > 0) {
        newProduct.existingImages.forEach(url => formData.append('images', url));
      }

      // Variants
      if (newProduct.productType === 'variable' && newProduct.variants.length > 0) {
        // Exclude imageFile object from JSON string
        const cleanVariants = newProduct.variants.map(v => {
          const { imageFile, imagePreview, ...rest } = v;
          return rest;
        });
        formData.append('variants', JSON.stringify(cleanVariants));
        
        // Append variant image files
        newProduct.variants.forEach((v, index) => {
          if (v.imageFile) {
            formData.append(`variantImage_${index}`, v.imageFile);
          }
        });
      }

      if (isEditing) {
        await updateProduct(editingProductId, formData);
        toast.success('Product updated successfully!');
      } else {
        await createProduct(formData);
        toast.success('Product created successfully!');
      }

      closeModal();
      fetchProducts();
    } catch (err) {
      toast.error('Operation failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingProductId(null);
    setNewProduct(initialProductState);
    setPreviews([]);
  };

  const handleAddVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [...newProduct.variants, { variantName: '', price: newProduct.price || '', discountPercentage: 0, stock: 10, imageFile: null, imagePreview: null }]
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
              <th>Base Price</th>
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
                      {product.product_variants?.length > 0 && <span className={styles.variantBadge}>{product.product_variants.length} Variants</span>}
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
                    <button type="button" className={styles.iconBtn} title="View" onClick={() => window.open(`http://localhost:5173/products/${product.id}`, '_blank')}><FiEye /></button>
                    <button type="button" className={styles.iconBtn} title="Edit" onClick={() => handleEdit(product)}><FiEdit2 /></button>
                    <button type="button" className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete" onClick={() => handleDelete(product.id)}>
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

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalBody}>
              
              {/* Product Type Selection */}
              <div className={styles.typeSelector}>
                <label className={newProduct.productType === 'single' ? styles.typeActive : ''}>
                  <input type="radio" name="productType" value="single" checked={newProduct.productType === 'single'} onChange={() => setNewProduct({...newProduct, productType: 'single'})} />
                  Single Product
                </label>
                <label className={newProduct.productType === 'variable' ? styles.typeActive : ''}>
                  <input type="radio" name="productType" value="variable" checked={newProduct.productType === 'variable'} onChange={() => setNewProduct({...newProduct, productType: 'variable'})} />
                  Multiple Variants
                </label>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input type="text" className="input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Magic Mug" />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <input type="text" className="input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} placeholder="e.g. Birthday, Home Decor" required />
                </div>
                <div className={styles.formGroup}>
                  <label>Base Price (₹)</label>
                  <input type="number" className="input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Original Price (₹ Optional)</label>
                  <input type="number" className="input" value={newProduct.originalPrice} onChange={e => setNewProduct({...newProduct, originalPrice: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Overall Stock</label>
                  <input type="number" className="input" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Customizable?</label>
                  <div className={styles.checkboxWrapper}>
                    <input type="checkbox" id="customizable" checked={newProduct.customizable} onChange={e => setNewProduct({...newProduct, customizable: e.target.checked})} />
                    <label htmlFor="customizable">Allow user texts/photos</label>
                  </div>
                </div>
              </div>

              {/* Main Images */}
              <div className={styles.formGroup} style={{ marginTop: 20 }}>
                <label>Main Product Images (Multiple allowed)</label>
                <input type="file" accept="image/*" multiple className="input" onChange={handleMainFileChange} />
                {previews.length > 0 && (
                  <div className={styles.previewGrid}>
                    {previews.map((src, i) => (
                      <img key={i} src={src} alt={`Preview ${i}`} className={styles.previewImg} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup} style={{ marginTop: 16 }}>
                <label>Description</label>
                <textarea className="input" rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>

              {/* Variants Section */}
              {newProduct.productType === 'variable' && (
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
                        <div key={index} className={styles.variantCard}>
                          {/* Variant Image Upload */}
                          <div className={styles.variantImgUpload}>
                            <label className={styles.vImgLabel}>
                              {variant.imagePreview ? (
                                <img src={variant.imagePreview} alt="Variant" className={styles.vImgPreview}/>
                              ) : (
                                <div className={styles.vImgPlaceholder}><FiImage size={24}/><br/>Upload</div>
                              )}
                              <input type="file" accept="image/*" hidden onChange={(e) => handleVariantFileChange(index, e)} />
                            </label>
                          </div>

                          {/* Variant Data */}
                          <div className={styles.variantFields}>
                            <div className={styles.miniField}>
                              <label>Variant Name / Color / Size</label>
                              <input 
                                type="text" 
                                className="input-sm" 
                                placeholder="e.g. Red, XL, 500g" 
                                value={variant.variantName} 
                                onChange={e => handleUpdateVariant(index, 'variantName', e.target.value)}
                                required
                              />
                            </div>
                            <div className={styles.miniFieldRow}>
                              <div className={styles.miniField}>
                                <label>Price (₹)</label>
                                <input 
                                  type="number" 
                                  className="input-sm" 
                                  value={variant.price} 
                                  onChange={e => handleUpdateVariant(index, 'price', e.target.value)}
                                  required
                                />
                              </div>
                              <div className={styles.miniField}>
                                <label>Stock</label>
                                <input 
                                  type="number" 
                                  className="input-sm" 
                                  value={variant.stock} 
                                  onChange={e => handleUpdateVariant(index, 'stock', e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                          <button type="button" className={styles.removeVariantBtn} onClick={() => handleRemoveVariant(index)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.noVariants}>Click "Add Variant" to create product options.</p>
                  )}
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : isEditing ? 'Update Product' : 'Save Product'}
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
