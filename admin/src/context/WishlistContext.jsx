import React, { createContext, useContext, useState, useEffect } from 'react';
import { getWishlist, addToWishlist, removeFromWishlist } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      getWishlist()
        .then(res => setWishlist(res.data.wishlist || []))
        .catch(() => setWishlist([]));
    } else {
      setWishlist([]);
    }
  }, [user]);

  const toggleWishlist = async (product) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return;
    }
    const isWishlisted = wishlist.some(item => item.product_id === product.id);
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        setWishlist(prev => prev.filter(item => item.product_id !== product.id));
        toast.success('Removed from wishlist');
      } else {
        const res = await addToWishlist(product.id);
        setWishlist(prev => [...prev, { ...res.data.item, product }]);
        toast.success('Added to wishlist ❤️');
      }
    } catch (err) {
      // Offline/demo mode - toggle locally
      if (isWishlisted) {
        setWishlist(prev => prev.filter(item => item.product_id !== product.id));
        toast.success('Removed from wishlist');
      } else {
        setWishlist(prev => [...prev, { id: product.id, product_id: product.id, product }]);
        toast.success('Added to wishlist ❤️');
      }
    }
  };

  const isWishlisted = (productId) => wishlist.some(item => item.product_id === productId);
  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, wishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
