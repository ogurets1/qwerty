import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  username: { type: String, required: true },
  prompt: { type: String, required: true },
  photo: { type: String, required: true },
}, { timestamps: true });

postSchema.index({ username: 1, prompt: 1, photo: 1 }, { unique: true });

const Post = mongoose.model('Post', postSchema);

export default Post;
