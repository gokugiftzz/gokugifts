import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiSearch, FiMenu, FiX, FiChevronDown, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProducts } from '../../utils/api';
import styles from './Navbar.module.css';

const NAV_CATEGORIES = [
  { name: 'Personalized', param: { customizable: 'true' }, link: '/products?customizable=true' },
  { name: 'Birthday',     param: { occasion: 'birthday' }, link: '/products?occasion=birthday' },
  { name: 'Anniversary',  param: { occasion: 'anniversary' }, link: '/products?occasion=anniversary' },
  { name: 'Jewelry',      param: { category: 'Jewelry' }, link: '/products?category=Jewelry' },
  { name: 'Hampers',      param: { category: 'Hampers' }, link: '/products?category=Hampers' },
  { name: 'Art',          param: { category: 'Art' }, link: '/products?category=Art' },
];

/* Individual category dropdown */
const CategoryDropdown = ({ cat }) => {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    if (loaded) return;
    try {
      const res = await getProducts({ ...cat.param, limit: 4 });
      setProducts(res.data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoaded(true);
    }
  };

  return (
    <div className={styles.catDropdown} onMouseEnter={load}>
      <button className={styles.catBtn}>
        {cat.name} <FiChevronDown className={styles.chevron} />
      </button>
      <div className={styles.catPanel}>
        <div className={styles.catPanelHeader}>
          <span className={styles.catPanelTitle}>{cat.name} Gifts</span>
          <Link to={cat.link} className={styles.viewAll}>View All →</Link>
        </div>
        {!loaded ? (
          <p className={styles.panelMsg}>Loading...</p>
        ) : products.length === 0 ? (
          <div className={styles.emptyPanel}>
            <FiPackage size={28} />
            <p>New arrivals coming soon!</p>
            <Link to={cat.link} className={styles.browseCta}>Browse All Gifts</Link>
          </div>
        ) : (
          <div className={styles.panelGrid}>
            {products.map(p => (
              <Link to={`/products/${p.id}`} key={p.id} className={styles.panelCard}>
                <div
                  className={styles.panelImg}
                  style={{ backgroundImage: `url(${p.images?.[0] || ''})` }}
                />
                <div className={styles.panelInfo}>
                  <span className={styles.panelName}>{p.name}</span>
                  <span className={styles.panelPrice}>₹{p.price}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(null);
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

        {/* Desktop Nav — each category with its dropdown */}
        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>Home</Link>
          <Link to="/products" className={styles.navLink}>All</Link>
          {NAV_CATEGORIES.map(cat => (
            <CategoryDropdown key={cat.name} cat={cat} />
          ))}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.iconBtn} onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
            <FiSearch />
          </button>

          {user && (
            <Link to="/wishlist" className={styles.iconBtn} aria-label="Wishlist">
              <FiHeart />
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
          )}

          <Link to="/cart" className={styles.iconBtn} aria-label="Cart">
            <FiShoppingCart />
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
          </Link>

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
                  {user.role === 'admin' && <a href="http://localhost:5174/" className={styles.dropdownItem}>Admin Panel</a>}
                  <hr className={styles.dropdownDivider} />
                  <button className={styles.dropdownItem} onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className={`${styles.loginBtn} btn btn-primary`}>Login</Link>
          )}

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
          <Link to="/products" className={styles.mobileLink}>🛍️ All Products</Link>
          <div className={styles.mobileDivider}>Categories</div>
          {NAV_CATEGORIES.map(cat => (
            <div key={cat.name}>
              <button
                className={styles.mobileCatBtn}
                onClick={() => setMobileCatOpen(mobileCatOpen === cat.name ? null : cat.name)}
              >
                {cat.name}
                <FiChevronDown className={mobileCatOpen === cat.name ? styles.chevronOpen : styles.chevron} />
              </button>
              {mobileCatOpen === cat.name && (
                <Link to={cat.link} className={styles.mobileCatLink}>
                  Browse all {cat.name} Gifts →
                </Link>
              )}
            </div>
          ))}
          {user ? (
            <>
              <div className={styles.mobileDivider}>Account</div>
              <Link to="/profile" className={styles.mobileLink}>My Profile</Link>
              <Link to="/wishlist" className={styles.mobileLink}>Wishlist</Link>
              {user.role === 'admin' && <a href="http://localhost:5174/" className={styles.mobileLink}>Admin Panel</a>}
              <button className={`${styles.mobileLink} ${styles.logoutBtn}`} onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <div className={styles.mobileDivider}>Account</div>
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
