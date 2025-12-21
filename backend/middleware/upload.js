import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB default
  },
  fileFilter: fileFilter
});

// Optional array upload - doesn't throw error if field is missing or not a file
export const uploadOptionalArray = (fieldName, maxCount) => {
  return (req, res, next) => {
    try {
      // Check if the request has multipart/form-data content type
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        // Not a multipart request, skip multer
        req.files = [];
        return next();
      }

      // Use .any() to accept all fields, then filter for the specific field name
      const lenientUpload = multer({
        storage: storage,
        limits: {
          fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880
        },
        fileFilter: (req, file, cb) => {
          // Only filter files that are actually files (have mimetype)
          // Allow all files through, we'll filter by fieldname later
          if (file.mimetype && file.mimetype.startsWith('image/')) {
            return cb(null, true);
          }
          // For non-image files or fields that aren't files, reject them
          // But don't throw an error - just skip them
          cb(null, false);
        }
      });

      const uploadMiddleware = lenientUpload.any();
      uploadMiddleware(req, res, (err) => {
        if (err) {
          // Log the error for debugging
          console.log('⚠️  Multer error:', err.message, err.code);
          
          // Ignore "Unexpected field" and similar errors
          if (err.code === 'LIMIT_UNEXPECTED_FILE' || 
              err.message?.includes('Unexpected field') ||
              err.message?.includes('Unexpected end of form') ||
              err.message?.includes('Unexpected')) {
            console.log('⚠️  Ignoring multer field error, continuing with empty files array...');
            req.files = [];
            return next();
          }
          
          // For other file-related errors (size, type), pass them along
          console.error('❌ Multer error (not ignored):', err);
          return next(err);
        }
        
        // Filter files to only include those with the expected field name
        if (req.files && Array.isArray(req.files)) {
          req.files = req.files.filter(file => file.fieldname === fieldName);
          // Limit to maxCount
          if (req.files.length > maxCount) {
            req.files = req.files.slice(0, maxCount);
          }
        } else {
          req.files = [];
        }
        
        next();
      });
    } catch (error) {
      console.error('❌ Error in uploadOptionalArray middleware:', error);
      req.files = [];
      next();
    }
  };
};

