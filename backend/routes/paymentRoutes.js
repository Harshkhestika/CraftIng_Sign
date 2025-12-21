import express from 'express';
import Stripe from 'stripe';
import Order from '../models/Order.js';
import Customer from '../models/Customer.js';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Check if Stripe is configured
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️  STRIPE_SECRET_KEY not set. Payment functionality will not work.');
}

// @route   POST /api/payments/create-intent
// @desc    Create payment intent
// @access  Public
router.post('/create-intent', [
  body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least 0.50'),
  body('currency').isIn(['usd', 'eur', 'gbp', 'inr']).withMessage('Invalid currency')
], async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please set STRIPE_SECRET_KEY in environment variables.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { amount, currency = 'usd' } = req.body;

    // Convert amount to cents (Stripe uses smallest currency unit)
    const amountInCents = Math.round(amount * 100);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      metadata: {
        integration_check: 'accept_a_payment',
      },
    });

    console.log(`✅ Payment intent created: ${paymentIntent.id} for $${amount} ${currency}`);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
});

// @route   POST /api/payments/confirm
// @desc    Confirm payment and create order
// @access  Public
router.post('/confirm', [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('customer.name').notEmpty().withMessage('Customer name is required'),
  body('customer.email').isEmail().withMessage('Valid email is required'),
  body('customer.phone').notEmpty().withMessage('Phone is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('total').isFloat({ min: 0 }).withMessage('Total must be a positive number')
], async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ 
        message: 'Payment gateway not configured. Please set STRIPE_SECRET_KEY in environment variables.' 
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentIntentId, customer, items, total, shipping } = req.body;

    // Verify payment intent status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    console.log(`🔍 Verifying payment intent: ${paymentIntentId}, Status: ${paymentIntent.status}`);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ 
        message: 'Payment not completed', 
        status: paymentIntent.status 
      });
    }

    // Generate order ID
    const orderCount = await Order.countDocuments();
    const orderId = `ORD-${String(orderCount + 1).padStart(3, '0')}`;

    // Create order
    const order = new Order({
      orderId,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city || '',
        country: customer.country || '',
      },
      items: items.map(item => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor,
        customization: item.customization,
      })),
      total,
      status: 'Processing', // Order confirmed after payment
      paymentStatus: 'Complete',
      notes: shipping ? `Shipping: ${shipping.method}` : '',
    });

    await order.save();

    // Update or create customer
    let customerDoc = await Customer.findOne({ email: customer.email });
    
    if (customerDoc) {
      customerDoc.totalOrders += 1;
      customerDoc.totalSpent += total;
      customerDoc.lastOrderDate = new Date();
      customerDoc.paymentStatus = 'Complete';
      if (customer.name) customerDoc.customerName = customer.name;
      if (customer.phone) customerDoc.phone = customer.phone;
      if (customer.country) customerDoc.location = customer.country;
    } else {
      customerDoc = new Customer({
        customerId: `CUST-${String(await Customer.countDocuments() + 1).padStart(3, '0')}`,
        customerName: customer.name,
        email: customer.email,
        phone: customer.phone || '',
        location: customer.country || '',
        totalOrders: 1,
        totalSpent: total,
        lastOrderDate: new Date(),
        paymentStatus: 'Complete'
      });
    }

    await customerDoc.save();

    console.log(`✅ Order created: ${order.orderId} for customer: ${customer.email}`);

    res.status(201).json({
      success: true,
      order,
      message: 'Order confirmed successfully'
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    res.status(500).json({ message: 'Error confirming payment', error: error.message });
  }
});

export default router;

