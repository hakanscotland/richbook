import React, { useState } from 'react';

const TimerSettings = ({ 
  isDarkMode, 
  initialMinutes, 
  onSave, 
  onCancel 
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);

  const handleSave = () => {
    onSave(minutes);
  };

  return (
    <div 
      className={`timer-settings-container timer-settings-container--${isDarkMode ? 'dark' : 'light'}`}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
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
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', fontWeight: 600, fontSize: '18px' }}>Timer Settings</h3>
      
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