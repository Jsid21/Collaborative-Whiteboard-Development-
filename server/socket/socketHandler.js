const Room = require('../models/room');

// Store active connections per room
const activeRooms = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    // Join room
    socket.on('join-room', async (roomId) => {
      try {
        const normalizedRoomId = roomId.toUpperCase();
        
        // Leave previous room if any
        if (socket.currentRoom) {
          socket.leave(socket.currentRoom);
          updateRoomUserCount(socket.currentRoom);
        }
        
        // Join new room
        socket.join(normalizedRoomId);
        socket.currentRoom = normalizedRoomId;
        
        // Initialize room in memory if needed
        if (!activeRooms.has(normalizedRoomId)) {
          activeRooms.set(normalizedRoomId, new Set());
        }
        activeRooms.get(normalizedRoomId).add(socket.id);
        
        // Get room data from database
        const room = await Room.findOne({ roomId: normalizedRoomId });
        if (room) {
          // Send existing drawing data to new user
          socket.emit('load-drawing', room.drawingData);
        }
        
        // Update user count
        updateRoomUserCount(normalizedRoomId);
        
        console.log(`User ${socket.id} joined room ${normalizedRoomId}`);
      } catch (error) {
        console.error('Error joining room:', error);
      }
    });
    
    // Handle cursor movement
    socket.on('cursor-move', (data) => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('cursor-move', {
          userId: socket.id,
          x: data.x,
          y: data.y
        });
      }
    });
    
    // Handle drawing start
    socket.on('draw-start', async (data) => {
      if (socket.currentRoom) {
        const drawingData = {
          userId: socket.id,
          x: data.x,
          y: data.y,
          color: data.color,
          width: data.width
        };
        
        socket.to(socket.currentRoom).emit('draw-start', drawingData);
      }
    });
    
    // Handle drawing movement
    socket.on('draw-move', async (data) => {
      if (socket.currentRoom) {
        const drawingData = {
          userId: socket.id,
          x: data.x,
          y: data.y,
          color: data.color,
          width: data.width
        };
        
        socket.to(socket.currentRoom).emit('draw-move', drawingData);
      }
    });
    
    // Handle drawing end
    socket.on('draw-end', async (data) => {
      if (socket.currentRoom) {
        try {
          // Save drawing stroke to database
          const room = await Room.findOne({ roomId: socket.currentRoom });
          if (room) {
            const drawingCommand = {
              type: 'stroke',
              data: {
                path: data.path,
                color: data.color,
                width: data.width
              }
            };
            
            room.drawingData.push(drawingCommand);
            room.lastActivity = new Date();
            await room.save();
          }
          
          socket.to(socket.currentRoom).emit('draw-end', {
            userId: socket.id,
            path: data.path,
            color: data.color,
            width: data.width
          });
        } catch (error) {
          console.error('Error saving drawing:', error);
        }
      }
    });
    
    // Handle clear canvas
    socket.on('clear-canvas', async () => {
      if (socket.currentRoom) {
        try {
          // Clear drawing data in database
          const room = await Room.findOne({ roomId: socket.currentRoom });
          if (room) {
            room.drawingData = [];
            room.lastActivity = new Date();
            await room.save();
          }
          
          // Broadcast clear to all users in room
          io.to(socket.currentRoom).emit('clear-canvas');
        } catch (error) {
          console.error('Error clearing canvas:', error);
        }
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      
      if (socket.currentRoom) {
        // Remove from active rooms
        if (activeRooms.has(socket.currentRoom)) {
          activeRooms.get(socket.currentRoom).delete(socket.id);
          if (activeRooms.get(socket.currentRoom).size === 0) {
            activeRooms.delete(socket.currentRoom);
          }
        }
        
        // Update user count
        updateRoomUserCount(socket.currentRoom);
        
        // Remove cursor from other users' screens
        socket.to(socket.currentRoom).emit('user-left', socket.id);
      }
    });
    
    // Update room user count
    function updateRoomUserCount(roomId) {
      const userCount = activeRooms.has(roomId) ? activeRooms.get(roomId).size : 0;
      io.to(roomId).emit('user-count', userCount);
    }
  });
};

module.exports = socketHandler;