// Mock product data for offline/demo mode
export const MOCK_PRODUCTS = [
  {
    id: '1', name: 'Personalized Photo Mug', price: 449, original_price: 599,
    category: 'Home Decor', occasion: 'birthday', relationship_tags: ['mom', 'dad', 'friend'],
    images: ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600'],
    rating: 4.8, review_count: 234, customizable: true, stock: 50,
    same_day_delivery: true, featured: true,
    description: 'Start every morning with a smile! This beautifully crafted ceramic mug features your favorite photo printed with premium quality. Perfect for coffee, tea, or any hot beverage.',
    features: ['Premium ceramic', 'Dishwasher safe', 'High-res photo print', 'Gift-ready packaging']
  },
  {
    id: '2', name: 'Custom Star Map Print', price: 1299, original_price: 1799,
    category: 'Art', occasion: 'anniversary', relationship_tags: ['partner', 'wife', 'husband'],
    images: ['https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=600'],
    rating: 4.9, review_count: 189, customizable: true, stock: 30,
    same_day_delivery: false, featured: true,
    description: 'Capture the exact night sky from any location and date. Perfect for anniversaries, birthdays, or any special moment.',
    features: ['A3 premium print', 'Custom location & date', 'Waterproof ink', 'Frame-ready']
  },
  {
    id: '3', name: 'Engraved Wood Photo Frame', price: 899, original_price: 1199,
    category: 'Home Decor', occasion: 'housewarming', relationship_tags: ['family', 'friend'],
    images: ['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600'],
    rating: 4.7, review_count: 312, customizable: true, stock: 75,
    same_day_delivery: true, featured: false,
    description: 'A beautiful handcrafted wooden frame with custom laser engraving. Turn your favorite memory into a timeless piece of art.',
    features: ['Solid teak wood', 'Custom engraving', 'Holds 4x6 photo', 'Hanging hook included']
  },
  {
    id: '4', name: 'Luxury Chocolate Gift Box', price: 1499, original_price: 1699,
    category: 'Edibles', occasion: 'birthday', relationship_tags: ['mom', 'friend', 'anyone'],
    images: ['https://images.unsplash.com/photo-1549007953-2f2dc0b24019?w=600'],
    rating: 4.6, review_count: 428, customizable: false, stock: 100,
    same_day_delivery: true, featured: true,
    description: '24 handcrafted Belgian chocolates in a premium gift box. Perfect for any occasion that calls for something sweet and luxurious.',
    features: ['24 pieces', 'Belgian chocolate', 'Premium packaging', 'Same-day delivery']
  },
  {
    id: '5', name: 'Personalized Jewelry Box', price: 2499, original_price: 3199,
    category: 'Jewelry', occasion: 'anniversary', relationship_tags: ['wife', 'mom', 'girlfriend'],
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600'],
    rating: 4.9, review_count: 156, customizable: true, stock: 20,
    same_day_delivery: false, featured: true,
    description: 'An exquisite handcrafted jewelry box with custom name engraving. The perfect gift for the special woman in your life.',
    features: ['Velvet interior', 'Gold name engraving', 'Multiple compartments', 'Premium wood finish']
  },
  {
    id: '6', name: 'Custom Portrait Illustration', price: 1999, original_price: 2499,
    category: 'Art', occasion: 'birthday', relationship_tags: ['anyone', 'family', 'friend'],
    images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600'],
    rating: 4.8, review_count: 97, customizable: true, stock: 15,
    same_day_delivery: false, featured: false,
    description: 'Turn your photos into stunning hand-drawn style illustrations. A one-of-a-kind artwork that will be treasured forever.',
    features: ['Digital delivery', '3-5 day turnaround', 'Multiple style options', 'Print-ready file']
  },
  {
    id: '7', name: 'Premium Gift Hamper', price: 3499, original_price: 4299,
    category: 'Hampers', occasion: 'diwali', relationship_tags: ['boss', 'friend', 'family'],
    images: ['https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600'],
    rating: 4.7, review_count: 203, customizable: false, stock: 40,
    same_day_delivery: true, featured: true,
    description: 'A curated collection of premium goodies including chocolates, dry fruits, candles, and more. Perfect for festivals and celebrations.',
    features: ['15+ premium items', 'Luxury basket', 'Custom greeting card', 'Same-day delivery']
  },
  {
    id: '8', name: 'Personalized Couple Cushion', price: 699, original_price: 899,
    category: 'Home Decor', occasion: 'anniversary', relationship_tags: ['partner', 'wife', 'husband'],
    images: ['https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?w=600'],
    rating: 4.5, review_count: 341, customizable: true, stock: 60,
    same_day_delivery: true, featured: false,
    description: 'Snuggle up with a cushion that features your favorite couple photo. Made from premium velvet with high-quality photo printing.',
    features: ['16x16 inch', 'Premium velvet', 'Both-side print available', 'Machine washable']
  }
];

export const OCCASIONS = ['birthday', 'anniversary', 'wedding', 'graduation', 'diwali', 'christmas', 'housewarming', 'baby shower'];
export const RELATIONSHIPS = ['mom', 'dad', 'wife', 'husband', 'girlfriend', 'boyfriend', 'friend', 'boss', 'family', 'anyone'];
export const CATEGORIES = ['Home Decor', 'Jewelry', 'Art', 'Edibles', 'Hampers', 'Accessories', 'Apparel', 'DIY'];
