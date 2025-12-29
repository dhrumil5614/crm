const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/auth/login
// @desc    Login user (Step 1: Validate creds & send OTP)
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check if user exists (include password field)
      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check password
      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Hash OTP
      const salt = await bcrypt.genSalt(10);
      const hashedOtp = await bcrypt.hash(otp, salt);

      // Save OTP to user (expires in 10 minutes)
      user.twoFactorCode = hashedOtp;
      user.twoFactorCodeExpires = Date.now() + 10 * 60 * 1000;
      await user.save();

      // === CONSOLE LOGGING FOR DEVELOPMENT ===
      console.log('\n==========================================');
      console.log(`🔐 LOGIN OTP FOR ${user.email}`);
      console.log(`CODE: ${otp}`);
      console.log(`Expires in 10 minutes`);
      console.log('==========================================\n');

      // Send OTP via email
      const message = `Your login verification code is: ${otp}\n\nThis code expires in 10 minutes.`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'CRM Login Verification Code',
          message
        });

        res.status(200).json({
          success: true,
          message: 'OTP sent to email',
          email: user.email // Send back email for frontend context if needed
        });
      } catch (err) {
        console.error('Email send error:', err.message);

        // Don't fail the login - allow user to use console OTP
        res.status(200).json({
          success: true,
          message: 'Email configuration pending. Check server console for OTP.',
          email: user.email
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return token (Step 2)
// @access  Public
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, otp } = req.body;

      // Find user with 2FA fields
      const user = await User.findOne({ email }).select('+twoFactorCode +twoFactorCodeExpires');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      // Check fields existence
      if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
        return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
      }

      // Check expiry
      if (user.twoFactorCodeExpires < Date.now()) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
      }

      // Verify OTP
      const isMatch = await bcrypt.compare(otp, user.twoFactorCode);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // Clear OTP
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpires = undefined;
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/create-user
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post(
  '/create-user',
  protect,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['user', 'admin']).withMessage('Role must be user or admin')
  ],
  async (req, res) => {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create users' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role,
        isEmailVerified: true // Admin created, so verified
      });

      // Send email to new user
      const message = `Hello ${name},\n\nYour account has been created by the administrator.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease login and change your password immediately.`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to CRM - Account Created',
          message
        });
      } catch (err) {
        console.error('Welcome email failed:', err);
        // Don't fail the request, just log it
      }

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
