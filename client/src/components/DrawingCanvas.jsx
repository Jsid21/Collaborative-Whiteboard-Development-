import React, { useRef, useEffect, useState, useCallback } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = ({ socket, currentTool, onCursorMove, initialDrawingData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [context, setContext] = useState(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    setContext(ctx);

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Configure context for smooth drawing
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.imageSmoothingEnabled = true;
      
      // Redraw existing content after resize
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Load initial drawing data
  useEffect(() => {
    if (initialDrawingData && initialDrawingData.length > 0) {
      redrawCanvas();
    }
  }, [initialDrawingData]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !context) return;

    const handleDrawStart = (data) => {
      context.beginPath();
      context.moveTo(data.x, data.y);
      context.strokeStyle = data.color;
      context.lineWidth = data.width;
    };

    const handleDrawMove = (data) => {
      context.lineTo(data.x, data.y);
      context.stroke();
    };

    const handleDrawEnd = (data) => {
      // Draw the complete path
      if (data.path && data.path.length > 0) {
        context.beginPath();
        context.strokeStyle = data.color;
        context.lineWidth = data.width;
        
        const firstPoint = data.path[0];
        context.moveTo(firstPoint.x, firstPoint.y);
        
        data.path.forEach(point => {
          context.lineTo(point.x, point.y);
        });
        
        context.stroke();
      }
    };

    const handleClearCanvas = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    const handleLoadDrawing = (drawingData) => {
      redrawCanvas(drawingData);
    };

    socket.on('draw-start', handleDrawStart);
    socket.on('draw-move', handleDrawMove);
    socket.on('draw-end', handleDrawEnd);
    socket.on('clear-canvas', handleClearCanvas);
    socket.on('load-drawing', handleLoadDrawing);

    return () => {
      socket.off('draw-start', handleDrawStart);
      socket.off('draw-move', handleDrawMove);
      socket.off('draw-end', handleDrawEnd);
      socket.off('clear-canvas', handleClearCanvas);
      socket.off('load-drawing', handleLoadDrawing);
    };
  }, [socket, context]);

  const redrawCanvas = useCallback((drawingData = initialDrawingData) => {
    if (!context || !drawingData) return;

    const canvas = canvasRef.current;
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawingData.forEach(command => {
      if (command.type === 'stroke' && command.data.path) {
        context.beginPath();
        context.strokeStyle = command.data.color;
        context.lineWidth = command.data.width;
        
        const path = command.data.path;
        if (path.length > 0) {
          context.moveTo(path[0].x, path[0].y);
          path.forEach(point => {
            context.lineTo(point.x, point.y);
          });
          context.stroke();
        }
      }
    });
  }, [context, initialDrawingData]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const getTouchPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const touch = e.touches[0];
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY
    };
  }, []);

  const startDrawing = useCallback((pos) => {
    if (!context) return;

    setIsDrawing(true);
    setCurrentPath([pos]);

    context.beginPath();
    context.moveTo(pos.x, pos.y);

    if (currentTool.isEraser) {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1)";
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = currentTool.color;
    }
    context.lineWidth = currentTool.width;

    // Emit to other users
    if (socket) {
      socket.emit('draw-start', {
        x: pos.x,
        y: pos.y,
        color: currentTool.color,
        width: currentTool.width,
        isEraser: currentTool.isEraser
      });
    }
  }, [context, currentTool, socket]);

  const draw = useCallback((pos) => {
    if (!isDrawing || !context) return;

    if (currentTool.isEraser) {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1)";
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = currentTool.color;
    }
    context.lineWidth = currentTool.width;

    context.lineTo(pos.x, pos.y);
    context.stroke();

    setCurrentPath(prev => [...prev, pos]);

    // Emit to other users
    if (socket) {
      socket.emit('draw-move', {
        x: pos.x,
        y: pos.y,
        color: currentTool.color,
        width: currentTool.width,
        isEraser: currentTool.isEraser
      });
    }
  }, [isDrawing, context, currentTool, socket]);

  const stopDrawing = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);

    // Reset composite operation after erasing
    if (context) {
      context.globalCompositeOperation = "source-over";
    }

    // Emit complete path to other users and server
    if (socket && currentPath.length > 0) {
      socket.emit('draw-end', {
        path: currentPath,
        color: currentTool.color,
        width: currentTool.width,
        isEraser: currentTool.isEraser
      });
    }

    setCurrentPath([]);
  }, [isDrawing, socket, currentPath, currentTool, context]);

  // Mouse events
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    startDrawing(pos);
  }, [getMousePos, startDrawing]);

  const handleMouseMove = useCallback((e) => {
    e.preventDefault();
    const pos = getMousePos(e);
    
    // Always send cursor position
    onCursorMove(pos.x, pos.y);
    
    // Draw if mouse is down
    if (isDrawing) {
      draw(pos);
    }
  }, [getMousePos, onCursorMove, isDrawing, draw]);

  const handleMouseUp = useCallback((e) => {
    e.preventDefault();
    stopDrawing();
  }, [stopDrawing]);

  // Touch events
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    startDrawing(pos);
  }, [getTouchPos, startDrawing]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    const pos = getTouchPos(e);
    
    onCursorMove(pos.x, pos.y);
    
    if (isDrawing) {
      draw(pos);
    }
  }, [getTouchPos, onCursorMove, isDrawing, draw]);

  const handleTouchEnd = useCallback((e) => {
    e.preventDefault();
    stopDrawing();
  }, [stopDrawing]);

  return (
    <canvas
      ref={canvasRef}
      className="drawing-canvas"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
};

export default DrawingCanvas;