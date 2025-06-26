import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import RoomJoin from './components/RoomJoin';
import Whiteboard from './components/Whiteboard';
import './App.css';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [drawingData, setDrawingData] = useState([]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from server');
    });

    newSocket.on('user-count', (count) => {
      setUserCount(count);
    });

    newSocket.on('load-drawing', (data) => {
      setDrawingData(data);
    });

    return () => newSocket.close();
  }, []);

  const joinRoom = (roomId, initialDrawingData) => {
    if (socket) {
      socket.emit('join-room', roomId);
      setCurrentRoom(roomId);
      setDrawingData(initialDrawingData || []);
    }
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
    setDrawingData([]);
    setUserCount(0);
  };

  return (
    <div className="app">
      <div className="app-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">✨</div>
            <h1>CollabBoard</h1>
          </div>
          
          <div className="connection-status">
            <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
            <span>{isConnected ? 'Connected' : 'Connecting...'}</span>
            {currentRoom && (
              <div className="room-info">
                <span className="room-id">Room: {currentRoom}</span>
                <span className="user-count">{userCount} online</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="app-main">
        {!currentRoom ? (
          <RoomJoin onJoinRoom={joinRoom} />
        ) : (
          <Whiteboard 
            socket={socket}
            roomId={currentRoom}
            onLeaveRoom={leaveRoom}
            initialDrawingData={drawingData}
          />
        )}
      </main>
    </div>
  );
}

export default App;