// backend/src/controllers/applianceController.js
const pool = require('../config/db');

// @desc    Get saved appliances for logged-in customer
// @route   GET /api/appliances
// @access  Private (Customer)
const getMyAppliances = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customer_appliances WHERE customer_id = ? ORDER BY created_at DESC',
      [req.user.user_id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Get appliances error:', err);
    res.status(500).json({ message: 'Failed to fetch saved appliances.' });
  }
};

// @desc    Save a new appliance to customer's My Appliances garage
// @route   POST /api/appliances
// @access  Private (Customer)
const addAppliance = async (req, res) => {
  try {
    const { appliance_type, brand_model, serial_number, purchase_year } = req.body;
    if (!appliance_type) {
      return res.status(400).json({ message: 'Appliance type is required.' });
    }

    const [result] = await pool.query(
      `INSERT INTO customer_appliances (customer_id, appliance_type, brand_model, serial_number, purchase_year)
       VALUES (?, ?, ?, ?, ?)`,
      [
        req.user.user_id,
        appliance_type.trim(),
        (brand_model || '').trim() || null,
        (serial_number || '').trim() || null,
        (purchase_year || '').trim() || null,
      ]
    );

    res.status(201).json({
      message: 'Appliance saved to your garage.',
      appliance_id: result.insertId,
    });
  } catch (err) {
    console.error('Add appliance error:', err);
    res.status(500).json({ message: 'Failed to save appliance.' });
  }
};

// @desc    Delete a saved appliance
// @route   DELETE /api/appliances/:id
// @access  Private (Customer)
const deleteAppliance = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM customer_appliances WHERE appliance_id = ? AND customer_id = ?',
      [req.params.id, req.user.user_id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Saved appliance not found.' });
    }
    res.json({ message: 'Appliance removed.' });
  } catch (err) {
    console.error('Delete appliance error:', err);
    res.status(500).json({ message: 'Failed to remove appliance.' });
  }
};

module.exports = { getMyAppliances, addAppliance, deleteAppliance };
