import React, { useEffect, useState, useRef } from 'react';

// Simplified clock component with blinking colon
const ClockDisplay = ({ time }) => {
  const [blink, setBlink] = useState(true);
  const [currentTime, setCurrentTime] = useState(time);
  const timerRef = useRef(null);
  
  // Extract hours, minutes and seconds
  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');
  
  // Detect if running on iPad/touch device
  const isIPadOS = typeof navigator !== 'undefined' && 
                  ((navigator.platform === 'MacIntel' && 'ontouchend' in document) ||
                   /iPad|iPhone|iPod/.test(navigator.userAgent));
  
  // Update time and blink the colon every second
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date());
      setBlink(prev => !prev);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div className="digital-clock-display">
      <div className="clock-3d-container">
        <span className="clock-digit clock-hours">{hours}</span>
        <span className="clock-colon" style={{ opacity: blink ? 1 : 0.4 }}>:</span>
        <span className="clock-digit clock-minutes">{minutes}</span>
        {/* iPad/Touch cihazlarda saniyeyi gösterme opsiyonu */}
        {!isIPadOS && (
          <>
            <span className="clock-colon clock-colon-seconds" style={{ opacity: blink ? 1 : 0.4 }}>:</span>
            <span className="clock-digit clock-seconds">{seconds}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default ClockDisplay;
