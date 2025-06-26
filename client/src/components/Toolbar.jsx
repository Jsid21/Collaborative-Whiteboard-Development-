import React, { useState, useRef } from 'react';
import { Palette, Minus, Plus, Trash2, Settings, Eraser } from 'lucide-react';
import './Toolbar.css';

const Toolbar = ({ currentTool, onToolChange, socket }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const colors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
    { name: 'Red', value: '#ff6b6b' },
    { name: 'Blue', value: '#4834d4' },
    { name: 'Green', value: '#00d2d3' },
    { name: 'Purple', value: '#a55eea' },
    { name: 'Orange', value: '#ff9f43' },
    { name: 'Pink', value: '#ff6b9d' }
  ];

  const strokeWidths = [1, 2, 3, 5, 8, 12, 16, 20];

  const handleColorChange = (color) => {
    onToolChange({ ...currentTool, color, isEraser: false });
  };

  const handleWidthChange = (width) => {
    onToolChange({ ...currentTool, width });
  };

  const handleClearCanvas = () => {
    if (socket && window.confirm('Clear the entire canvas? This action cannot be undone.')) {
      socket.emit('clear-canvas');
    }
  };

  const increaseWidth = () => {
    const currentIndex = strokeWidths.indexOf(currentTool.width);
    if (currentIndex < strokeWidths.length - 1) {
      handleWidthChange(strokeWidths[currentIndex + 1]);
    }
  };

  const decreaseWidth = () => {
    const currentIndex = strokeWidths.indexOf(currentTool.width);
    if (currentIndex > 0) {
      handleWidthChange(strokeWidths[currentIndex - 1]);
    }
  };

  // Draggable logic
  const [position, setPosition] = useState({
    x: 36,
    y: window.innerHeight / 2
  });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    setPosition({
      x: e.clientX - dragOffset.current.x,
      y: e.clientY - dragOffset.current.y,
    });
  };

  const handleMouseUp = () => {
    setDragging(false);
    document.body.style.userSelect = '';
  };

  React.useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
    // eslint-disable-next-line
  }, [dragging]);

  // Eraser handler
  const handleEraser = () => {
    onToolChange({ ...currentTool, isEraser: true });
  };

  return (
    <div
      className={`toolbar${dragging ? ' dragging' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        position: 'fixed',
        minWidth: 140,
        maxWidth: 210,
      }}
      onMouseDown={handleMouseDown}
    >
      <button 
        className="toolbar-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Toggle toolbar"
      >
        <Settings size={20} />
      </button>

      <div className="toolbar-content">
        {/* Color Palette */}
        <div className="toolbar-section">
          <div className="section-header">
            <Palette size={16} />
            <span>Color</span>
          </div>
          <div className="color-palette">
            {colors.map((color) => (
              <button
                key={color.value}
                className={`color-button ${currentTool.color === color.value && !currentTool.isEraser ? 'active' : ''}`}
                style={{ backgroundColor: color.value }}
                onClick={() => handleColorChange(color.value)}
                title={color.name}
              >
                {currentTool.color === color.value && !currentTool.isEraser && (
                  <div className="color-check">✓</div>
                )}
              </button>
            ))}
            {/* Eraser Button */}
            <button
              className={`color-button eraser-btn ${currentTool.isEraser ? 'active' : ''}`}
              onClick={handleEraser}
              title="Eraser"
            >
              <Eraser size={16} color={currentTool.isEraser ? "#222" : "#888"} />
            </button>
          </div>
        </div>

        {/* Stroke Width */}
        <div className="toolbar-section">
          <div className="section-header">
            <span>Brush Size</span>
          </div>
          <div className="width-controls">
            <button 
              className="width-btn"
              onClick={decreaseWidth}
              disabled={currentTool.width <= strokeWidths[0]}
              title="Decrease brush size"
            >
              <Minus size={16} />
            </button>
            
            <div className="width-display">
              <div 
                className="width-preview"
                style={{
                  width: `${Math.min(currentTool.width * 2, 24)}px`,
                  height: `${Math.min(currentTool.width * 2, 24)}px`,
                  backgroundColor: currentTool.isEraser ? "#fff" : currentTool.color,
                  border: currentTool.isEraser ? "2px dashed #888" : undefined
                }}
              />
              <span className="width-value">{currentTool.width}px</span>
            </div>
            
            <button 
              className="width-btn"
              onClick={increaseWidth}
              disabled={currentTool.width >= strokeWidths[strokeWidths.length - 1]}
              title="Increase brush size"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <div className="width-slider-container">
            <input
              type="range"
              min={strokeWidths[0]}
              max={strokeWidths[strokeWidths.length - 1]}
              value={currentTool.width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value))}
              className="width-slider"
            />
          </div>
        </div>

        {/* Clear Canvas */}
        <div className="toolbar-section">
          <button 
            className="clear-btn"
            onClick={handleClearCanvas}
            title="Clear canvas"
          >
            <Trash2 size={16} />
            <span>Clear Canvas</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;