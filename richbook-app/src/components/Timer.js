// src/components/Timer.js
import React from 'react';
import { X, Play, Pause, RefreshCw } from 'lucide-react';

const Timer = ({ 
  isDarkMode, 
  minutes, 
  seconds,
  isRunning,
  onStart,
  onStop,
  onReset,
  onClose
}) => {
  // Format time display
  const formatTimeDisplay = () => {
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div 
      className={`countdown-timer countdown-timer--${isDarkMode ? 'dark' : 'light'}`}
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        padding: '8px 12px',
        borderRadius: '8px',
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '180px',
        zIndex: 1000,
      }}
    >
      <div 
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}
      >
        <div 
          style={{ 
            fontWeight: 'bold',
            color: isDarkMode ? '#f9fafb' : '#111827',
            fontSize: '14px'
          }}
        >
          Countdown Timer
        </div>
        <button
          onClick={onClose}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={16} />
        </button>
      </div>
      
      <div 
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          margin: '8px 0',
          fontFamily: 'monospace',
          color: minutes === 0 && seconds < 60 
            ? '#ef4444' // Red when less than 1 minute left
            : isDarkMode ? '#f9fafb' : '#111827'
        }}
      >
        {formatTimeDisplay()}
      </div>
      
      <div 
        style={{
          display: 'flex',
          gap: '12px',
          marginTop: '8px'
        }}
      >
        {isRunning ? (
          <button
            onClick={onStop}
            style={{
              backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
              color: isDarkMode ? '#f9fafb' : '#111827',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            <Pause size={16} /> Pause
          </button>
        ) : (
          <button
            onClick={onStart}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            <Play size={16} fill="white" /> Start
          </button>
        )}
        
        <button
          onClick={onReset}
          style={{
            backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb',
            color: isDarkMode ? '#f9fafb' : '#111827',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          <RefreshCw size={16} /> Reset
        </button>
      </div>
    </div>
  );
};

export default Timer;