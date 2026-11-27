const jwt = require('jsonwebtoken');

// Verify JWT and attach user payload to req.user
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, role, email }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token.' });
  }
};

// Restrict access to Admin accounts only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Restrict access to Technician accounts only
const technicianOnly = (req, res, next) => {
  if (req.user && req.user.role === 'technician') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Technician privileges required.' });
  }
};

module.exports = { protect, adminOnly, technicianOnly };