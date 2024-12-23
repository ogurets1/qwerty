import jwt from 'jsonwebtoken';
import User from '../mongodb/models/user.js';
import Usage from '../mongodb/models/usage.js';

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).send({ error: 'Authorization header is missing' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).send({ error: 'User not found' });
    }
    req.user = user;

    const usage = await Usage.findOne({ userId: user._id });
    if (usage) {
      usage.resetUsageCount();
      await usage.save();
    }

    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default authMiddleware;
