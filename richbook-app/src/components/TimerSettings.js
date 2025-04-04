// src/components/TimerSettings.js
import React from 'react';
import { X } from 'lucide-react';

const TimerSettings = ({
  isDarkMode,
  minutes,
  setMinutes,
  onStart,
  onClose,
  position
}) => {
  return (
    <div 
      className={`timer-settings timer-settings--${isDarkMode ? 'dark' : 'light'}`} 
      style={{
        position: 'absolute',
        left: position.x + 140,
        top: position.y + 100,
        zIndex: 1150,
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        padding: '16px',
        width: '260px',
        border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
      }}
    >
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          paddingBottom: '8px',
          borderBottom: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`
        }}
      >
        <h3 
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
            color: isDarkMode ? '#f9fafb' : '#111827'
          }}
        >
          Timer Settings
        </h3>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: isDarkMode ? '#9ca3af' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>
      </div>
      
      <div style={{ color: isDarkMode ? '#f9fafb' : '#111827' }}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="timer-minutes"
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              fontSize: '14px'
            }}
          >
            Minutes:
          </label>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <button 
              onClick={() => setMinutes(prev => Math.max(1, prev - 1))}
              disabled={minutes <= 1}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                background: isDarkMode ? '#374151' : '#f9fafb',
                color: isDarkMode ? '#f9fafb' : '#111827',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: minutes <= 1 ? 0.5 : 1
              }}
            >
              -
            </button>
            <input 
              id="timer-minutes"
              type="number" 
              min="1" 
              max="60"
              value={minutes}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1 && value <= 60) {
                  setMinutes(value);
                }
              }}
              style={{
                width: '70px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                background: isDarkMode ? '#374151' : 'white',
                color: isDarkMode ? '#f9fafb' : '#111827',
                fontSize: '16px',
                textAlign: 'center'
              }}
            />
            <button 
              onClick={() => setMinutes(prev => Math.min(60, prev + 1))}
              disabled={minutes >= 60}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                background: isDarkMode ? '#374151' : '#f9fafb',
                color: isDarkMode ? '#f9fafb' : '#111827',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                opacity: minutes >= 60 ? 0.5 : 1
              }}
            >
              +
            </button>
          </div>
        </div>
        
        <div
          style={{
            marginBottom: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {[1, 3, 5, 10, 15, 20].map(preset => (
            <button 
              key={preset}
              onClick={() => setMinutes(preset)}
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                background: minutes === preset 
                  ? '#3b82f6' 
                  : isDarkMode ? '#374151' : '#f9fafb',
                color: minutes === preset 
                  ? 'white' 
                  : isDarkMode ? '#f9fafb' : '#111827',
                fontSize: '14px',
                cursor: 'pointer',
                flex: '1 0 auto',
                minWidth: '60px',
                textAlign: 'center'
              }}
            >
              {preset} min
            </button>
          ))}
        </div>
        
        <button 
          onClick={onStart}
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          Start Timer
        </button>
      </div>
    </div>
  );
};

export default TimerSettings;