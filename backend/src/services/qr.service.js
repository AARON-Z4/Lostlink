const QRCode = require('qrcode');
const { supabaseAdmin } = require('../config/supabaseClient');

/**
 * Generates a QR code (as a data URL) for a given item.
 * The QR encodes the public item URL.
 * Saves the QR URL to the qr_codes table.
 */
const generateQRCode = async (itemId) => {
  const itemUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/items/${itemId}`;

  // Generate QR as base64 data URL
  const qrDataUrl = await QRCode.toDataURL(itemUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#1e1b4b', light: '#ffffff' },
  });

  // Upload to Supabase Storage
  const buffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const fileName = `qr_${itemId}.png`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('qrcodes')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  let qrPublicUrl = qrDataUrl; // fallback: embed base64

  if (!uploadError) {
    const { data } = supabaseAdmin.storage.from('qrcodes').getPublicUrl(fileName);
    qrPublicUrl = data.publicUrl;
  }

  // Upsert into qr_codes table
  const { data: qrRecord, error: dbError } = await supabaseAdmin
    .from('qr_codes')
    .upsert({ item_id: itemId, qr_url: qrPublicUrl }, { onConflict: 'item_id' })
    .select()
    .single();

  if (dbError) throw new Error(`Failed to save QR code: ${dbError.message}`);

  return qrRecord;
};

/**
 * Fetch QR code record for an item
 */
const getQRCode = async (itemId) => {
  const { data, error } = await supabaseAdmin
    .from('qr_codes')
    .select('*')
    .eq('item_id', itemId)
    .single();

  if (error) return null;
  return data;
};

module.exports = { generateQRCode, getQRCode };
