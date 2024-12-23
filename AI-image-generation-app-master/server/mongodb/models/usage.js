import mongoose from 'mongoose';

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  usageCount: {
    type: Number,
    required: true,
    default: 0,
  },
  subscription: {
    type: Boolean,
    default: false,
  },
  subscriptionEndDate: {
    type: Date,
  },
});

// Метод для сброса счетчика использования
usageSchema.methods.resetUsageCount = function () {
  this.usageCount = 0;
};
const Usage = mongoose.model('Usage', usageSchema);

export default Usage;
