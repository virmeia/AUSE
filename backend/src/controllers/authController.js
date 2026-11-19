const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const logActivity = require('../utils/activityLogger');

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// @desc    Register a new customer account
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { full_name, email, password, phone_number, default_address, agreed_terms } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'Full name, email, and password are required.' });
  }

  if (!agreed_terms) {
    return res.status(400).json({ message: 'You must agree to the Terms & Conditions.' });
  }

  try {
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone_number, default_address, role, agreed_terms)
       VALUES (?, ?, ?, ?, ?, 'customer', 1)`,
      [full_name, email, password_hash, phone_number || null, default_address || null]
    );

    const newUser = {
      user_id: result.insertId,
      full_name,
      email,
      phone_number: phone_number || '',
      default_address: default_address || '',
      role: 'customer',
    };

    await logActivity(
      newUser.user_id,
      'Account Registered',
      'Authentication',
      `New customer account created for ${full_name} (${email}).`
    );

    res.status(201).json({
      message: 'Registration successful.',
      token: generateToken(newUser),
      user: newUser,
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await logActivity(
      user.user_id,
      'User Login',
      'Authentication',
      `${user.full_name} (${user.role}) signed into the system.`
    );

    res.json({
      message: 'Login successful.',
      token: generateToken(user),
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number || '',
        default_address: user.default_address || '',
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, phone_number, default_address, role, created_at FROM users WHERE user_id = ?',
      [req.user.user_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error fetching profile.' });
  }
};

// @desc    Update logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { full_name, phone_number, default_address } = req.body;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required.' });
  }

  try {
    await pool.query(
      'UPDATE users SET full_name = ?, phone_number = ?, default_address = ? WHERE user_id = ?',
      [full_name, phone_number || null, default_address || null, req.user.user_id]
    );

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, phone_number, default_address, role FROM users WHERE user_id = ?',
      [req.user.user_id]
    );

    await logActivity(
      req.user.user_id,
      'Profile Updated',
      'Account',
      `${full_name} updated their contact/service address details.`
    );

    res.json({
      message: 'Profile updated successfully.',
      user: updated[0],
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};