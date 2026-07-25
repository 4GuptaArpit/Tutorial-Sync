const User = require('../models/User');
const Project = require('../models/Project');
const ChatHistory = require('../models/ChatHistory');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Token creation helper
const createToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d'
  });
};

// Cookie configuration helper
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  res.cookie('token', token, cookieOptions);
};

const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username is already taken' });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      authProvider: 'local'
    });

    await user.save();

    // Create token & cookie
    const token = createToken(user._id, user.email);
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Handle account collision check (Google auth user trying local password login)
    if (user.authProvider === 'google') {
      return res.status(400).json({
        message: 'This email is registered via Google Sign-In. Please sign in with Google.'
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Set token & cookie
    const token = createToken(user._id, user.email);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: 'OAuth credential token is required' });
    }

    // Verify Google ID Token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (err) {
      console.error('Google token verification error:', err.message);
      return res.status(400).json({ message: 'Google authentication token verification failed' });
    }

    const payload = ticket.getPayload();
    const { email, sub: googleId, name, picture } = payload;

    // Find user by email or googleId
    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (user) {
      // Local account collision check (email exists but was local sign up)
      if (user.authProvider === 'local') {
        return res.status(400).json({
          message: 'An account with this email is already registered using a password. Please sign in using your email and password.'
        });
      }

      // Update googleId if missing
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new Google User
      // Generate clean unique username based on Google name
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
      let uniqueUsername = sanitizedName || 'user';
      let checkUser = await User.findOne({ username: uniqueUsername });
      
      let counter = 1;
      while (checkUser) {
        uniqueUsername = `${sanitizedName}${counter}`;
        checkUser = await User.findOne({ username: uniqueUsername });
        counter++;
      }

      user = new User({
        username: uniqueUsername,
        email,
        googleId,
        authProvider: 'google',
        avatar: picture || undefined
      });

      await user.save();
    }

    // Set token & cookie
    const token = createToken(user._id, user.email);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Google login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent Google OAuth profiles from changing email/username since Google manages them
    if (user.authProvider === 'google' && email && email !== user.email) {
      return res.status(400).json({ message: 'Google account email cannot be changed' });
    }

    // Check unique locks
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already taken' });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      }
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.authProvider === 'google') {
      return res.status(400).json({ message: 'Google account passwords must be managed through Google.' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    // Hash and save new password (save hook hashes automatically)
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cascade delete user projects
    await Project.deleteMany({ user: userId });

    // Cascade delete user chat history
    await ChatHistory.deleteMany({ user: userId });

    // Delete user
    await User.findByIdAndDelete(userId);

    // Clear auth cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    });

    res.status(200).json({ message: 'User account and all associated projects deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  googleLogin,
  logout,
  me,
  updateProfile,
  updatePassword,
  deleteAccount
};
