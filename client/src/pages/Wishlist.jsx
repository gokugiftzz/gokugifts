import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard/ProductCard';
import styles from './Wishlist.module.css';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className="empty-state">
            <FiHeart size={64} color="var(--primary)" />
            <h2>Your wishlist is empty</h2>
            <p>Save items you love to your wishlist and they'll appear here.</p>
            <Link to="/products" className="btn btn-primary">Discover Gifts <FiArrowRight /></Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>My Wishlist <span>({wishlist.length} Items)</span></h1>
          <p>The gifts you've hearted so far.</p>
        </div>

        <div className="products-grid">
          {wishlist.map((product, i) => (
            <div key={product.id} className={styles.wishWrapper}>
              <ProductCard product={product} index={i} />
              <div className={styles.wishActions}>
                <button 
                  className={`btn btn-primary ${styles.addBtn}`}
                  onClick={() => addToCart(product)}
                >
                  <FiShoppingCart /> Add to Cart
                </button>
                <button 
                  className={styles.removeBtn}
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <FiTrash2 /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
