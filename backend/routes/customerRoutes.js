import express from 'express';
import Customer from '../models/Customer.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/customers
// @desc    Get all customers
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const customers = await Customer.find(query).sort({ createdAt: -1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
  try {
    const customer = await Customer.findOne({ customerId: req.params.id });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
});

export default router;

