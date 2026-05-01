const { supabaseAdmin } = require('../config/supabaseClient');
const { notifyClaimRequest, notifyClaimAccepted, notifyClaimRejected } = require('../services/notification.service');

/**
 * POST /claims  — submit a claim for an item
 */
const createClaim = async (req, res) => {
  const { item_id, message } = req.body;
  const claimant_id = req.user.id;

  // Fetch the item
  const { data: item, error: itemError } = await supabaseAdmin
    .from('items')
    .select('*, users(*)')
    .eq('id', item_id)
    .single();

  if (itemError || !item) return res.status(404).json({ error: 'Item not found' });
  if (item.user_id === claimant_id) return res.status(400).json({ error: 'You cannot claim your own item' });
  if (item.status !== 'active') return res.status(400).json({ error: 'Item is not available for claiming' });

  // Check for duplicate claim
  const { data: existing } = await supabaseAdmin
    .from('claims')
    .select('id')
    .eq('item_id', item_id)
    .eq('claimant_id', claimant_id)
    .single();

  if (existing) return res.status(409).json({ error: 'You already have a pending claim for this item' });

  // Create claim
  const { data: claim, error } = await supabaseAdmin
    .from('claims')
    .insert({ item_id, claimant_id, message, status: 'pending' })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Update item status to 'pending'
  await supabaseAdmin.from('items').update({ status: 'pending' }).eq('id', item_id);

  // Notify item owner
  await notifyClaimRequest(item.users, req.user, item);

  return res.status(201).json({ message: 'Claim submitted successfully', claim });
};

/**
 * GET /claims  — get claims (owner sees claims on their items; admin sees all)
 */
const getClaims = async (req, res) => {
  const { item_id } = req.query;

  let query = supabaseAdmin
    .from('claims')
    .select('*, items(id, title, type, category, location, image_url), users!claimant_id(id, name, email)')
    .order('created_at', { ascending: false });

  if (item_id) {
    query = query.eq('item_id', item_id);
  } else if (req.user.role !== 'admin') {
    // Regular users see only claims on their items OR their own claims
    const { data: userItems } = await supabaseAdmin
      .from('items')
      .select('id')
      .eq('user_id', req.user.id);

    const itemIds = (userItems || []).map((i) => i.id);
    query = query.or(`claimant_id.eq.${req.user.id},item_id.in.(${itemIds.join(',')})`);
  }

  const { data: claims, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({ claims });
};

/**
 * PATCH /claims/:id  — accept or reject a claim
 */
const updateClaim = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be accepted or rejected' });
  }

  // Fetch the claim with item and claimant
  const { data: claim, error: claimError } = await supabaseAdmin
    .from('claims')
    .select('*, items(*, users(*)), users!claimant_id(*)')
    .eq('id', id)
    .single();

  if (claimError || !claim) return res.status(404).json({ error: 'Claim not found' });

  // Only item owner or admin can update claim
  if (claim.items.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to update this claim' });
  }

  // Update claim status
  const { data: updated, error } = await supabaseAdmin
    .from('claims')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  const claimant = claim['users'];
  const item = claim.items;

  if (status === 'accepted') {
    // Mark item as claimed, reject all other pending claims
    await supabaseAdmin.from('items').update({ status: 'claimed' }).eq('id', item.id);
    await supabaseAdmin
      .from('claims')
      .update({ status: 'rejected' })
      .eq('item_id', item.id)
      .neq('id', id);

    await notifyClaimAccepted(claimant, item);
  } else {
    // If rejected and no more pending claims, revert to active
    const { data: pendingClaims } = await supabaseAdmin
      .from('claims')
      .select('id')
      .eq('item_id', item.id)
      .eq('status', 'pending');

    if (!pendingClaims?.length) {
      await supabaseAdmin.from('items').update({ status: 'active' }).eq('id', item.id);
    }

    await notifyClaimRejected(claimant, item);
  }

  return res.json({ message: `Claim ${status}`, claim: updated });
};

/**
 * PATCH /claims/:id/resolve  — mark as fully resolved
 */
const resolveClaim = async (req, res) => {
  const { id } = req.params;

  const { data: claim } = await supabaseAdmin
    .from('claims')
    .select('*, items(user_id, id)')
    .eq('id', id)
    .single();

  if (!claim) return res.status(404).json({ error: 'Claim not found' });
  if (claim.items.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  await supabaseAdmin.from('items').update({ status: 'resolved' }).eq('id', claim.items.id);
  await supabaseAdmin.from('claims').update({ status: 'accepted' }).eq('id', id);

  return res.json({ message: 'Item marked as resolved' });
};

module.exports = { createClaim, getClaims, updateClaim, resolveClaim };
