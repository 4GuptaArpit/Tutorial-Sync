const { body, validationResult } = require('express-validator');

// Error helper returning validation messages in a clean structure
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const validateSignup = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter and one number'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

const validateProject = [
  body('type')
    .trim()
    .notEmpty().withMessage('Project type is required')
    .isIn(['tutorial-refresh', 'tech-guide']).withMessage('Invalid project type'),
  
  body('title')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters'),
  
  body('sourceUrl')
    .optional({ checkFalsy: true })
    .trim()
    .isURL().withMessage('Must be a valid URL'),
  
  body('topic')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 100 }).withMessage('Topic cannot exceed 100 characters'),
  
  handleValidationErrors
];

const validateChat = [
  body('content')
    .trim()
    .notEmpty().withMessage('Message content cannot be empty')
    .isLength({ max: 5000 }).withMessage('Message cannot exceed 5000 characters'),
  
  handleValidationErrors
];

module.exports = {
  validateSignup,
  validateLogin,
  validateProject,
  validateChat
};
