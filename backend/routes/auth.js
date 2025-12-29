const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');

// @route   POST /api/auth/login
// @desc    Role-based login (Admin: 2FA OTP, User: Direct)
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

      // === ADMIN: 2FA Flow ===
      if (user.role === 'admin') {
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
        console.log(`🔐 ADMIN LOGIN OTP FOR ${user.email}`);
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
            email: user.email,
            requiresOtp: true
          });
        } catch (err) {
          console.error('Email send error:', err.message);

          res.status(200).json({
            success: true,
            message: 'Email configuration pending. Check server console for OTP.',
            email: user.email,
            requiresOtp: true
          });
        }
      }
      // === USER: Direct Login (No OTP) ===
      else {
        const token = generateToken(user._id);

        res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            mustChangePassword: user.mustChangePassword
          },
          requiresOtp: false
        });
      }

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and return token (Step 2 - Admin only)
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

      const user = await User.findOne({ email }).select('+twoFactorCode +twoFactorCodeExpires');

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
        return res.status(400).json({ success: false, message: 'OTP not requested or expired' });
      }

      if (user.twoFactorCodeExpires < Date.now()) {
        return res.status(400).json({ success: false, message: 'OTP has expired' });
      }

      const isMatch = await bcrypt.compare(otp, user.twoFactorCode);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // Clear OTP
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpires = undefined;
      await user.save();

      const token = generateToken(user._id);

      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          mustChangePassword: user.mustChangePassword
        }
      });

    } catch (error) {
      console.error('Verify OTP error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Forgot password (Admin: send OTP, User: notify admin)
// @access  Public
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Please provide a valid email')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ success: false, message: 'No account found with this email' });
      }

      // === ADMIN: Send OTP for password reset ===
      if (user.role === 'admin') {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otp, salt);

        user.passwordResetToken = hashedOtp;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        console.log('\n==========================================');
        console.log(`🔑 PASSWORD RESET OTP FOR ${user.email}`);
        console.log(`CODE: ${otp}`);
        console.log('==========================================\n');

        const message = `Your password reset verification code is: ${otp}\n\nThis code expires in 10 minutes.`;

        try {
          await sendEmail({
            email: user.email,
            subject: 'CRM Password Reset Code',
            message
          });

          res.status(200).json({
            success: true,
            message: 'Password reset OTP sent to your email',
            email: user.email,
            isAdmin: true
          });
        } catch (err) {
          console.error('Email send error:', err.message);
          res.status(200).json({
            success: true,
            message: 'Check server console for password reset OTP',
            email: user.email,
            isAdmin: true
          });
        }
      }
      // === USER: Generate temp password and notify admin ===
      else {
        // Generate random temporary password
        const tempPassword = Math.random().toString(36).slice(-10) + Math.floor(Math.random() * 100);

        // Update user's password to temporary password
        user.password = tempPassword;
        user.mustChangePassword = true;
        await user.save();

        const adminEmail = process.env.EMAIL_USER;
        const message = `Password reset request from user:\n\nName: ${user.name}\nEmail: ${user.email}\n\n✅ A temporary password has been generated:\n\nTemporary Password: ${tempPassword}\n\nPlease provide this password to the user. They will be required to change it on first login.`;

        console.log('\n==========================================');
        console.log(`🔑 TEMPORARY PASSWORD for ${user.email}`);
        console.log(`Password: ${tempPassword}`);
        console.log('==========================================\n');

        try {
          await sendEmail({
            email: adminEmail,
            subject: `CRM - Password Reset Request from ${user.name}`,
            message
          });

          res.status(200).json({
            success: true,
            message: 'Your password has been reset. Please contact the administrator for your new temporary password.',
            isAdmin: false
          });
        } catch (err) {
          console.error('Email send error:', err.message);
          res.status(200).json({
            success: true,
            message: 'Password reset. Check server console for temporary password or contact administrator.',
            isAdmin: false
          });
        }
      }

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/verify-reset-otp
// @desc    Verify reset OTP (Admin only)
// @access  Public
router.post(
  '/verify-reset-otp',
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

      const user = await User.findOne({ email }).select('+passwordResetToken +passwordResetExpires');

      if (!user || user.role !== 'admin') {
        return res.status(401).json({ success: false, message: 'Invalid request' });
      }

      if (!user.passwordResetToken || !user.passwordResetExpires) {
        return res.status(400).json({ success: false, message: 'Reset OTP not requested or expired' });
      }

      if (user.passwordResetExpires < Date.now()) {
        return res.status(400).json({ success: false, message: 'Reset OTP has expired' });
      }

      const isMatch = await bcrypt.compare(otp, user.passwordResetToken);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid OTP' });
      }

      // Generate temporary token for password reset
      const resetToken = generateToken(user._id);

      res.status(200).json({
        success: true,
        resetToken,
        message: 'OTP verified. You can now reset your password.'
      });

    } catch (error) {
      console.error('Verify reset OTP error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/reset-password
// @desc    Reset password (Admin only, after OTP verification)
// @access  Private (requires resetToken)
router.post(
  '/reset-password',
  protect,
  [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password +passwordResetToken +passwordResetExpires');

      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Update password
      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.mustChangePassword = false;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password reset successful. Please login with your new password.'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
);

// @route   POST /api/auth/change-password
// @desc    Change password (forced or voluntary)
// @access  Private
router.post(
  '/change-password',
  protect,
  [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { currentPassword, newPassword } = req.body;

      const user = await User.findById(req.user.id).select('+password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // If not forced change, verify current password
      if (!user.mustChangePassword) {
        if (!currentPassword) {
          return res.status(400).json({ success: false, message: 'Current password is required' });
        }

        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }
      }

      // Update password
      user.password = newPassword;
      user.mustChangePassword = false;
      await user.save();

      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });

    } catch (error) {
      console.error('Change password error:', error);
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to create users' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role,
        isEmailVerified: true,
        mustChangePassword: true // Force password change on first login
      });

      const message = `Hello ${name},\n\nYour account has been created by the administrator.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nYou will be required to change your password on first login.`;

      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to CRM - Account Created',
          message
        });
      } catch (err) {
        console.error('Welcome email failed:', err);
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
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;
