import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['welcome', 'seating', 'bar', 'menucards', 'placecards', 'thankyou', 'tabledecor', 'tablenumbers']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive']
  },
  originalPrice: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: ''
  },
  images: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  isBestseller: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: false
  },
  features: [{
    size: String,
    color: String,
    price: Number
  }],
  featureType: {
    type: String,
    enum: ['size', 'color', 'both'],
    default: 'size'
  },
  stock: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
productSchema.index({ category: 1, active: 1 });
productSchema.index({ name: 'text', description: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;

