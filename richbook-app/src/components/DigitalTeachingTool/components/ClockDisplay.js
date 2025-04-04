import React, { useEffect, useState } from 'react';

// Custom clock component with blinking colon
const ClockDisplay = ({ time }) => {
  const [blink, setBlink] = useState(true);
  
  // Extract hours and minutes
  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');
  
  // Blink the colon every second
  useEffect(() => {
    const blinkTimer = setInterval(() => {
      setBlink(prev => !prev);
    }, 1000);
    
    return () => clearInterval(blinkTimer);
  }, []);
  
  return (
    <div className="digital-clock-display">
      <span className="clock-digit">{hours}</span>
      <span className="clock-colon" style={{ opacity: blink ? 1 : 0.4 }}>:</span>
      <span className="clock-digit">{minutes}</span>
    </div>
  );
};

export default ClockDisplay;
