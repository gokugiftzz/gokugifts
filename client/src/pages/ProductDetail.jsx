import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiStar, FiShoppingCart, FiHeart, FiShare2, FiZap, FiPackage, FiEdit3, FiCheck, FiPlus, FiMinus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProduct, getReviews } from '../utils/api';

import toast from 'react-hot-toast';
import styles from './ProductDetail.module.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [sameDayDelivery, setSameDayDelivery] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [customText, setCustomText] = useState('');
  const [customImage, setCustomImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const fileRef = useRef();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await getProduct(id);
        setProduct(res.data.product);
        const rev = await getReviews(id);
        setReviews(rev.data.reviews || []);
      } catch {
        // Stop silently ignoring errors and let product remain null
        setProduct(null);
        setReviews([]);
      } finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this amazing gift: ${product?.name} on GokuGiftz! 🎁`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleAddToCart = () => {
    const customization = product?.customizable && (customText || customImage)
      ? { text: customText, image: customImage }
      : null;
    for (let i = 0; i < quantity; i++) addToCart(product, 1, customization);
    toast.success(`Added ${quantity}x ${product.name} to cart!`);
  };

  if (loading) return (
    <div style={{ paddingTop: 80 }}>
      <div className="container" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎁</div>
        <p>Loading product...</p>
      </div>
    </div>
  );

  if (!product) return (
    <div style={{ paddingTop: 80 }}>
      <div className="empty-state container">
        <span className="icon">😢</span>
        <h3>Product not found</h3>
        <Link to="/products" className="btn btn-primary">Browse All Gifts</Link>
      </div>
    </div>
  );

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className={styles.layout}>
          {/* Left: Images */}
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <img
                src={product.images?.[selectedImage] || product.images?.[0]}
                alt={product.name}
              />
              {discount > 0 && <span className={styles.discountLabel}>-{discount}%</span>}
              {product.same_day_delivery && <span className={styles.deliveryLabel}><FiZap /> Same Day</span>}
            </div>
            {product.images?.length > 1 && (
              <div className={styles.thumbnails}>
                {product.images.map((img, i) => (
                  <button key={i} className={`${styles.thumb} ${i === selectedImage ? styles.thumbActive : ''}`} onClick={() => setSelectedImage(i)}>
                    <img src={img} alt={`View ${i+1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className={styles.details}>
            <div className={styles.category}>{product.category}</div>
            <h1 className={styles.name}>{product.name}</h1>

            {/* Rating */}
            <div className={styles.ratingRow}>
              <div className={styles.stars}>
                {[1,2,3,4,5].map(s => (
                  <FiStar key={s} style={{ fill: s <= Math.round(product.rating) ? '#ffd166' : 'none', color: '#ffd166' }} />
                ))}
              </div>
              <span className={styles.ratingValue}>{product.rating}</span>
              <span className={styles.reviewCount}>({reviews.length} reviews)</span>
            </div>

            {/* Price */}
            <div className={styles.priceSection}>
              <span className={styles.price}>₹{product.price?.toLocaleString()}</span>
              {product.original_price && (
                <span className={styles.originalPrice}>₹{product.original_price?.toLocaleString()}</span>
              )}
              {discount > 0 && <span className={styles.discountPct}>{discount}% OFF</span>}
            </div>

            {/* Features */}
            {product.features && (
              <div className={styles.features}>
                {product.features.map(f => (
                  <div key={f} className={styles.feature}><FiCheck className={styles.checkIcon} />{f}</div>
                ))}
              </div>
            )}

            {/* Customization - Live Preview */}
            {product.customizable && (
              <div className={styles.customSection}>
                <h3 className={styles.customTitle}><FiEdit3 /> Personalize This Gift</h3>
                <div className={styles.customPreview}>
                  <div className={styles.previewCanvas}>
                    <img
                      src={product.images?.[0]}
                      alt="Preview"
                      className={styles.previewBase}
                    />
                    {customText && <div className={styles.previewText}>{customText}</div>}
                    {customImage && <img src={customImage} alt="Custom" className={styles.previewCustomImg} />}
                    <div className={styles.previewBadge}>Live Preview</div>
                  </div>
                </div>
                <div className={styles.customFields}>
                  <div>
                    <label className={styles.fieldLabel}>Add Custom Text</label>
                    <input
                      type="text"
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      placeholder="E.g. 'Happy Birthday Mom!'"
                      className="input"
                      maxLength={50}
                    />
                    <small className={styles.charCount}>{customText.length}/50</small>
                  </div>
                  <div>
                    <label className={styles.fieldLabel}>Upload Your Photo</label>
                    <button className={`btn btn-ghost ${styles.uploadBtn}`} onClick={() => fileRef.current?.click()}>
                      📷 Choose Photo
                    </button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setCustomImage(ev.target.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    {customImage && <small style={{ color: '#06d6a0', marginLeft: 8 }}>✓ Photo added</small>}
                  </div>
                </div>
              </div>
            )}

            {/* Same Day Delivery */}
            {product.same_day_delivery && (
              <div className={styles.sameDaySection}>
                <label className={styles.sameDayLabel}>
                  <input
                    type="checkbox"
                    checked={sameDayDelivery}
                    onChange={e => setSameDayDelivery(e.target.checked)}
                    style={{ accentColor: '#06d6a0' }}
                  />
                  <div>
                    <span className={styles.sameDayTitle}><FiZap /> Same Day Delivery</span>
                    <span className={styles.sameDayInfo}>(+₹150) Delivered by tonight!</span>
                  </div>
                </label>
              </div>
            )}

            {/* Quantity */}
            <div className={styles.quantitySection}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.qtyLabel}>Quantity</span>
                {product.stock <= 5 && product.stock > 0 && (
                  <span style={{ color: '#ff6b6b', fontSize: '0.8rem', fontWeight: 600 }}>🔥 Only {product.stock} left!</span>
                )}
                {product.stock <= 0 && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', fontWeight: 600 }}>🚫 Out of Stock</span>
                )}
              </div>
              <div className={styles.qtyControls}>
                <button 
                  className={styles.qtyBtn} 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={product.stock <= 0}
                >
                  <FiMinus />
                </button>
                <span className={styles.qtyValue}>{product.stock <= 0 ? 0 : quantity}</span>
                <button 
                  className={styles.qtyBtn} 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock || product.stock <= 0}
                >
                  <FiPlus />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className={styles.ctaButtons}>
              <button className={`btn btn-primary ${styles.addBtn}`} onClick={handleAddToCart}>
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                className={`${styles.wishBtn} ${isWishlisted(product.id) ? styles.wishlisted : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label="Wishlist"
              >
                <FiHeart />
              </button>
              <button className={styles.shareBtn} onClick={handleShare} aria-label="Share">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </button>
            </div>

            {/* Trust Signals */}
            <div className={styles.trustRow}>
              <span>🔒 Secure checkout</span>
              <span>🚚 Free delivery ₹999+</span>
              <span>↩️ Easy returns</span>
            </div>
          </div>
        </div>

        {/* Tabs: Description / Reviews */}
        <div className={styles.tabs}>
          <div className={styles.tabList}>
            {['description', 'features', 'reviews'].map(tab => (
              <button
                key={tab}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'reviews' && ` (${reviews.length})`}
              </button>
            ))}
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'description' && (
              <div className={styles.description}>
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'features' && (
              <div className={styles.featureList}>
                {product.features?.map(f => (
                  <div key={f} className={styles.featureItem}><FiCheck className={styles.checkIcon} />{f}</div>
                ))}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className={styles.reviews}>
                {reviews.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.4)' }}>No reviews yet. Be the first to review!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div>
                          <strong>{review.user?.name || 'Anonymous'}</strong>
                          <div className={styles.reviewStars}>{'⭐'.repeat(review.rating)}</div>
                        </div>
                        <span className={styles.reviewDate}>{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className={styles.reviewText}>{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
