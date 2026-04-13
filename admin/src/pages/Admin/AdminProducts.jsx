import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiEye, FiDownload, FiSearch, FiAlertTriangle, FiX, FiImage, FiSettings } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import styles from './AdminProducts.module.css';
import { getProducts, deleteAllProducts, deleteProduct, createProduct, updateProduct } from '../../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [inventoryPool, setInventoryPool] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialProductState = {
    product_code: '',
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Frames',
    stock: 10,
    customizable: false,
    productType: 'single', // 'single' | 'variable'
    gift_type: 'Standard', // Standard | Combo | Personalized
    features: [''], // Array of features
    details: '', // Detailed technical description
    personalization_options: {
      namePrint: false,
      photoUpload: false,
      customMessage: false
    },
    imageFiles: [], 
    existingImages: [],
    variants: [] 
  };

  const [newProduct, setNewProduct] = useState(initialProductState);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    fetchProducts();
    fetchInventory();
  }, []);

  useEffect(() => {
    if(showModal) fetchInventory();
  }, [showModal]);

  const fetchInventory = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      setInventoryPool(data.inventory.filter(i => !i.is_used || i.product_code === newProduct.product_code));
    } catch (error) {}
  };

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
    
    // Process existing images to stringify for API but keep structure if objects
    const existingImagesList = product.images || [];
    const previewUrls = existingImagesList.map(img => typeof img === 'object' ? img.url : img);

    setNewProduct({
      product_code: product.product_code || '',
      name: product.name,
      description: product.description || '',
      price: product.price,
      originalPrice: product.original_price || '',
      category: product.category,
      stock: product.stock,
      customizable: product.customizable || false,
      productType: hasVariants ? 'variable' : 'single',
      gift_type: product.gift_type || 'Standard',
      features: product.features || [''],
      details: product.details || '',
      personalization_options: product.personalization_options || { namePrint: false, photoUpload: false, customMessage: false },
      imageFiles: [],
      existingImages: existingImagesList,
      variants: hasVariants ? product.product_variants.map(v => ({
         ...v, 
         variantName: v.variant_name, 
         discountPercentage: v.discount_percentage,
         imagePreview: v.image,
         description: v.description || '',
         features: v.features || ''
      })) : []
    });
    setPreviews(previewUrls);
    setShowModal(true);
  };

  const generateProductCode = () => {
    setNewProduct({
      ...newProduct,
      product_code: 'GFT-' + Math.floor(1000 + Math.random() * 9000)
    });
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
      if (newProduct.product_code) formData.append('product_code', newProduct.product_code);
      formData.append('gift_type', newProduct.gift_type);
      formData.append('personalization_options', JSON.stringify(newProduct.personalization_options));
      formData.append('name', newProduct.name);
      formData.append('description', newProduct.description);
      formData.append('details', newProduct.details);
      formData.append('features', JSON.stringify(newProduct.features.filter(f => f.trim() !== '')));
      formData.append('price', parseFloat(newProduct.price));
      if(newProduct.originalPrice) formData.append('originalPrice', parseFloat(newProduct.originalPrice)); 
      formData.append('category', newProduct.category);
      formData.append('stock', parseInt(newProduct.stock));
      formData.append('customizable', newProduct.customizable);
      
      // Main Images
      if (newProduct.imageFiles.length > 0) {
        newProduct.imageFiles.forEach(file => formData.append('images', file));
      } else if (newProduct.existingImages.length > 0) {
        newProduct.existingImages.forEach(img => {
          // If the image is a structured object, stringify it so backend can parse
          formData.append('images', typeof img === 'object' ? JSON.stringify(img) : img);
        });
      }

      // Variants
      if (newProduct.productType === 'variable' && newProduct.variants.length > 0) {
        const cleanVariants = newProduct.variants.map(v => {
          const { imageFile, imagePreview, ...rest } = v;
          return rest;
        });
        formData.append('variants', JSON.stringify(cleanVariants));
        
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
      variants: [...newProduct.variants, { 
        variantName: '', 
        sku: `SKU-${Date.now().toString().slice(-6)}-${newProduct.variants.length + 1}`,
        price: newProduct.price || '', 
        discountPercentage: 0, 
        stock: 10, 
        description: '', 
        features: '', 
        imageFile: null, 
        imagePreview: null 
      }]
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

  // Helper to extract first image URL gracefully
  const getProductImageUrl = (product) => {
    if (!product.images || product.images.length === 0) return 'https://via.placeholder.com/100?text=🎁';
    const firstImg = product.images[0];
    return typeof firstImg === 'object' ? firstImg.url : firstImg;
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
          <button className="btn btn-primary" onClick={() => {
            setNewProduct({...initialProductState, product_code: 'GFT-' + Math.floor(1000 + Math.random() * 9000)});
            setShowModal(true);
          }}>
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
                    <img src={getProductImageUrl(product)} alt="" className={styles.productImg} />
                    <div className={styles.productInfo}>
                      <strong>{product.name}</strong>
                      <span title={product.id}>SKU: {product.product_code || 'N/A'} • {product.gift_type || 'Standard'}</span>
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
                {/* Product Code */}
                <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                  <label>Product Code (Select from 999 IDs Pool)</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <select 
                      className="input" 
                      style={{ flex: 1 }}
                      value={inventoryPool.some(i => i.product_code === newProduct.product_code) ? newProduct.product_code : ''}
                      onChange={e => {
                        if(e.target.value) {
                          setNewProduct({...newProduct, product_code: e.target.value});
                        }
                      }}
                    >
                      <option value="">-- Choose from available IDs --</option>
                      {inventoryPool.map(item => (
                        <option key={item.id} value={item.product_code}>{item.product_code} (Available)</option>
                      ))}
                      {newProduct.product_code && !inventoryPool.find(i => i.product_code === newProduct.product_code) && (
                         <option value={newProduct.product_code}>{newProduct.product_code} (Current)</option>
                      )}
                    </select>
                    <input 
                      type="text" 
                      className="input" 
                      placeholder="Or enter manual ID" 
                      style={{ width: '180px' }}
                      value={newProduct.product_code} 
                      onChange={e => setNewProduct({...newProduct, product_code: e.target.value})} 
                    />
                  </div>
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Every product must have a unique ID for easy tracking in the inventory.</small>
                </div>

                <div className={styles.formGroup}>
                  <label>Product Name</label>
                  <input type="text" className="input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Magic Mug" />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select className="input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required>
                    <option value="Frames">Frames</option>
                    <option value="Polaroids">Polaroids</option>
                    <option value="Hair Accessories">Hair Accessories</option>
                    <option value="Hampers">Hampers</option>
                    <option value="Toys">Toys</option>
                    <option value="Anti-Tarnish Jewels">Anti-Tarnish Jewels</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Gift Type</label>
                  <select className="input" value={newProduct.gift_type} onChange={e => setNewProduct({...newProduct, gift_type: e.target.value})} required>
                    <option value="Standard">Standard</option>
                    <option value="Combo">Combo</option>
                    <option value="Personalized">Personalized</option>
                  </select>
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
              </div>

              {/* Features List */}
              <div className={styles.formGroup} style={{ marginTop: 20 }}>
                <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  Product Features (Bullet Points)
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setNewProduct({...newProduct, features: [...newProduct.features, '']})}>
                    + Add Bullet
                  </button>
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                  {newProduct.features.map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" className="input" placeholder="e.g. 100% Cotton, Hand-made"
                        value={feat} onChange={e => {
                          const f = [...newProduct.features];
                          f[idx] = e.target.value;
                          setNewProduct({...newProduct, features: f});
                        }} 
                      />
                      <button type="button" className={styles.deleteBtn} onClick={() => {
                        const f = newProduct.features.filter((_, i) => i !== idx);
                        setNewProduct({...newProduct, features: f.length > 0 ? f : ['']});
                      }}><FiTrash2 /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personalization Options */}
              <div className={styles.formGroup} style={{ marginTop: 20, padding: 15, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <label style={{ fontSize: '1rem', color: '#0f172a', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiSettings /> Personalization Settings
                </label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <label className={styles.checkboxWrapper} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newProduct.personalization_options?.namePrint || false} 
                      onChange={e => setNewProduct({...newProduct, personalization_options: {...newProduct.personalization_options, namePrint: e.target.checked}})} 
                    />
                    <span>Name Print</span>
                  </label>
                  <label className={styles.checkboxWrapper} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newProduct.personalization_options?.photoUpload || false} 
                      onChange={e => setNewProduct({...newProduct, personalization_options: {...newProduct.personalization_options, photoUpload: e.target.checked}})} 
                    />
                    <span>Photo Upload</span>
                  </label>
                  <label className={styles.checkboxWrapper} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={newProduct.personalization_options?.customMessage || false} 
                      onChange={e => setNewProduct({...newProduct, personalization_options: {...newProduct.personalization_options, customMessage: e.target.checked}})} 
                    />
                    <span>Custom Message</span>
                  </label>
                </div>
              </div>

              {/* Main Images */}
              <div className={styles.formGroup} style={{ marginTop: 20 }}>
                <label>Main Product Images (Multiple allowed)</label>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0 0 10px 0' }}>Images will automatically be assigned unique IDs upon upload (e.g. IMG-5001).</p>
                <input type="file" accept="image/*" multiple className="input" onChange={handleMainFileChange} />
                {previews.length > 0 && (
                  <div className={styles.previewGrid}>
                    {previews.map((src, i) => {
                      const imgObj = newProduct.existingImages[i];
                      const imgId = typeof imgObj === 'object' && imgObj?.imgId ? imgObj.imgId : null;
                      return (
                      <div key={i} style={{position: 'relative'}}>
                        <img src={src} alt={`Preview ${i}`} className={styles.previewImg} style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px'}} />
                        {imgId && <span style={{position:'absolute', bottom: 5, left: 5, background: 'rgba(0,0,0,0.7)', color:'white', fontSize:'0.7rem', padding:'2px 6px', borderRadius: 4}}>{imgId}</span>}
                      </div>
                    )})}
                  </div>
                )}
              </div>
              
              <div className={styles.formGroup} style={{ marginTop: 16 }}>
                <label>Short Description (SEO / List View)</label>
                <textarea className="input" rows="2" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>

              <div className={styles.formGroup} style={{ marginTop: 16 }}>
                <label>Full Product Details (Complete Page Description)</label>
                <textarea className="input" rows="6" value={newProduct.details} onChange={e => setNewProduct({...newProduct, details: e.target.value})} placeholder="Write detailed story or technical specifications..."></textarea>
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
                              <label>Variant Name</label>
                              <input 
                                type="text" 
                                className="input-sm" 
                                placeholder="e.g. Red / Large" 
                                value={variant.variantName} 
                                onChange={e => handleUpdateVariant(index, 'variantName', e.target.value)}
                                required
                              />
                            </div>
                            <div className={styles.miniField}>
                              <label>SKU / Variant ID</label>
                              <div style={{ display: 'flex', gap: 4 }}>
                                <input 
                                  type="text" className="input-sm" 
                                  value={variant.sku} 
                                  onChange={e => handleUpdateVariant(index, 'sku', e.target.value)}
                                />
                                <button type="button" className="btn btn-ghost btn-sm" onClick={() => handleUpdateVariant(index, 'sku', `VAR-${Math.floor(1000+Math.random()*9000)}`)} style={{fontSize:'0.6rem', padding:'2px 5px'}}>Auto</button>
                              </div>
                            </div>
                            <div className={styles.miniFieldRow}>
                              <div className={styles.miniField}>
                                <label>Price (₹)</label>
                                <input type="number" className="input-sm" value={variant.price} onChange={e => handleUpdateVariant(index, 'price', e.target.value)} required />
                              </div>
                              <div className={styles.miniField}>
                                <label>Stock</label>
                                <input type="number" className="input-sm" value={variant.stock} onChange={e => handleUpdateVariant(index, 'stock', e.target.value)} required />
                              </div>
                            </div>
                            <div className={styles.miniField} style={{ marginTop: '5px' }}>
                              <label>Description</label>
                              <textarea 
                                className="input-sm" rows="2" placeholder="Variant specific details..."
                                value={variant.description} 
                                onChange={e => handleUpdateVariant(index, 'description', e.target.value)}
                              />
                            </div>
                            <div className={styles.miniField} style={{ marginTop: '5px' }}>
                              <label>Features (comma separated)</label>
                              <input 
                                type="text" className="input-sm" placeholder="Fast shipping, etc."
                                value={variant.features} 
                                onChange={e => handleUpdateVariant(index, 'features', e.target.value)}
                              />
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
