const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * GET /admin/users  — list all users
 */
const getUsers = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const { data: users, error, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({ users, total: count });
};

/**
 * PATCH /admin/users/:id/role  — change a user's role
 */
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be user or admin' });
  }

  const { data, error } = await supabaseAdmin
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: `User role updated to ${role}`, user: data });
};

/**
 * DELETE /admin/users/:id  — delete a user
 */
const deleteUser = async (req, res) => {
  const { id } = req.params;

  // Delete from Supabase Auth
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (authError) return res.status(500).json({ error: authError.message });

  return res.json({ message: 'User deleted successfully' });
};

/**
 * GET /admin/items  — list all items
 */
const getItems = async (req, res) => {
  const { type, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = supabaseAdmin
    .from('items')
    .select('*, users(id, name, email)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + parseInt(limit) - 1);

  if (type) query = query.eq('type', type);
  if (status) query = query.eq('status', status);

  const { data: items, error, count } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ items, total: count });
};

/**
 * DELETE /admin/items/:id  — force delete any item
 */
const deleteItem = async (req, res) => {
  const { id } = req.params;
  const { deleteImage } = require('../services/storage.service');

  const { data: item } = await supabaseAdmin.from('items').select('image_url').eq('id', id).single();
  if (item?.image_url) await deleteImage(item.image_url);

  const { error } = await supabaseAdmin.from('items').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ message: 'Item deleted by admin' });
};

/**
 * GET /admin/claims  — list all claims
 */
const getClaims = async (req, res) => {
  const { status } = req.query;

  let query = supabaseAdmin
    .from('claims')
    .select('*, items(id, title, type), users!claimant_id(id, name, email)')
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data: claims, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ claims });
};

/**
 * PATCH /admin/claims/:id  — admin overrides claim status
 */
const updateClaim = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { data, error } = await supabaseAdmin
    .from('claims')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ message: 'Claim updated by admin', claim: data });
};

/**
 * GET /admin/stats  — dashboard stats
 */
const getStats = async (req, res) => {
  const [
    { count: totalItems },
    { count: lostItems },
    { count: foundItems },
    { count: totalClaims },
    { count: resolvedItems },
    { count: totalUsers },
  ] = await Promise.all([
    supabaseAdmin.from('items').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('items').select('*', { count: 'exact', head: true }).eq('type', 'lost'),
    supabaseAdmin.from('items').select('*', { count: 'exact', head: true }).eq('type', 'found'),
    supabaseAdmin.from('claims').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('items').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
    supabaseAdmin.from('users').select('*', { count: 'exact', head: true }),
  ]);

  return res.json({
    stats: { totalItems, lostItems, foundItems, totalClaims, resolvedItems, totalUsers },
  });
};

module.exports = { getUsers, updateUserRole, deleteUser, getItems, deleteItem, getClaims, updateClaim, getStats };
