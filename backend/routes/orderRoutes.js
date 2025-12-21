import express from 'express';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import { protect, admin } from '../middleware/auth.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.productId', 'name image')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name image price');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Public (can be protected if needed)
router.post('/', [
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.email').isEmail().withMessage('Valid email is required'),
  body('customer.phone').notEmpty().withMessage('Phone is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Generate order ID
    const orderCount = await Order.countDocuments();
    const orderId = `ORD-${String(orderCount + 1).padStart(3, '0')}`;

    const order = new Order({
      orderId,
      ...req.body
    });

    await order.save();

    // Update or create customer
    let customer = await Customer.findOne({ email: req.body.customer.email });
    
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += req.body.total;
      customer.lastOrderDate = new Date();
      customer.paymentStatus = req.body.paymentStatus || 'Pending';
      if (req.body.customer.name) customer.customerName = req.body.customer.name;
      if (req.body.customer.phone) customer.phone = req.body.customer.phone;
      if (req.body.customer.location) customer.location = req.body.customer.location;
    } else {
      customer = new Customer({
        customerId: `CUST-${String(await Customer.countDocuments() + 1).padStart(3, '0')}`,
        customerName: req.body.customer.name,
        email: req.body.customer.email,
        phone: req.body.customer.phone || '',
        location: req.body.customer.country || '',
        totalOrders: 1,
        totalSpent: req.body.total,
        lastOrderDate: new Date(),
        paymentStatus: req.body.paymentStatus || 'Pending'
      });
    }

    await customer.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/:id/status', protect, admin, [
  body('status').isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    await order.save();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});

export default router;

