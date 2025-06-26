const express = require('express');
const Room = require('../models/room');
const router = express.Router();

// Generate random room ID
const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Join or create room
router.post('/join', async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!roomId || roomId.length < 4 || roomId.length > 8) {
      return res.status(400).json({ 
        error: 'Room ID must be between 4-8 characters' 
      });
    }

    const normalizedRoomId = roomId.toUpperCase();
    
    // Find existing room or create new one
    let room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      room = new Room({
        roomId: normalizedRoomId,
        drawingData: []
      });
      await room.save();
    } else {
      // Update last activity
      room.lastActivity = new Date();
      await room.save();
    }

    res.json({
      success: true,
      roomId: room.roomId,
      drawingData: room.drawingData
    });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Get room info
router.get('/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;
    const normalizedRoomId = roomId.toUpperCase();
    
    const room = await Room.findOne({ roomId: normalizedRoomId });
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    res.json({
      roomId: room.roomId,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
      drawingData: room.drawingData
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({ error: 'Failed to get room' });
  }
});

module.exports = router;