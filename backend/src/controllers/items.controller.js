const { supabaseAdmin } = require('../config/supabaseClient');
const { uploadImage, deleteImage } = require('../services/storage.service');
const { runMatchingForItem } = require('../services/matching.service');
const { generateQRCode } = require('../services/qr.service');

/**
 * POST /items/lost  or  POST /items/found
 */
const createItem = async (req, res) => {
  const { title, description, category, location, date } = req.body;
  const type = req.path.includes('lost') ? 'lost' : 'found';
  let image_url = null;

  // Handle image upload
  if (req.file) {
    image_url = await uploadImage(req.file.buffer, req.file.mimetype);
  }

  const { data: item, error } = await supabaseAdmin
    .from('items')
    .insert({
      title,
      description,
      category,
      type,
      location,
      date,
      image_url,
      user_id: req.user.id,
      status: 'active',
    })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Auto-generate QR code
  try {
    await generateQRCode(item.id);
  } catch (e) {
    console.error('QR generation failed:', e.message);
  }

  // Run matching engine async (don't block response)
  runMatchingForItem({ ...item, user_id: req.user.id }).catch(console.error);

  return res.status(201).json({ message: 'Item created successfully', item });
};

/**
 * GET /items
 * Query params: type, category, location, status, search, page, limit
 */
const getItems = async (req, res) => {
  const { type, category, location, status, search, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabaseAdmin
    .from('items')
    .select('*, users(id, name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (type) query = query.eq('type', type);
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);
  if (location) query = query.ilike('location', `%${location}%`);
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data: items, error, count } = await query;

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    items,
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(count / parseInt(limit)),
    },
  });
};

/**
 * GET /items/:id
 */
const getItemById = async (req, res) => {
  const { id } = req.params;

  const { data: item, error } = await supabaseAdmin
    .from('items')
    .select('*, users(id, name, email), qr_codes(*)')
    .eq('id', id)
    .single();

  if (error || !item) return res.status(404).json({ error: 'Item not found' });

  return res.json({ item });
};

/**
 * PATCH /items/:id
 */
const updateItem = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Verify ownership
  const { data: existing } = await supabaseAdmin
    .from('items')
    .select('user_id, image_url')
    .eq('id', id)
    .single();

  if (!existing) return res.status(404).json({ error: 'Item not found' });
  if (existing.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to update this item' });
  }

  // Handle new image upload
  if (req.file) {
    if (existing.image_url) await deleteImage(existing.image_url);
    updates.image_url = await uploadImage(req.file.buffer, req.file.mimetype);
  }

  const { data: item, error } = await supabaseAdmin
    .from('items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: 'Item updated', item });
};

/**
 * DELETE /items/:id
 */
const deleteItem = async (req, res) => {
  const { id } = req.params;

  const { data: item } = await supabaseAdmin.from('items').select('user_id, image_url').eq('id', id).single();

  if (!item) return res.status(404).json({ error: 'Item not found' });
  if (item.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this item' });
  }

  if (item.image_url) await deleteImage(item.image_url);

  const { error } = await supabaseAdmin.from('items').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: 'Item deleted successfully' });
};

/**
 * GET /items/:id/matches
 */
const getItemMatches = async (req, res) => {
  const { getMatchesForItem } = require('../services/matching.service');
  const matches = await getMatchesForItem(req.params.id);
  return res.json({ matches });
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem, getItemMatches };
