import React, { useState, useEffect, useRef } from 'react';
import './Timer.css';
import { X, Play, Pause, Plus, Minus, Move } from 'lucide-react';

const Timer = ({ 
  isDarkMode, 
  onClose,
  initialMinutes = 15
}) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: window.innerWidth - 240, y: 20 });
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

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
    const containerWidth = containerRef.current ? containerRef.current.offsetWidth : 220;
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

  // Timer dakikayı artırma ve azaltma işlevleri
  const incrementMinutes = () => {
    if (!isRunning && minutes < 60) {
      setMinutes(minutes + 1);
    }
  };

  const decrementMinutes = () => {
    if (!isRunning && minutes > 1) {
      setMinutes(minutes - 1);
    }
  };

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

  return (
    <div 
      ref={containerRef}
      className={`timer-container timer-container--${isDarkMode ? 'dark' : 'light'}`}
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
        zIndex: 800,
        width: '220px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'all 0.2s ease',
        cursor: isDragging ? 'grabbing' : 'default'
      }}
      onMouseMove={handleDrag}
      onTouchMove={handleDrag}
      onMouseUp={stopDragging}
      onTouchEnd={stopDragging}
      onMouseLeave={stopDragging}
    >
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          width: '100%', 
          marginBottom: '12px',
          alignItems: 'center'
        }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'move' }}
          onMouseDown={startDragging}
          onTouchStart={startDragging}
        >
          <Move size={18} style={{ marginRight: '8px' }} />
          <h3 style={{ margin: 0, fontWeight: 600, fontSize: '18px' }}>Timer</h3>
        </div>
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: isDarkMode ? '#d1d5db' : '#4b5563',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={20} />
        </button>
      </div>
      
        <>
          {/* Timer display ile birlikte +/- butonları */}
          <div style={{ position: 'relative', width: '100%', margin: '16px 0' }}>
            <div 
              style={{ 
                fontSize: '48px', 
                fontWeight: 'bold', 
                fontFamily: 'monospace',
                letterSpacing: '2px',
                textAlign: 'center'
              }}
            >
              {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
            </div>
            
            {/* +/- butonları */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '8px',
              marginTop: '8px',
              opacity: isRunning ? 0.4 : 1
            }}>
              <button
                onClick={decrementMinutes}
                disabled={isRunning}
                style={{
                  padding: '4px',
                  backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                  color: isDarkMode ? '#d1d5db' : '#4b5563',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px'
                }}
              >
                <Minus size={16} />
              </button>
              
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center'
              }}>
                {minutes} min
              </div>
              
              <button
                onClick={incrementMinutes}
                disabled={isRunning}
                style={{
                  padding: '4px',
                  backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
                  color: isDarkMode ? '#d1d5db' : '#4b5563',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px'
                }}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          
          {/* Timer controls */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
          </div>
        </>
      
      
      {/* Audio for timer alarm */}
      <audio ref={audioRef}>
        <source src="/timer-done.mp3" type="audio/mp3" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default Timer;