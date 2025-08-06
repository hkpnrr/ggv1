import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'The provided token is invalid or expired'
      });
    }

    // Get user from database
    User.findById(decoded.userId)
      .select('name email avatar bio location')
      .then(user => {
        if (!user) {
          return res.status(404).json({ 
            error: 'User not found',
            message: 'The user associated with this token no longer exists'
          });
        }

        req.user = user;
        next();
      })
      .catch(err => {
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Error retrieving user information'
        });
      });
  });
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    // Get user from database
    User.findById(decoded.userId)
      .select('name email avatar bio location')
      .then(user => {
        req.user = user;
        next();
      })
      .catch(err => {
        req.user = null;
        next();
      });
  });
};