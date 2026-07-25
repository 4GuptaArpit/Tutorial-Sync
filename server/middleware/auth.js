const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get token from cookie parser
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        message: 'Authentication failed. Access denied, token is missing.' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user metadata to request context
    req.user = {
      id: decoded.id,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // Clear invalid token cookie to keep state clean
    res.clearCookie('token');
    
    return res.status(401).json({ 
      message: 'Session expired or invalid token. Please log in again.' 
    });
  }
};

module.exports = auth;
