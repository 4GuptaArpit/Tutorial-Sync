const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validate');

const {
  signup,
  login,
  googleLogin,
  logout,
  me,
  updateProfile,
  updatePassword,
  deleteAccount
} = require('../controllers/authController');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/google', googleLogin);
router.post('/logout', logout);
router.get('/google-client-id', (req, res) => {
  res.status(200).json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// Protected routes
router.get('/me', auth, me);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);
router.delete('/account', auth, deleteAccount);

module.exports = router;
