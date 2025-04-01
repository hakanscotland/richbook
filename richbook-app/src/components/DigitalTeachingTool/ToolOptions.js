// src/components/DigitalTeachingTool/ToolOptions.js
import React from 'react';
import { X } from 'lucide-react';

const ToolOptions = ({ 
  tool, 
  color, 
  setColor, 
  strokeWidth, 
  setStrokeWidth, 
  opacity,
  setOpacity,
  isDarkMode, 
  toolbarPosition, 
  setShowToolOptions 
}) => {
  // Predefined colors for quick selection
  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#FF8000', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#8000FF', // Purple
    '#FF00FF', // Magenta
    '#FFFFFF'  // White
  ];

  // Predefined stroke widths
  const strokeWidths = [1, 2, 3, 5, 8, 12, 18, 24];

  return (
    <div className={`tool-options-panel tool-options-panel--${isDarkMode ? 'dark' : 'light'}`}
      style={{
        left: toolbarPosition.x + 80,
        top: toolbarPosition.y,
      }}>
      <div className={`tool-options-header tool-options-header--${isDarkMode ? 'dark' : 'light'}`}>
        <div className="tool-options-title">
          {tool === 'pen' ? 'Pen Settings' : 
           tool === 'highlighter' ? 'Highlighter Settings' : 
           'Eraser Settings'}
        </div>
        <X 
          size={16} 
          style={{ cursor: 'pointer' }}
          onClick={() => setShowToolOptions(false)}
        />
      </div>
      
      {/* Color section - Only show for pen and highlighter */}
      {tool !== 'eraser' && (
        <div className="color-section">
          <div className="color-section-title">Color</div>
          <div className="color-grid">
            {colors.map(c => (
              <div 
                key={c} 
                className={`color-swatch ${c === color ? 'color-swatch--selected' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Thickness section */}
      <div className="thickness-section">
        <div className="thickness-title">Thickness</div>
        <div className="thickness-options">
          {strokeWidths.map(width => (
            <div 
              key={width} 
              className={`thickness-swatch ${width === strokeWidth ? 'thickness-swatch--selected' : ''}`}
              style={{ 
                width: `${Math.min(width * 2, 32)}px`, 
                height: `${Math.min(width * 2, 32)}px`, 
                backgroundColor: tool !== 'eraser' ? color : isDarkMode ? 'white' : 'black',
                opacity: tool === 'highlighter' ? 0.4 : 1
              }}
              onClick={() => setStrokeWidth(width)}
            />
          ))}
        </div>
        <input 
          type="range" 
          min="1" 
          max="50" 
          value={strokeWidth} 
          onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
          className="thickness-slider"
        />
        <div className="thickness-value">{strokeWidth}px</div>
      </div>
    </div>
  );
};

export default ToolOptions;