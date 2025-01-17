import express from 'express';
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import Post from '../mongodb/models/post.js';

dotenv.config();

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Получение всех постов
router.route('/').get(async (req, res) => {
  try {
    const posts = await Post.find({});
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ success: false, message: 'Fetching posts failed, please try again' });
  }
});

// Создание нового поста
router.route('/').post(async (req, res) => {
  try {
    const { username, prompt, photo } = req.body;

    if (!username || !prompt || !photo) {
      console.error('Validation error:', { username, prompt, photo });
      return res.status(400).json({ success: false, message: 'Username, prompt, and photo are required' });
    }

    const photoUrl = await cloudinary.uploader.upload(photo);

    const newPost = await Post.create({
      username,
      prompt,
      photo: photoUrl.url,
    });

    res.status(201).json({ success: true, data: newPost });
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ success: false, message: 'Unable to create a post, please try again' });
  }
});

export default router;
