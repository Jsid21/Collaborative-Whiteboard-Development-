const mongoose = require('mongoose');

const drawingCommandSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['stroke', 'clear']
  },
  data: {
    type: Object,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  drawingData: [drawingCommandSchema]
});

// Auto-delete rooms older than 24 hours
roomSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('Room', roomSchema);