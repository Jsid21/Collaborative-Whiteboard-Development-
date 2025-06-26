import React, { useState, useCallback } from 'react';
import DrawingCanvas from './DrawingCanvas';
import Toolbar from './Toolbar';
import UserCursors from './UserCursors';
import { LogOut, Users } from 'lucide-react';
import './Whiteboard.css';

const Whiteboard = ({ socket, roomId, onLeaveRoom, initialDrawingData }) => {
  const [currentTool, setCurrentTool] = useState({
    color: '#ffffff',
    width: 3
  });
  const [cursors, setCursors] = useState({});
  const [userCount, setUserCount] = useState(0);

  // Handle socket events for cursors
  React.useEffect(() => {
    if (!socket) return;

    const handleCursorMove = (data) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: { x: data.x, y: data.y }
      }));
    };

    const handleUserLeft = (userId) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[userId];
        return newCursors;
      });
    };

    const handleUserCount = (count) => {
      setUserCount(count);
    };

    socket.on('cursor-move', handleCursorMove);
    socket.on('user-left', handleUserLeft);
    socket.on('user-count', handleUserCount);

    return () => {
      socket.off('cursor-move', handleCursorMove);
      socket.off('user-left', handleUserLeft);
      socket.off('user-count', handleUserCount);
    };
  }, [socket]);

  const handleCursorMove = useCallback((x, y) => {
    if (socket) {
      socket.emit('cursor-move', { x, y });
    }
  }, [socket]);

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
    }
    onLeaveRoom();
  };

  return (
    <div className="whiteboard">
      <div className="whiteboard-header">
        <div className="room-info">
          <span className="room-id">Room: {roomId}</span>
          <div className="user-indicator">
            <Users size={16} />
            <span>{userCount}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLeaveRoom}
          className="leave-btn"
          title="Leave room"
        >
          <LogOut size={18} />
          <span>Leave</span>
        </button>
      </div>

      <div className="whiteboard-content">
        <Toolbar 
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          socket={socket}
        />
        
        <div className="canvas-container">
          <DrawingCanvas
            socket={socket}
            currentTool={currentTool}
            onCursorMove={handleCursorMove}
            initialDrawingData={initialDrawingData}
          />
          <UserCursors cursors={cursors} />
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;