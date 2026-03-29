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
    // Generate a unique ID if customizing, else use product ID
    const cartId = customization ? `${product.id}-${Date.now()}` : product.id;
    
    setCart(prev => {
      const existing = prev.find(item => item.cartId === product.id && !customization);
      
      if (existing) {
        return prev.map(item =>
          item.cartId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prev, {
        cartId,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        quantity,
        customization
      }];
    });

    toast.success(`${product.name} added to cart! 🎁`);
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

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartTotal, cartCount
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
