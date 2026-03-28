// @desc    AI Gift Recommendations (rule-based + optional Gemini API)
// @route   POST /api/ai/recommend

exports.getRecommendations = async (req, res) => {
  try {
    const { relationship, occasion, budget, interests, age, gender } = req.body;

    // Rule-based recommendations for demo
    const recommendations = [];

    if (budget <= 500) {
      recommendations.push(...[
        { name: 'Personalized Keychain', price: 299, emoji: '🔑', category: 'Accessories', reason: 'Affordable & personal keepsake' },
        { name: 'Custom Mug', price: 449, emoji: '☕', category: 'Home Decor', reason: 'Great for daily use' },
        { name: 'Photo Frame', price: 399, emoji: '🖼️', category: 'Home Decor', reason: 'Captures memories beautifully' }
      ]);
    }
    if (budget <= 1500) {
      recommendations.push(...[
        { name: 'Scrapbook Kit', price: 899, emoji: '📸', category: 'DIY', reason: 'Heartfelt and handmade' },
        { name: 'Customized T-Shirt', price: 799, emoji: '👕', category: 'Apparel', reason: 'Wearable memory' },
        { name: 'Luxury Chocolate Box', price: 1199, emoji: '🍫', category: 'Edibles', reason: 'Sweet treat for anyone' }
      ]);
    }
    if (budget > 1500) {
      recommendations.push(...[
        { name: 'Personalized Jewelry', price: 2499, emoji: '💎', category: 'Jewelry', reason: 'Timeless luxury gift' },
        { name: 'Custom Portrait Painting', price: 1999, emoji: '🎨', category: 'Art', reason: 'One-of-a-kind artwork' },
        { name: 'Premium Gift Hamper', price: 3499, emoji: '🎁', category: 'Hampers', reason: 'Everything they love in one box' }
      ]);
    }

    // Occasion-based additions
    const occasionGifts = {
      birthday: { name: 'Birthday Cake Gift Set', price: 899, emoji: '🎂', category: 'Celebration', reason: 'Perfect birthday surprise' },
      anniversary: { name: 'Couple Photo Book', price: 1499, emoji: '💑', category: 'Romance', reason: 'Celebrate your love story' },
      wedding: { name: 'Crystal Keepsake', price: 2999, emoji: '💍', category: 'Keepsakes', reason: 'Elegant wedding gift' },
      graduation: { name: 'Engraved Pen Set', price: 1299, emoji: '🎓', category: 'Office', reason: 'Mark new beginnings' }
    };
    if (occasion && occasionGifts[occasion]) recommendations.unshift(occasionGifts[occasion]);

    // AI prompt message
    const prompt = `Finding perfect gifts for ${relationship || 'someone special'} on ${occasion || 'a special occasion'} with budget ₹${budget}. ${interests ? `They love: ${interests}.` : ''}`;

    res.json({
      success: true,
      recommendations: recommendations.slice(0, 6),
      prompt,
      aiMessage: `Based on your inputs, here are my top picks for your ${relationship || 'loved one'}! 🎁✨`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    AI Chatbot
// @route   POST /api/ai/chat
exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    const lower = message.toLowerCase();
    let reply = '';

    if (lower.includes('birthday')) {
      reply = '🎂 For birthdays, I suggest personalized photo frames, custom cakes, or a luxury gift hamper! What\'s your budget?';
    } else if (lower.includes('anniversary')) {
      reply = '💑 Anniversaries call for something romantic! Consider couple portraits, jewelry, or a romantic getaway hamper.';
    } else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable')) {
      reply = '💰 We have beautiful gifts starting from ₹199! Check our "Under ₹500" collection for amazing deals.';
    } else if (lower.includes('delivery') || lower.includes('shipping')) {
      reply = '🚚 We offer same-day delivery in select cities! Standard delivery takes 3-5 business days. Free shipping on orders above ₹999.';
    } else if (lower.includes('customize') || lower.includes('personal')) {
      reply = '✏️ Most of our products can be personalized with names, photos, and messages! Look for the "Customizable" badge.';
    } else if (lower.includes('return') || lower.includes('refund')) {
      reply = '↩️ We have a hassle-free 7-day return policy. Customized items can be returned if there\'s a quality issue.';
    } else {
      reply = '🎁 Hi! I\'m GokuBot, your personal gift advisor. Tell me about the person you\'re shopping for and I\'ll suggest the perfect gift! What\'s the occasion?';
    }

    res.json({ success: true, reply, bot: 'GokuBot' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
