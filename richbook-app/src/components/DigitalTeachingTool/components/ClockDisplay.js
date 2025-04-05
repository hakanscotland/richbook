import React, { useEffect, useState } from 'react';

// Enhanced 3D clock component with blinking colon and seconds
const ClockDisplay = ({ time }) => {
  const [blink, setBlink] = useState(true);
  
  // Extract hours, minutes and seconds
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  const seconds = time.getSeconds().toString().padStart(2, '0');
  
  // Blink the colon every second
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);
    
    return () => clearInterval(blinkTimer);
  }, []);
  
  return (
    <div className="digital-clock-display">
      <div className="clock-3d-container">
        <span className="clock-digit clock-hours">{hours}</span>
        <span className="clock-colon" style={{ opacity: blink ? 1 : 0.4 }}>:</span>
        <span className="clock-digit clock-minutes">{minutes}</span>
        <span className="clock-colon clock-colon-seconds" style={{ opacity: blink ? 1 : 0.4 }}>:</span>
        <span className="clock-digit clock-seconds">{seconds}</span>
      </div>
    </div>
  );
};

export default ClockDisplay;
