const jwt = require('jsonwebtoken');

// In-memory token blacklist (should match the one in auth routes)
const tokenBlacklist = new Set();

const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Check if token is blacklisted
    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ 
        error: 'Token has been revoked' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return res.status(401).json({ 
        error: 'Token has expired' 
      });
    }

    // Add admin info to request
    req.admin = decoded;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token has expired' 
      });
    }
    
    return res.status(500).json({ 
      error: 'Server error during authentication' 
    });
  }
};

// Function to add token to blacklist (used by logout)
auth.blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

// Function to check if token is blacklisted
auth.isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

module.exports = auth;