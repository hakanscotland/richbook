import React, { useState, useRef } from 'react';
import { X, Move } from 'lucide-react';

const TimerSettings = ({ 
  isDarkMode, 
  initialMinutes, 
  onSave, 
  onCancel 
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 130, y: window.innerHeight / 2 - 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const handleSave = () => {
    onSave(minutes);
  };

  // Sürükleme işleyicileri
  const startDragging = (e) => {
    if (e.cancelable) {
      e.preventDefault();
    }
    
    setIsDragging(true);
    
    if (e.type === 'touchstart') {
      // Dokunmatik olay
      const touch = e.touches[0];
      setDragOffset({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
    } else {
      // Mouse olayı
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleDrag = (e) => {
    if (!isDragging) return;
    
    let clientX, clientY;
    
    if (e.type === 'touchmove') {
      if (e.cancelable) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    // Ekran sınırlarını kontrol et
    const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 260;
    const containerHeight = containerRef.current ? containerRef.current.offsetHeight : 200;
    
    const maxX = window.innerWidth - containerWidth;
    const maxY = window.innerHeight - containerHeight;
    
    // Ekran dışına çıkmasını önle
    const newX = Math.min(Math.max(0, clientX - dragOffset.x), maxX);
    const newY = Math.min(Math.max(0, clientY - dragOffset.y), maxY);
    
    setPosition({ x: newX, y: newY });
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef}
      className={`timer-settings-container timer-settings-container--${isDarkMode ? 'dark' : 'light'}`}
      style={{
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        transform: 'none',
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        color: isDarkMode ? '#f9fafb' : '#1f2937',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        padding: '16px',
        zIndex: 900,
        width: '260px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseMove={handleDrag}
      onTouchMove={handleDrag}
      onMouseUp={stopDragging}
      onTouchEnd={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'move' }}
          onMouseDown={startDragging}
          onTouchStart={startDragging}
        >
          <Move size={18} style={{ marginRight: '8px' }} />
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>Timer Settings</h3>
        </div>
        
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isDarkMode ? '#d1d5db' : '#4b5563',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>
      
      <div style={{ width: '100%', marginBottom: '16px' }}>
        <label htmlFor="timer-minutes" style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
          Duration (minutes)
        </label>
        <input
          id="timer-minutes"
          type="number"
          min="1"
          max="60"
          value={minutes}
          onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 1))}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '4px',
            border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
            backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            boxSizing: 'border-box'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: 'transparent',
            color: isDarkMode ? '#d1d5db' : '#4b5563',
            border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Start Timer
        </button>
      </div>
    </div>
  );
};

export default TimerSettings;