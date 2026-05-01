const { supabaseAdmin } = require('../config/supabaseClient');
const { v4: uuidv4 } = require('uuid');

const BUCKET_NAME = 'items';

/**
 * Upload an image buffer to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
const uploadImage = async (fileBuffer, mimeType, folder = 'uploads') => {
  const ext = mimeType.split('/')[1] || 'jpg';
  const fileName = `${folder}/${uuidv4()}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(BUCKET_NAME)
    .upload(fileName, fileBuffer, { contentType: mimeType, upsert: false });

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return data.publicUrl;
};

/**
 * Delete an image from Supabase Storage by its public URL.
 */
const deleteImage = async (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split(`/object/public/${BUCKET_NAME}/`);
    if (pathParts.length < 2) return;

    const filePath = pathParts[1];
    await supabaseAdmin.storage.from(BUCKET_NAME).remove([filePath]);
  } catch (err) {
    console.error('Image delete error:', err.message);
  }
};

module.exports = { uploadImage, deleteImage };
