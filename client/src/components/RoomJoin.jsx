import React, { useState } from 'react';
import axios from 'axios';
import { Users, ArrowRight, Shuffle } from 'lucide-react';
import './RoomJoin.css';

const RoomJoin = ({ onJoinRoom }) => {
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRandomRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/rooms/join', {
        roomId: roomId.trim()
      });

      if (response.data.success) {
        onJoinRoom(response.data.roomId, response.data.drawingData);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomRoom = () => {
    const randomId = generateRandomRoomId();
    setRoomId(randomId);
  };

  return (
    <div className="room-join">
      <div className="room-join-container">
        <div className="room-join-header">
          <div className="join-icon">
            <Users size={48} />
          </div>
          <h2>Join a Collaboration Space</h2>
          <p>Enter a room code to start drawing together, or create a new room instantly</p>
        </div>

        <form onSubmit={handleSubmit} className="room-join-form">
          <div className="input-group">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              placeholder="Enter room code..."
              maxLength={8}
              className="room-input"
              autoFocus
            />
            <button
              type="button"
              onClick={handleRandomRoom}
              className="random-btn"
              title="Generate random room"
            >
              <Shuffle size={20} />
            </button>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!roomId.trim() || isLoading}
            className="join-btn"
          >
            {isLoading ? (
              <div className="loading-spinner"></div>
            ) : (
              <>
                <span>Join Room</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="room-join-features">
          <div className="feature">
            <div className="feature-icon">🎨</div>
            <div className="feature-text">
              <h4>Real-time Drawing</h4>
              <p>Draw together in real-time</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">👥</div>
            <div className="feature-text">
              <h4>Live Cursors</h4>
              <p>See where others are drawing</p>
            </div>
          </div>
          <div className="feature">
            <div className="feature-icon">💾</div>
            <div className="feature-text">
              <h4>Auto-save</h4>
              <p>Your work is saved automatically</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;