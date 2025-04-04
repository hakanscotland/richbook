import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';
import { X, Play, Pause, Settings } from 'lucide-react';

const Timer = ({ 
  isDarkMode, 
  onClose,
  initialMinutes = 5
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [timerInputValue, setTimerInputValue] = useState(initialMinutes.toString());
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // Timer işleyici
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Süre dolduğunda 
          clearInterval(timerRef.current);
          setIsRunning(false);
          
          // Alarm çal
          if (audioRef.current) {
            audioRef.current.play().catch(err => console.error('Audio play failed:', err));
          }
        }
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, minutes, seconds]);

  // Timer'ı başlat/durdur
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Timer'ı sıfırla
  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(initialMinutes);
    setSeconds(0);
  };

  // Timer ayarlarını kaydet
  const saveTimerSettings = () => {
    const newMinutes = parseInt(timerInputValue);
    if (!isNaN(newMinutes) && newMinutes > 0) {
      setMinutes(newMinutes);
      setSeconds(0);
      setIsRunning(false);
    }
    setShowSettings(false);
  };

  return (
    <div 
      className={`timer-container timer-container--${isDarkMode ? 'dark' : 'light'}`}
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
        zIndex: 800,
        width: '280px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          marginBottom: '12px' 
        }}
      >
        <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>Timer</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isDarkMode ? '#d1d5db' : '#4b5563'
          }}
        >
          <X size={20} />
        </button>
      </div>
      
      {showSettings ? (
        <div 
          style={{ 
            width: '100%', 
            padding: '16px 0', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <label 
            htmlFor="timerMinutes" 
            style={{ 
              marginBottom: '8px', 
              fontWeight: 500,
              fontSize: '14px' 
            }}
          >
            Timer Duration (minutes)
          </label>
          <input
            id="timerMinutes"
            type="number"
            min="1"
            max="60"
            value={timerInputValue}
            onChange={(e) => setTimerInputValue(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '4px',
              border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
              backgroundColor: isDarkMode ? '#374151' : '#f9fafb',
              color: isDarkMode ? '#f9fafb' : '#1f2937',
              marginBottom: '16px'
            }}
          />
          <button
            onClick={saveTimerSettings}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
          >
            Save Settings
          </button>
        </div>
      ) : (
        <>
          {/* Timer display */}
          <div 
            style={{ 
              fontSize: '64px', 
              fontWeight: 'bold', 
              margin: '16px 0',
              fontFamily: 'monospace',
              letterSpacing: '2px'
            }}
          >
            {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
          </div>
          
          {/* Timer controls */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
            <button
              onClick={toggleTimer}
              style={{
                padding: '8px 16px',
                backgroundColor: isRunning ? '#ef4444' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'background-color 0.2s ease'
              }}
            >
              {isRunning ? <Pause size={16} /> : <Play size={16} />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetTimer}
              style={{
                padding: '8px 16px',
                backgroundColor: 'transparent',
                color: isDarkMode ? '#d1d5db' : '#4b5563',
                border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Reset
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                color: isDarkMode ? '#d1d5db' : '#4b5563',
                border: isDarkMode ? '1px solid #4b5563' : '1px solid #d1d5db',
                borderRadius: '4px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
            >
              <Settings size={16} />
            </button>
          </div>
        </>
      )}
      
      {/* Audio for timer alarm */}
      <audio ref={audioRef}>
        <source src="/timer-done.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default Timer;