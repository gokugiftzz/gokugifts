import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX, FiChevronDown, FiSliders } from 'react-icons/fi';
import ProductCard from '../components/ProductCard/ProductCard';
import { getProducts } from '../utils/api';
import { OCCASIONS, CATEGORIES, RELATIONSHIPS } from '../utils/mockData';
import styles from './Products.module.css';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 - ₹1000', min: 500, max: 1000 },
  { label: '₹1000 - ₹2000', min: 1000, max: 2000 },
  { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
  { label: 'Above ₹5000', min: 5000, max: 99999 }
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    occasion: searchParams.get('occasion') || '',
    relationship: searchParams.get('relationship') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sort: 'newest',
    customizable: searchParams.get('customizable') || ''
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [filters, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts({ ...filters, page });
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', category: '', occasion: '', relationship: '', minPrice: '', maxPrice: '', sort: 'newest', customizable: '' });
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => v && k !== 'sort').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>
                {filters.occasion ? `${filters.occasion.charAt(0).toUpperCase() + filters.occasion.slice(1)} Gifts` :
                 filters.category ? filters.category :
                 filters.search ? `Results for "${filters.search}"` : 'All Gifts'}
              </h1>
              <p className={styles.subtitle}>{total} products found</p>
            </div>
            <div className={styles.controls}>
              <button className={`${styles.filterToggle} btn btn-ghost`} onClick={() => setFiltersOpen(!filtersOpen)}>
                <FiSliders />
                Filters
                {activeFilterCount > 0 && <span className={styles.filterCount}>{activeFilterCount}</span>}
              </button>
              <select
                value={filters.sort}
                onChange={e => updateFilter('sort', e.target.value)}
                className={`input ${styles.sortSelect}`}
              >
                <option value="newest">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Best Rated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.layout}>
          {/* Sidebar Filters */}
          <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}>
            <div className={styles.sidebarHeader}>
              <h3>Filters</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                {activeFilterCount > 0 && (
                  <button className={styles.clearBtn} onClick={clearFilters}>Clear All</button>
                )}
                <button className={styles.closeFilters} onClick={() => setFiltersOpen(false)}><FiX /></button>
              </div>
            </div>

            {/* Search */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Search</h4>
              <input
                type="text" value={filters.search}
                onChange={e => updateFilter('search', e.target.value)}
                placeholder="Search gifts..."
                className="input"
              />
            </div>

            {/* Price Range */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Price Range</h4>
              {PRICE_RANGES.map(range => (
                <label key={range.label} className={styles.checkLabel}>
                  <input
                    type="radio"
                    name="price"
                    checked={filters.minPrice == range.min && filters.maxPrice == range.max}
                    onChange={() => updateFilter('minPrice', range.min) || updateFilter('maxPrice', range.max)}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>

            {/* Category */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Category</h4>
              {CATEGORIES.map(cat => (
                <label key={cat} className={styles.checkLabel}>
                  <input
                    type="radio" name="category"
                    checked={filters.category === cat}
                    onChange={() => updateFilter('category', filters.category === cat ? '' : cat)}
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>

            {/* Occasion */}
            <div className={styles.filterGroup}>
              <h4 className={styles.filterLabel}>Occasion</h4>
              {OCCASIONS.map(occ => (
                <label key={occ} className={styles.checkLabel}>
                  <input
                    type="radio" name="occasion"
                    checked={filters.occasion === occ}
                    onChange={() => updateFilter('occasion', filters.occasion === occ ? '' : occ)}
                  />
                  <span style={{ textTransform: 'capitalize' }}>{occ}</span>
                </label>
              ))}
            </div>

            {/* Customizable */}
            <div className={styles.filterGroup}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  checked={!!filters.customizable}
                  onChange={e => updateFilter('customizable', e.target.checked ? 'true' : '')}
                />
                <span>Customizable Only</span>
              </label>
            </div>
          </aside>

          {/* Products Grid */}
          <div className={styles.content}>
            {loading ? (
              <div className={styles.skeletonGrid}>
                {Array(8).fill(0).map((_, i) => (
                  <div key={i} className={styles.skeleton}>
                    <div className={`skeleton ${styles.skeletonImg}`}></div>
                    <div style={{ padding: 16 }}>
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '60%', marginBottom: 8 }}></div>
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '90%', marginBottom: 8 }}></div>
                      <div className={`skeleton ${styles.skeletonLine}`} style={{ width: '40%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <span className="icon">🎁</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
                {/* Pagination */}
                {pages > 1 && (
                  <div className={styles.pagination}>
                    <button className={`btn btn-ghost ${styles.pageBtn}`} disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</button>
                    {Array.from({ length: pages }, (_, i) => (
                      <button key={i + 1} className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : 'btn btn-ghost'}`}
                        onClick={() => setPage(i + 1)}>
                        {i + 1}
                      </button>
                    ))}
                    <button className={`btn btn-ghost ${styles.pageBtn}`} disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
