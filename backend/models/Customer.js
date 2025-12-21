import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: {
    type: String,
    unique: true,
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  lastOrderDate: {
    type: Date,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Complete', 'Failed'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Index for faster queries
customerSchema.index({ email: 1 });
customerSchema.index({ status: 1 });

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;

