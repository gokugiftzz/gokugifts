import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiStar, FiZap, FiGift, FiHeart, FiShield } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import ProductCard from '../components/ProductCard/ProductCard';
import { getFeatured } from '../utils/api';
import { OCCASIONS } from '../utils/mockData';
import styles from './Home.module.css';

const HERO_SLIDES = [
  {
    headline: 'Gift Smarter,',
    highlight: 'Gift Personal.',
    sub: 'Personalized gifts that make every moment unforgettable.',
    cta: 'Explore Gifts',
    ctaLink: '/products',
    gradient: 'linear-gradient(135deg, #ff6b6b22, #c77dff22)'
  }
];

const FEATURES = [
  { icon: FiGift, title: 'Personalized', desc: 'Add names, photos, and messages to any gift' },
  { icon: FiZap, title: 'Same Day Delivery', desc: 'Get gifts delivered within hours in select cities' },
  { icon: FiShield, title: 'Quality Assured', desc: '100% satisfaction guarantee on all products' }
];

const CATEGORIES_DATA = [
  { name: 'Personalized', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=500&q=80', color: '#e63946', link: '/products?customizable=true' },
  { name: 'Birthday', image: 'https://images.unsplash.com/photo-1530103862676-fa8c9d34b3b7?auto=format&fit=crop&w=500&q=80', color: '#ffd166', link: '/products?occasion=birthday' },
  { name: 'Anniversary', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=500&q=80', color: '#ff6b6b', link: '/products?occasion=anniversary' },
  { name: 'Jewelry', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=80', color: '#ff9f43', link: '/products?category=Jewelry' },
  { name: 'Hampers', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=500&q=80', color: '#ff6b9d', link: '/products?category=Hampers' },
  { name: 'Plants', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80', color: '#06d6a0', link: '/products?category=Plants' },
  { name: 'Art', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=500&q=80', color: '#48dbfb', link: '/products?category=Art' },
  { name: 'Edibles', image: 'https://images.unsplash.com/photo-1511381939415-e4401546383d?auto=format&fit=crop&w=500&q=80', color: '#ff9ff3', link: '/products?category=Edibles' }
];

const TESTIMONIALS = [];

const Home = () => {
  const [products, setProducts] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getFeatured()
      .then(res => { if (res.data.products?.length) setProducts(res.data.products); })
      .catch(() => {}); // Use mock data on error
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setHeroSlide(s => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[heroSlide];

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero} style={{ background: slide.gradient }}>
        <div className={styles.heroBg}>
          <div className={styles.heroBgOrb1}></div>
          <div className={styles.heroBgOrb2}></div>
          <div className={styles.heroBgOrb3}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>🎁</span> India's #1 Gifting Platform
          </div>
          <h1 className={styles.heroHeadline}>
            {slide.headline} <br/>
            <span className={styles.heroHighlight}>{slide.highlight}</span>
          </h1>
          <p className={styles.heroSub}>{slide.sub}</p>
          <div className={styles.heroCtas}>
            <Link to={slide.ctaLink} className={`${styles.heroCta} btn btn-primary`}>
              {slide.cta} <FiArrowRight />
            </Link>
          </div>
          {/* Stats */}
          <div className={styles.stats}>
            {[
              { value: '50K+', label: 'Happy Customers' },
              { value: '5K+', label: 'Products' },
              { value: '4.9★', label: 'Average Rating' },
              { value: '100%', label: 'Original Gifts' }
            ].map(stat => (
              <div key={stat.label} className={styles.stat}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Hero slide indicators */}
        <div className={styles.slideIndicators}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`${styles.dot} ${i === heroSlide ? styles.dotActive : ''}`} onClick={() => setHeroSlide(i)} />
          ))}
        </div>
      </section>

      {/* Feature Bar */}
      <section className={styles.features}>
        <div className={styles.container}>
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className={styles.feature}>
              <div className={styles.featureIcon}><Icon /></div>
              <div>
                <h3 className={styles.featureTitle}>{title}</h3>
                <p className={styles.featureDesc}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className={`section ${styles.section}`}>
        <div className={styles.container}>
          <h2 className="section-title">Shop by Occasion</h2>
          <p className="section-subtitle">Find the perfect gift for every celebration</p>
          <div className={styles.catGrid}>
            {CATEGORIES_DATA.map(cat => (
              <Link to={cat.link} key={cat.name} className={styles.catCard} style={{ '--cat-color': cat.color }}>
                <div className={styles.catImage} style={{ backgroundImage: `url(${cat.image})` }}></div>
                <span className={styles.catName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className={`section ${styles.section}`}>
        <div className={styles.container}>
          <h2 className="section-title">✨ Featured Gifts</h2>
          <p className="section-subtitle">Handpicked for maximum smiles</p>
          <div className="products-grid">
            {products.slice(0, 8).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/products" className="btn btn-secondary">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className={`section ${styles.section}`}>
        <div className={styles.container}>
          <h2 className="section-title">💬 Happy Gifters</h2>
          <p className="section-subtitle">Thousands of smiles delivered</p>
          <div className={styles.testimonials}>
            {TESTIMONIALS.map(t => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.stars}>{'⭐'.repeat(t.rating)}</div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.testimonialAvatar}>{t.avatar}</span>
                  <div>
                    <strong>{t.name}</strong>
                    <small>{t.city}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className={styles.container}>
          <div className={styles.newsletterInner}>
            <h2>Get ₹200 off your first order! 🎉</h2>
            <p>Subscribe to get exclusive deals and gift inspiration</p>
            <form className={styles.newsletterForm} onSubmit={e => e.preventDefault()}>
              <input type="email" placeholder="Enter your email address" className={`input ${styles.newsletterInput}`} />
              <button type="submit" className="btn btn-primary">Subscribe</button>
            </form>
            <small>Use coupon <strong>WELCOME10</strong> for 10% off your first purchase!</small>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
