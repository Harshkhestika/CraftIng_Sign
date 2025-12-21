import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user (admin only for now)
// @access  Private/Admin (can be made public if needed)
router.post('/register', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, isAdmin } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      email: normalizedEmail,
      password,
      name,
      isAdmin: isAdmin || false
    });

    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    console.log(`Login attempt for: ${normalizedEmail}`);

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log(`Login failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    console.log(`User found: ${user.email}, Active: ${user.active}, IsAdmin: ${user.isAdmin}`);

    // Check if user is active
    if (!user.active) {
      console.log(`Login failed: Account inactive for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    console.log(`Password match: ${isMatch}`);
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for email: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    console.log(`Login successful for email: ${normalizedEmail}, isAdmin: ${user.isAdmin}`);

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// @route   GET /api/auth/check-admin
// @desc    Check if admin user exists (for debugging)
// @access  Public
router.get('/check-admin', async (req, res) => {
  try {
    const adminUser = await User.findOne({ email: 'admin@craftingsign.com' });
    if (adminUser) {
      res.json({
        exists: true,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin,
        active: adminUser.active,
        name: adminUser.name
      });
    } else {
      res.json({
        exists: false,
        message: 'Admin user not found. Run: npm run create-admin'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin', error: error.message });
  }
});

export default router;
