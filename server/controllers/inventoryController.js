const supabase = require('../config/supabase');

// @desc    Get all inventory IDs
// @route   GET /api/inventory
exports.getInventory = async (req, res) => {
  try {
    const { data: inventory, error } = await supabase
      .from('inventory_pool')
      .select('*')
      .order('product_code', { ascending: true });
    if (error) throw error;
    res.json({ success: true, inventory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Import bulk IDs (Initialize with 999 IDs)
// @route   POST /api/inventory/bulk
exports.importBulk = async (req, res) => {
  try {
    const { prefix = 'GFT', start = 1001, end = 2000 } = req.body;
    const batch = [];
    for (let i = start; i <= end; i++) {
      batch.push({ product_code: `${prefix}-${i}` });
    }
    const { data, error } = await supabase.from('inventory_pool').insert(batch).select();
    if (error) throw error;
    res.status(201).json({ success: true, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update ID status
// @route   PUT /api/inventory/:id
exports.updateId = async (req, res) => {
  try {
    const { product_name, is_used, product_id } = req.body;
    const { data, error } = await supabase
      .from('inventory_pool')
      .update({ product_name, is_used, product_id })
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, inventory: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
