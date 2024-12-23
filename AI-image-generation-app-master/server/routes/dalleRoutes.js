import express from 'express';
import { Configuration, OpenAIApi } from 'openai';
import authMiddleware from '../middleware/authMiddleware.js';
import Usage from '../mongodb/models/usage.js';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const usage = await Usage.findOne({ userId: req.user.id });

    if (!usage) {
      return res.status(403).json({ message: 'No usage record found' });
    }

    const currentDate = new Date();
    if (!usage.subscription && usage.usageCount >= 200) {
      return res.status(403).json({ message: 'Usage limit exceeded for non-subscribers' });
    }
    if (usage.subscription && currentDate > new Date(usage.subscriptionEndDate)) {
      usage.subscription = false;
      await usage.save();
      return res.status(403).json({ message: 'Subscription has expired' });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const aiResponse = await openai.createImage({
      prompt,
      n: 1,
      size: '256x256',
      response_format: 'b64_json',
    });

    const imageBase64 = aiResponse.data.data[0].b64_json;
    const uploadResponse = await cloudinary.uploader.upload(`data:image/png;base64,${imageBase64}`);

    usage.usageCount += 1;
    await usage.save();

    res.status(200).json({ photo: uploadResponse.url });
  } catch (error) {
    console.error('Error generating image:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
