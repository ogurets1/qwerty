import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../mongodb/models/user.js';
import authMiddleware from '../middleware/authMiddleware.js';
import Usage from '../mongodb/models/usage.js';

const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log('Register request:', { username, email, password });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
    console.log('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, userId: user._id });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Получение профиля пользователя
// Получение профиля пользователя
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const usage = await Usage.findOne({ userId: user._id });
    const userProfile = {
      username: user.username,
      email: user.email,
      subscription: usage ? usage.subscription : false,
      subscriptionEndDate: usage ? usage.subscriptionEndDate : null
    };

    res.json({ user: userProfile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Подписка пользователя
router.post('/subscribe', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const subscriptionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let usage = await Usage.findOne({ userId });

    if (usage) {
      usage.subscription = true;
      usage.subscriptionEndDate = subscriptionEndDate;
    } else {
      usage = new Usage({
        userId,
        subscription: true,
        subscriptionEndDate,
      });
    }
    await usage.save();

    const user = await User.findById(userId);
    user.subscription = true;
    user.subscriptionEndDate = subscriptionEndDate;
    await user.save();

    return res.json({ message: 'Subscription activated', user });
  } catch (error) {
    console.error('Error subscribing user:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error subscribing user' });
    }
  }
});

router.post('/cancel-subscription', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    let usage = await Usage.findOne({ userId });

    if (usage) {
      usage.subscription = false;
      usage.subscriptionEndDate = null;
      await usage.save();
    }

    const user = await User.findById(userId);
    user.subscription = false;
    user.subscriptionEndDate = null;
    await user.save();

    return res.json({ message: 'Subscription canceled', user });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    if (!res.headersSent) {
      return res.status(500).json({ message: 'Error canceling subscription' });
    }
  }
});

export default router;
