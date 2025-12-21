import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { upload, uploadOptionalArray } from '../middleware/upload.js';
import { body, validationResult } from 'express-validator';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Validation middleware
const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').isIn(['welcome', 'seating', 'bar', 'menucards', 'placecards', 'thankyou', 'tabledecor', 'tablenumbers']).withMessage('Invalid category'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number')
];

// @route   GET /api/products
// @desc    Get all products (public)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, active } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (active !== 'false') {
      query.active = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product (public)
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: 'Error fetching product', error: error.message });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', protect, admin, upload.array('images', 10), validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, category, price, originalPrice, description, isBestseller, isNew, features, featureType, stock } = req.body;

    // Construct full URL for images
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `${req.hostname}:${process.env.PORT || 5000}`;
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      imageUrls = req.files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
      console.log(`✅ ${req.files.length} image(s) uploaded`);
    } else {
      console.log('⚠️  No image files provided');
    }

    const productData = {
      name,
      category,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      description: description || '',
      isBestseller: isBestseller === 'true' || isBestseller === true,
      isNew: isNew === 'true' || isNew === true,
      featureType: featureType || 'size',
      stock: stock ? parseInt(stock) : 0
    };

    // Set primary image and images array
    if (imageUrls.length > 0) {
      productData.image = imageUrls[0];
      productData.images = imageUrls;
    }

    if (features) {
      try {
        productData.features = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        productData.features = [];
      }
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, admin, uploadOptionalArray('images', 10), validateProduct, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, category, price, originalPrice, description, isBestseller, isNew, features, featureType, stock, active, existingImages } = req.body;

    // Update fields
    product.name = name;
    product.category = category;
    product.price = parseFloat(price);
    product.originalPrice = originalPrice ? parseFloat(originalPrice) : null;
    product.description = description || '';
    product.isBestseller = isBestseller === 'true' || isBestseller === true;
    product.isNew = isNew === 'true' || isNew === true;
    product.featureType = featureType || 'size';
    product.stock = stock ? parseInt(stock) : product.stock;
    if (active !== undefined) {
      product.active = active === 'true' || active === true;
    }

    // Handle new image uploads
    const protocol = req.protocol || 'http';
    const host = req.get('host') || `${req.hostname}:${process.env.PORT || 5000}`;
    
    if (req.files && req.files.length > 0) {
      console.log(`✅ Updating product with ${req.files.length} new image(s)`);
      
      // Delete old images if they exist
      const oldImages = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
      oldImages.forEach(oldImageUrl => {
        if (oldImageUrl) {
          let oldImagePath;
          if (oldImageUrl.startsWith('http')) {
            const urlParts = oldImageUrl.split('/uploads/');
            if (urlParts.length > 1) {
              oldImagePath = path.join(__dirname, '..', 'uploads', urlParts[1]);
            }
          } else if (oldImageUrl.startsWith('/uploads/')) {
            oldImagePath = path.join(__dirname, '..', oldImageUrl);
          }
          
          if (oldImagePath && fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
            console.log(`🗑️  Deleted old image: ${oldImagePath}`);
          }
        }
      });
      
      // Set new images
      const newImageUrls = req.files.map(file => `${protocol}://${host}/uploads/${file.filename}`);
      product.images = newImageUrls;
      product.image = newImageUrls[0];
      console.log(`✅ New images set: ${newImageUrls.length} image(s)`);
    } else if (existingImages) {
      // If existingImages array is provided in body (existing URLs), use those
      try {
        const imagesArray = typeof existingImages === 'string' ? JSON.parse(existingImages) : existingImages;
        if (Array.isArray(imagesArray) && imagesArray.length > 0) {
          product.images = imagesArray;
          product.image = imagesArray[0];
          console.log(`✅ Updated existing images: ${imagesArray.length} image(s)`);
        }
      } catch (e) {
        console.log('⚠️  Could not parse existingImages array, keeping existing images');
      }
    } else {
      console.log('⚠️  No new images provided, keeping existing images');
    }

    // Update features
    if (features) {
      try {
        product.features = typeof features === 'string' ? JSON.parse(features) : features;
      } catch (e) {
        // Keep existing features if parsing fails
      }
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete associated image
    if (product.image && product.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
});

export default router;

