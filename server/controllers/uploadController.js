const supabase = require('../config/supabase');

// @desc    Upload image to Supabase Storage
// @route   POST /api/upload
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file provided' });

    // Determine bucket: Default to 'products', can be 'avatars'
    const bucket = req.query.type === 'avatar' ? 'avatars' : 'products';
    const folder = bucket === 'avatars' ? 'user-profiles' : 'items';
    const fileName = `${folder}/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;

    // 1️⃣ Upload to Supabase
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 2️⃣ Get Public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    res.json({ 
      success: true, 
      url: urlData.publicUrl,
      path: fileName,
      bucket: bucket
    });
  } catch (err) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete image from Supabase Storage
// @route   DELETE /api/upload/:path
exports.deleteImage = async (req, res) => {
  try {
    const bucket = req.query.bucket || 'products';
    const { error } = await supabase.storage.from(bucket).remove([req.params.path]);
    if (error) throw error;
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
