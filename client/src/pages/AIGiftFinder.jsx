import React, { useState } from 'react';
import { FiTarget, FiUser, FiCalendar, FiDollarSign, FiMessageSquare, FiArrowRight, FiZap, FiEdit3, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { MdAutoAwesome } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIRecommendations } from '../utils/api';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import styles from './AIGiftFinder.module.css';

const AIGiftFinder = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [formData, setFormData] = useState({
    relationship: '',
    occasion: '',
    budget: 1000,
    interests: '',
    age: '',
    gender: ''
  });

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await getAIRecommendations(formData);
      setResults(res.data.recommendations || []);
      setStep(5); // Results step
      toast.success('Gifts found! 🎁');
    } catch (err) {
      toast.error('AI is taking a nap. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  const resetFinder = () => {
    setStep(1);
    setResults([]);
    setFormData({ relationship: '', occasion: '', budget: 1000, interests: '', age: '', gender: '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.badge}><MdAutoAwesome /> AI Gifting Agent</div>
          <h1 className={styles.title}>Find the Perfect Gift</h1>
          <p className={styles.subtitle}>Our AI analyzes thousands of gifts to find the one that truly matters.</p>
        </div>

        <div className={styles.finderBox}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1" 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={styles.stepContent}
              >
                <h2 className={styles.stepTitle}><FiUser /> Who is the gift for?</h2>
                <div className={styles.optionsGrid}>
                  {['Mom 👩', 'Dad 👨', 'Partner 💑', 'Friend 🤝', 'Colleague 💼', 'Child 👶'].map(opt => (
                    <button 
                      key={opt}
                      className={`${styles.optionBtn} ${formData.relationship === opt ? styles.optionActive : ''}`}
                      onClick={() => setFormData({...formData, relationship: opt}) || handleNext()}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <div className={styles.backBtn} onClick={handleBack}>← Back</div>
                <h2 className={styles.stepTitle}><FiCalendar /> What's the occasion?</h2>
                <div className={styles.optionsGrid}>
                  {['Birthday 🎂', 'Anniversary 💑', 'Wedding 💍', 'Graduation 🎓', 'Housewarming 🏠', 'Just Because ✨'].map(opt => (
                    <button 
                      key={opt}
                      className={`${styles.optionBtn} ${formData.occasion === opt ? styles.optionActive : ''}`}
                      onClick={() => setFormData({...formData, occasion: opt}) || handleNext()}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <div className={styles.backBtn} onClick={handleBack}>← Back</div>
                <h2 className={styles.stepTitle}><FiDollarSign /> Your Budget (Max)</h2>
                <div className={styles.budgetBox}>
                  <div className={styles.budgetValue}>₹{formData.budget}</div>
                  <input 
                    type="range" min="100" max="10000" step="100"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    className={styles.range}
                  />
                  <div className={styles.rangeLabels}>
                    <span>₹100</span>
                    <span>₹10,000</span>
                  </div>
                </div>
                <button className={`btn btn-primary ${styles.fullWidth}`} onClick={handleNext}>Next Step</button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <div className={styles.backBtn} onClick={handleBack}>← Back</div>
                <h2 className={styles.stepTitle}><FiMessageSquare /> Tell us more...</h2>
                <div className={styles.inputBox}>
                  <label>Interests, hobbies, or personality traits</label>
                  <textarea 
                    className="input" rows="4" 
                    placeholder="e.g. Loves photography, travels often, likes minimal design, obsessed with coffee..."
                    value={formData.interests}
                    onChange={e => setFormData({...formData, interests: e.target.value})}
                  />
                </div>
                <button 
                  className={`btn btn-primary ${styles.fullWidth}`} 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Consulting the AI...' : 'Find Perfect Gifts 🚀'}
                </button>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={styles.resultsContent}
              >
                <div className={styles.resultsHeader}>
                  <h2 className={styles.stepTitle}>AI Recommended for You</h2>
                  <button className={styles.resetBtn} onClick={resetFinder}>Restart Finder</button>
                </div>
                
                <div className={styles.resultsGrid}>
                  {results.map((rec, i) => (
                    <motion.div 
                      key={i} 
                      className={styles.recCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div className={styles.recEmoji}>{rec.emoji}</div>
                      <div className={styles.recBody}>
                        <h3>{rec.name}</h3>
                        <div className={styles.recMeta}>
                          <span className={styles.recPrice}>₹{rec.price}</span>
                          <span className={styles.recCategory}>{rec.category}</span>
                        </div>
                        <p className={styles.recReason}>{rec.reason}</p>
                        <div className={styles.recActions}>
                          <button 
                            className={`btn btn-primary ${styles.recAdd}`}
                            onClick={() => {
                              addToCart({ id: `ai-${i}`, name: rec.name, price: rec.price, images: ['https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'] });
                            }}
                          >
                            <FiShoppingCart /> Add
                          </button>
                          <button className={styles.recWish} onClick={() => toast.success('Added to wishlist❤️')}>
                            <FiHeart />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className={styles.disclaimer}>
                  AI suggestions are based on your inputs and matched against our catalog and global gift trends.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Cards */}
        {step < 5 && (
          <div className={styles.infoCards}>
            <div className={styles.infoCard}>
              <FiZap />
              <h3>Instant Results</h3>
              <p>Get data-driven gift ideas in under 30 seconds.</p>
            </div>
            <div className={styles.infoCard}>
              <FiTarget />
              <h3>hyper-Personalized</h3>
              <p>Tailored specifically for your relationship and occasion.</p>
            </div>
            <div className={styles.infoCard}>
              <FiEdit3 />
              <h3>Catalog Integration</h3>
              <p>We match suggestions with our unique customizable products.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGiftFinder;
