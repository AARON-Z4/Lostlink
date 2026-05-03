const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload.middleware');
const { uploadImage } = require('../services/storage.service');
const { authenticate } = require('../middleware/auth.middleware');

/**
 * POST /upload
 * Standalone file upload. Returns public URL.
 */
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const bucket = req.body.bucket || 'items';
    const url = await uploadImage(req.file.buffer, req.file.mimetype, bucket);
    
    return res.json({ 
      url, 
      path: url.split('/').pop(), // simplistic path extraction
      message: 'File uploaded successfully' 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
