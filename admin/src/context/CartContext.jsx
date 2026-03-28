import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gokugiftz_cart')) || [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('gokugiftz_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1, customization = null) => {
    setCart(prev => {
      const key = customization ? `${product.id}-custom-${Date.now()}` : product.id;
      const existing = prev.find(item => item.cartId === (customization ? null : product.id));
      if (existing && !customization) {
        toast.success('Quantity updated!');
        return prev.map(item =>
          item.cartId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      toast.success(`${product.name} added to cart! 🎁`);
      return [...prev, {
        cartId: customization ? `${product.id}-${Date.now()}` : product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        quantity,
        customization,
        sameDayDelivery: false
      }];
    });
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) { removeFromCart(cartId); return; }
    setCart(prev => prev.map(item => item.cartId === cartId ? { ...item, quantity } : item));
  };

  const clearCart = () => setCart([]);

  const toggleSameDay = (cartId) => {
    setCart(prev => prev.map(item =>
      item.cartId === cartId ? { ...item, sameDayDelivery: !item.sameDayDelivery } : item
    ));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const hasSameDay = cart.some(item => item.sameDayDelivery);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, toggleSameDay,
      cartTotal, cartCount, hasSameDay
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
