const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const auth = require('../middleware/auth');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration
const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedMimes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Only image files are allowed. Received: ${file.mimetype}`), false);
    }
  },
});

// Multer error handler
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large. Maximum size is 10MB.' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Too many files. Maximum is 5 files per upload.' 
      });
    }
  }
  
  if (error.message.includes('Only image files are allowed')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }
  
  return res.status(500).json({ 
    error: 'Upload error: ' + error.message 
  });
};

// Upload single image endpoint
router.post('/image', auth, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ 
        error: 'Image upload service not configured. Please contact administrator.' 
      });
    }

    console.log(`Uploading image: ${req.file.originalname} (${req.file.size} bytes)`);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'portfolio',
          transformation: [
            { width: 1200, height: 630, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ],
          public_id: `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(req.file.buffer);
    });

    console.log('Image uploaded successfully:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      created_at: result.created_at
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle specific Cloudinary errors
    if (error.message.includes('Invalid cloud_name')) {
      return res.status(500).json({ 
        error: 'Image service configuration error. Please contact administrator.' 
      });
    }
    
    if (error.message.includes('Invalid API key')) {
      return res.status(500).json({ 
        error: 'Image service authentication error. Please contact administrator.' 
      });
    }

    if (error.http_code === 400) {
      return res.status(400).json({ 
        error: 'Invalid image file or corrupted data.' 
      });
    }

    res.status(500).json({ 
      error: 'Upload failed. Please try again or contact administrator.' 
    });
  }
});

// Upload multiple images endpoint
router.post('/images', auth, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No image files provided' });
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ 
        error: 'Image upload service not configured. Please contact administrator.' 
      });
    }

    console.log(`Uploading ${req.files.length} images to Cloudinary...`);

    // Upload all files
    const uploadPromises = req.files.map((file, index) => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'portfolio',
            transformation: [
              { width: 1200, height: 630, crop: 'limit' },
              { quality: 'auto:good' },
              { fetch_format: 'auto' }
            ],
            public_id: `portfolio_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`
          },
          (error, result) => {
            if (error) {
              console.error(`Error uploading file ${index}:`, error);
              reject({
                index,
                filename: file.originalname,
                error: error.message
              });
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                filename: file.originalname
              });
            }
          }
        ).end(file.buffer);
      });
    });

    try {
      const results = await Promise.all(uploadPromises);
      
      res.json({
        success: true,
        images: results,
        count: results.length
      });
    } catch (error) {
      // Handle partial failures
      const failedUploads = Array.isArray(error) ? error : [error];
      res.status(207).json({  // Multi-Status
        success: false,
        error: 'Some uploads failed',
        failed: failedUploads,
        total: req.files.length
      });
    }

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed: ' + error.message 
    });
  }
});

// Delete image endpoint
router.delete('/image/:publicId', auth, async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ error: 'Public ID is required' });
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({ 
        error: 'Image service not configured. Please contact administrator.' 
      });
    }

    console.log(`Deleting image with public ID: ${publicId}`);

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({ 
        success: true,
        message: 'Image deleted successfully',
        public_id: publicId
      });
    } else if (result.result === 'not found') {
      res.status(404).json({ 
        error: 'Image not found' 
      });
    } else {
      res.status(400).json({ 
        error: 'Failed to delete image: ' + result.result 
      });
    }

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ 
      error: 'Delete failed: ' + error.message 
    });
  }
});

// Get upload configuration (for frontend)
router.get('/config', auth, (req, res) => {
  res.json({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    uploadPreset: 'portfolio',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    isConfigured: isCloudinaryConfigured()
  });
});

// Health check for upload service
router.get('/health', (req, res) => {
  const isConfigured = isCloudinaryConfigured();

  res.json({
    status: isConfigured ? 'OK' : 'Configuration Missing',
    cloudinaryConfigured: isConfigured,
    timestamp: new Date().toISOString(),
    maxFileSize: '10MB',
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  });
});

// Test upload endpoint (for debugging)
router.post('/test', auth, async (req, res) => {
  try {
    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        error: 'Cloudinary not configured',
        missing: {
          cloudName: !process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: !process.env.CLOUDINARY_API_KEY,
          apiSecret: !process.env.CLOUDINARY_API_SECRET
        }
      });
    }

    // Test Cloudinary connection
    const result = await cloudinary.api.ping();
    
    res.json({
      status: 'OK',
      cloudinary: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    res.status(500).json({
      error: 'Cloudinary connection failed',
      details: error.message
    });
  }
});

module.exports = router;