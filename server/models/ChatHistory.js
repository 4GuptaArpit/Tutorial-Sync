const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  hasCode: {
    type: Boolean,
    default: false
  }
});

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    messages: [messageSchema]
  },
  {
    timestamps: true
  }
);

// Compound index to guarantee unique chat logs per user-project pair
chatHistorySchema.index({ user: 1, project: 1 }, { unique: true });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
