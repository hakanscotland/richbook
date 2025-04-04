// Curtain.js - Improved Curtain Component
import React, { useState, useRef, useEffect, useCallback } from 'react';

const Curtain = ({ isDarkMode, onClose }) => {
  // Curtain state
  const [topCurtain, setTopCurtain] = useState(0);
  const [rightCurtain, setRightCurtain] = useState(0);
  const [bottomCurtain, setBottomCurtain] = useState(0);
  const [leftCurtain, setLeftCurtain] = useState(0);
  const [activeDrag, setActiveDrag] = useState(null);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  
  // Calculate visible area dimensions (used for debugging or future features)
  // const visibleArea = {
  //   top: topCurtain,
  //   right: rightCurtain,
  //   bottom: bottomCurtain,
  //   left: leftCurtain
  // };
  
  // Handle mouse/touch down events on curtain edges
  const handleDragStart = (edge, e) => {
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    
    setActiveDrag(edge);
    setStartPosition({ x: clientX, y: clientY });
  };
  
  // Handle mouse/touch move events
  const handleDragMove = useCallback((e) => {
    if (!activeDrag) return;
    
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    
    const deltaX = clientX - startPosition.x;
    const deltaY = clientY - startPosition.y;
    
    if (activeDrag === 'top') {
      setTopCurtain(prev => Math.max(0, Math.min(prev + deltaY, window.innerHeight - bottomCurtain)));
    } else if (activeDrag === 'right') {
      setRightCurtain(prev => Math.max(0, Math.min(prev - deltaX, window.innerWidth - leftCurtain)));
    } else if (activeDrag === 'bottom') {
      setBottomCurtain(prev => Math.max(0, Math.min(prev - deltaY, window.innerHeight - topCurtain)));
    } else if (activeDrag === 'left') {
      setLeftCurtain(prev => Math.max(0, Math.min(prev + deltaX, window.innerWidth - rightCurtain)));
    }
    
    setStartPosition({ x: clientX, y: clientY });
  }, [activeDrag, startPosition, topCurtain, rightCurtain, bottomCurtain, leftCurtain]);
  
  // Handle mouse/touch up events
  const handleDragEnd = () => {
    setActiveDrag(null);
  };
  
  // Add and remove event listeners
  useEffect(() => {
    const handleMove = (e) => handleDragMove(e);
    const handleEnd = () => handleDragEnd();
    
    if (activeDrag) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [activeDrag, startPosition, handleDragMove]);
  
  // Reset all curtains
  const resetCurtains = () => {
    setTopCurtain(0);
    setRightCurtain(0);
    setBottomCurtain(0);
    setLeftCurtain(0);
  };
  
  // Common styles
  const curtainStyle = {
    position: 'absolute',
    backgroundColor: 'black',
    opacity: 0.9,
    zIndex: 810
  };
  
  const handleStyle = {
    position: 'absolute',
    width: '50px',
    height: '50px',
    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 820
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'absolute', 
        inset: 0, 
        zIndex: 800, 
        overflow: 'hidden',
        pointerEvents: 'auto'
      }}
    >
      {/* Toolbar */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 830,
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        color: isDarkMode ? '#f9fafb' : '#1f2937',
        borderRadius: '0.5rem',
        padding: '0.5rem',
        display: 'flex',
        gap: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}>
        <button 
          onClick={resetCurtains}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Reset Curtain
        </button>
        <button 
          onClick={onClose}
          style={{
            backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
            color: isDarkMode ? 'white' : 'black',
            border: 'none',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            cursor: 'pointer'
          }}
        >
          Close
        </button>
      </div>
      
      {/* Top curtain */}
      <div 
        style={{
          ...curtainStyle,
          top: 0,
          left: 0,
          right: 0,
          height: `${topCurtain}px`
        }}
      />
      <div 
        style={{
          ...handleStyle,
          top: `${topCurtain - 25}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          display: topCurtain > 0 ? 'flex' : 'none'
        }}
        onMouseDown={(e) => handleDragStart('top', e)}
        onTouchStart={(e) => handleDragStart('top', e)}
      >
        <span>⬇️</span>
      </div>
      
      {/* Right curtain */}
      <div 
        style={{
          ...curtainStyle,
          top: `${topCurtain}px`,
          right: 0,
          bottom: `${bottomCurtain}px`,
          width: `${rightCurtain}px`
        }}
      />
      <div 
        style={{
          ...handleStyle,
          top: '50%',
          right: `${rightCurtain - 25}px`,
          transform: 'translateY(-50%)',
          display: rightCurtain > 0 ? 'flex' : 'none'
        }}
        onMouseDown={(e) => handleDragStart('right', e)}
        onTouchStart={(e) => handleDragStart('right', e)}
      >
        <span>⬅️</span>
      </div>
      
      {/* Bottom curtain */}
      <div 
        style={{
          ...curtainStyle,
          bottom: 0,
          left: 0,
          right: 0,
          height: `${bottomCurtain}px`
        }}
      />
      <div 
        style={{
          ...handleStyle,
          bottom: `${bottomCurtain - 25}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          display: bottomCurtain > 0 ? 'flex' : 'none'
        }}
        onMouseDown={(e) => handleDragStart('bottom', e)}
        onTouchStart={(e) => handleDragStart('bottom', e)}
      >
        <span>⬆️</span>
      </div>
      
      {/* Left curtain */}
      <div 
        style={{
          ...curtainStyle,
          top: `${topCurtain}px`,
          left: 0,
          bottom: `${bottomCurtain}px`,
          width: `${leftCurtain}px`
        }}
      />
      <div 
        style={{
          ...handleStyle,
          top: '50%',
          left: `${leftCurtain - 25}px`,
          transform: 'translateY(-50%)',
          display: leftCurtain > 0 ? 'flex' : 'none'
        }}
        onMouseDown={(e) => handleDragStart('left', e)}
        onTouchStart={(e) => handleDragStart('left', e)}
      >
        <span>➡️</span>
      </div>
      
      {/* Draggable handles for initial state (when curtains are at zero) */}
      {topCurtain === 0 && (
        <div 
          style={{
            ...handleStyle,
            top: 0,
            left: '50%',
            transform: 'translate(-50%, 0)'
          }}
          onMouseDown={(e) => handleDragStart('top', e)}
          onTouchStart={(e) => handleDragStart('top', e)}
        >
          <span>⬇️</span>
        </div>
      )}
      
      {rightCurtain === 0 && (
        <div 
          style={{
            ...handleStyle,
            top: '50%',
            right: 0,
            transform: 'translate(0, -50%)'
          }}
          onMouseDown={(e) => handleDragStart('right', e)}
          onTouchStart={(e) => handleDragStart('right', e)}
        >
          <span>⬅️</span>
        </div>
      )}
      
      {bottomCurtain === 0 && (
        <div 
          style={{
            ...handleStyle,
            bottom: 0,
            left: '50%',
            transform: 'translate(-50%, 0)'
          }}
          onMouseDown={(e) => handleDragStart('bottom', e)}
          onTouchStart={(e) => handleDragStart('bottom', e)}
        >
          <span>⬆️</span>
        </div>
      )}
      
      {leftCurtain === 0 && (
        <div 
          style={{
            ...handleStyle,
            top: '50%',
            left: 0,
            transform: 'translate(0, -50%)'
          }}
          onMouseDown={(e) => handleDragStart('left', e)}
          onTouchStart={(e) => handleDragStart('left', e)}
        >
          <span>➡️</span>
        </div>
      )}
    </div>
  );
};

export default Curtain;