const supabase = require('../config/supabase');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products
// @route   GET /api/products
exports.getProducts = async (req, res) => {
  try {
    const { category, occasion, relationship, minPrice, maxPrice, search, sort, page = 1, limit = 12 } = req.query;
    let query = supabase.from('products').select('*', { count: 'exact' });

    if (category) query = query.eq('category', category);
    if (occasion) query = query.eq('occasion', occasion);
    if (relationship) query = query.contains('relationship_tags', [relationship]);
    if (minPrice) query = query.gte('price', parseFloat(minPrice));
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice));
    if (search) query = query.ilike('name', `%${search}%`);

    if (sort === 'price_asc') query = query.order('price', { ascending: true });
    else if (sort === 'price_desc') query = query.order('price', { ascending: false });
    else if (sort === 'rating') query = query.order('rating', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const from = (page - 1) * limit;
    query = query.range(from, from + parseInt(limit) - 1);

    const { data: products, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      products,
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
exports.getProduct = async (req, res) => {
  try {
    // Try to fetch with variants (requires product_variants table to exist)
    let { data: product, error } = await supabase
      .from('products')
      .select('*, product_variants(*)')
      .eq('id', req.params.id)
      .single();

    // PGRST200 = relationship/table not found — fall back to plain product fetch
    if (error && error.code === 'PGRST200') {
      const fallback = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .single();
      product = fallback.data;
      error = fallback.error;
    }

    if (error || !product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product: { ...product, product_variants: product.product_variants || [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const uploadSupabaseFile = async (file) => {
  const fileName = `gallery/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_')}`;
  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });
  if (uploadError) throw new Error('Image upload failed: ' + uploadError.message);
  const { data: urlData } = supabase.storage.from('products').getPublicUrl(fileName);
  return urlData?.publicUrl || null;
};

// @desc    Create product (admin)
// @route   POST /api/products
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice, category, occasion, relationship_tags,
      customizable, stock, features, product_code, gift_type, personalization_options
    } = req.body;

    let existingImages = req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : [];
    
    // Parse existing images if they come as stringified JSON
    let imageObjects = [];
    for (let img of existingImages) {
      if (typeof img === 'string' && img.startsWith('{')) {
        try { imageObjects.push(JSON.parse(img)); } catch (e) {}
      } else if (typeof img === 'object') {
        imageObjects.push(img);
      } else if (typeof img === 'string') {
        imageObjects.push({ imgId: 'IMG-' + Math.floor(1000 + Math.random() * 9000), url: img });
      }
    }

    // 1️⃣ Handle Multiple Main Product Images (fieldname: images)
    if (req.files && req.files.length > 0) {
      const mainImageFiles = req.files.filter(f => f.fieldname === 'images');
      for (const file of mainImageFiles) {
        const url = await uploadSupabaseFile(file);
        if (url) {
          imageObjects.push({
            imgId: 'IMG-' + Math.floor(10000 + Math.random() * 90000),
            url: url
          });
        }
      }
    }

    const pCode = product_code || ('GFT-' + Math.floor(1000 + Math.random() * 9000));
    const persOptions = typeof personalization_options === 'string' ? JSON.parse(personalization_options || '{}') : (personalization_options || {});
    
    // 3️⃣ Save Product to Database
    const { data: product, error } = await supabase
      .from('products')
      .insert([{
        product_code: pCode,
        gift_type: gift_type || 'Standard',
        personalization_options: persOptions,
        name, 
        description, 
        price: parseFloat(price) || 0, 
        original_price: originalPrice ? parseFloat(originalPrice) : null, 
        category, 
        occasion,
        relationship_tags: relationship_tags ? (Array.isArray(relationship_tags) ? relationship_tags : [relationship_tags]) : [], 
        customizable: customizable === 'true' || customizable === true, 
        stock: parseInt(stock) || 0, 
        images: imageObjects, 
        features: features ? (Array.isArray(features) ? features : [features]) : [],
        created_by: req.user.id
      }])
      .select()
      .single();

    if (error) {
      console.error('Database Error:', error);
      throw error;
    }

    // 4️⃣ Handle Variants if provided
    let variantsData = [];
    if (req.body.variants) {
      const parsedVariants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
      
      if (Array.isArray(parsedVariants) && parsedVariants.length > 0) {
        const insertVariants = [];
        for (let i = 0; i < parsedVariants.length; i++) {
          const v = parsedVariants[i];
          let vImageUrl = v.image || null;

          // Check if there is an uploaded file for this variant
          if (req.files) {
            const variantFile = req.files.find(f => f.fieldname === `variantImage_${i}`);
            if (variantFile) {
              vImageUrl = await uploadSupabaseFile(variantFile) || vImageUrl;
            }
          }

          insertVariants.push({
            product_id: product.id,
            variant_name: v.variantName,
            sku: v.sku || `SKU-${product.id.substring(0, 5)}-${i + 1}`,
            price: parseFloat(v.price) || 0,
            discount_percentage: parseFloat(v.discountPercentage || 0),
            stock: parseInt(v.stock) || 0,
            image: vImageUrl
          });
        }

        const { data: createdVariants, error: variantError } = await supabase
          .from('product_variants')
          .insert(insertVariants)
          .select();

        if (variantError) console.error('Variant Insert Error:', variantError);
        else variantsData = createdVariants;
      }
    }

    res.status(201).json({ success: true, product: { ...product, product_variants: variantsData } });
  } catch (err) {
    console.error('Create Product Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, description, price, originalPrice, category, occasion, 
      relationship_tags, customizable, stock, features, product_code, gift_type, personalization_options
    } = req.body;

    let existingImages = req.body.images ? (Array.isArray(req.body.images) ? req.body.images : [req.body.images]) : [];
    
    // Parse existing images if they come as stringified JSON
    let imageObjects = [];
    for (let img of existingImages) {
      if (typeof img === 'string' && img.startsWith('{')) {
        try { imageObjects.push(JSON.parse(img)); } catch (e) {}
      } else if (typeof img === 'object') {
        imageObjects.push(img);
      } else if (typeof img === 'string') {
        imageObjects.push({ imgId: 'IMG-' + Math.floor(1000 + Math.random() * 9000), url: img });
      }
    }

    // 1️⃣ Handle New Image Upload if provided
    if (req.files && req.files.length > 0) {
      const mainImageFiles = req.files.filter(f => f.fieldname === 'images');
      for (const file of mainImageFiles) {
        const url = await uploadSupabaseFile(file);
        if (url) {
          imageObjects.push({
            imgId: 'IMG-' + Math.floor(10000 + Math.random() * 90000),
            url: url
          });
        }
      }
    }

    const persOptions = personalization_options !== undefined 
      ? (typeof personalization_options === 'string' ? JSON.parse(personalization_options || '{}') : personalization_options)
      : undefined;

    // 2️⃣ Update Product in Database
    const { data: product, error } = await supabase
      .from('products')
      .update({
        product_code: product_code ? product_code : undefined,
        gift_type: gift_type ? gift_type : undefined,
        personalization_options: persOptions,
        name, 
        description, 
        price: price ? parseFloat(price) : undefined, 
        original_price: originalPrice ? parseFloat(originalPrice) : null, 
        category, 
        occasion,
        relationship_tags: relationship_tags ? (Array.isArray(relationship_tags) ? relationship_tags : [relationship_tags]) : undefined, 
        customizable: customizable !== undefined ? (customizable === 'true' || customizable === true) : undefined, 
        stock: stock ? parseInt(stock) : undefined, 
        images: imageObjects.length > 0 ? imageObjects : undefined, 
        features: features ? (Array.isArray(features) ? features : [features]) : undefined
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    // 3️⃣ Sync Variants
    if (req.body.variants) {
      const parsedVariants = typeof req.body.variants === 'string' ? JSON.parse(req.body.variants) : req.body.variants;
      
      if (Array.isArray(parsedVariants)) {
        // Step A: Delete current variants (Sync approach)
        await supabase.from('product_variants').delete().eq('product_id', req.params.id);

        // Step B: Insert updated variants
        if (parsedVariants.length > 0) {
          const insertVariants = [];
          for (let i = 0; i < parsedVariants.length; i++) {
            const v = parsedVariants[i];
            let vImageUrl = v.image || null;

            if (req.files) {
              const variantFile = req.files.find(f => f.fieldname === `variantImage_${i}`);
              if (variantFile) {
                vImageUrl = await uploadSupabaseFile(variantFile) || vImageUrl;
              }
            }

            insertVariants.push({
              product_id: req.params.id,
              variant_name: v.variantName,
              sku: v.sku || `SKU-${req.params.id.substring(0, 5)}-${i + 1}`,
              price: parseFloat(v.price) || 0,
              discount_percentage: parseFloat(v.discountPercentage || 0),
              stock: parseInt(v.stock) || 0,
              image: vImageUrl
            });
          }

          const { error: variantError } = await supabase
            .from('product_variants')
            .insert(insertVariants);

          if (variantError) console.error('Variant Update Error:', variantError);
        }
      }
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error('Update Product Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured
exports.getFeatured = async (req, res) => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .limit(8);
    if (error) throw error;
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get categories
// @route   GET /api/products/categories
exports.getCategories = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category');
    if (error) throw error;
    const categories = [...new Set(data.map(p => p.category))];
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
