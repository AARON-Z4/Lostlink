const { generateQRCode, getQRCode } = require('../services/qr.service');
const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * POST /qr/:itemId  — generate or regenerate QR code for an item
 */
const createQR = async (req, res) => {
  const { itemId } = req.params;

  // Verify item exists
  const { data: item } = await supabaseAdmin.from('items').select('id, user_id').eq('id', itemId).single();
  if (!item) return res.status(404).json({ error: 'Item not found' });

  if (item.user_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized' });
  }

  const qrRecord = await generateQRCode(itemId);
  return res.status(201).json({ message: 'QR code generated', qr: qrRecord });
};

/**
 * GET /qr/:itemId  — get QR code for an item
 */
const getQR = async (req, res) => {
  const { itemId } = req.params;
  const qr = await getQRCode(itemId);

  if (!qr) return res.status(404).json({ error: 'QR code not found for this item' });

  return res.json({ qr });
};

module.exports = { createQR, getQR };
