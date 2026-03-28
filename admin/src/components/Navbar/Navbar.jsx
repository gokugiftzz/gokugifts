import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiUser, FiSearch, FiMenu, FiX, FiBell } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={styles.container}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <img src="/logo.png" alt="GokuGiftz" className={styles.logoImg} />
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          <Link to="/products" className={styles.navLink}>Shop</Link>
          <Link to="/products?occasion=birthday" className={styles.navLink}>Birthday</Link>
          <Link to="/products?occasion=anniversary" className={styles.navLink}>Anniversary</Link>
          <Link to="/products?customizable=true" className={styles.navLink}>Customize</Link>
          <Link to="/ai-finder" className={`${styles.navLink} ${styles.aiLink}`}>
            <MdAutoAwesome /> AI Finder
          </Link>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Search */}
          <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <FiSearch />
          </button>

          {/* Wishlist */}
          {user && (
            <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <FiHeart />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <FiShoppingCart />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

          {/* User */}
          {user ? (
            <div className={styles.userMenu}>
              <button className={styles.userBtn} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} className={styles.avatar} />
                  : <span className={styles.avatarPlaceholder}>{user.name?.[0]?.toUpperCase()}</span>
                }
              </button>
              {userMenuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <Link to="/profile" className={styles.dropdownItem}>My Profile</Link>
                  <Link to="/orders" className={styles.dropdownItem}>My Orders</Link>
                  <Link to="/wishlist" className={styles.dropdownItem}>Wishlist</Link>
                  {user.role === 'admin' && <Link to="/admin" className={styles.dropdownItem}>Admin Panel</Link>}
                  <hr className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`${styles.loginBtn} btn btn-primary`}>Login</Link>
          )}

          {/* Mobile Menu Toggle */}
          <button className={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {searchOpen && (
        <div className={styles.searchBar}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search for gifts, occasions, recipients..."
              className={styles.searchInput}
              autoFocus
            />
            <button type="submit" className={`btn btn-primary ${styles.searchBtn}`}>Search</button>
            <button type="button" className={styles.searchClose} onClick={() => setSearchOpen(false)}>
              <FiX />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/products" className={styles.mobileLink}>Shop All</Link>
          <Link to="/products?occasion=birthday" className={styles.mobileLink}>Birthday Gifts</Link>
          <Link to="/products?occasion=anniversary" className={styles.mobileLink}>Anniversary Gifts</Link>
          <Link to="/products?customizable=true" className={styles.mobileLink}>Customize</Link>
          <Link to="/ai-finder" className={styles.mobileLink}>🤖 AI Gift Finder</Link>
          {user ? (
            <>
              <Link to="/profile" className={styles.mobileLink}>My Profile</Link>
              <Link to="/wishlist" className={styles.mobileLink}>Wishlist</Link>
              {user.role === 'admin' && <Link to="/admin" className={styles.mobileLink}>Admin Panel</Link>}
              <button className={`${styles.mobileLink} ${styles.logoutBtn}`} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className={styles.mobileLink}>Login</Link>
              <Link to="/register" className={styles.mobileLink}>Create Account</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
