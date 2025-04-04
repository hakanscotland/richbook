// src/components/DigitalTeachingTool/ToolOptions.js
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Check } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('main');
  const [tempStrokeWidth, setTempStrokeWidth] = useState(strokeWidth);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Dokunmatik cihaz tespiti
  useEffect(() => {
    const detectTouch = () => {
      return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
    };
    setIsTouchDevice(detectTouch());
  }, []);
  
  // StrokeWidth değiştiğinde geçici değeri güncelle
  useEffect(() => {
    setTempStrokeWidth(strokeWidth);
  }, [strokeWidth]);
  
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
  
  // Apply stroke width and go back to main tab
  const applyStrokeWidth = () => {
    setStrokeWidth(tempStrokeWidth);
    setActiveTab('main');
  };
  
  // iPad için optimize edilmiş görünüm
  const positionStyle = isTouchDevice ? {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: '300px',
    maxWidth: '90vw'
  } : {
    left: toolbarPosition.x + 80,
    top: toolbarPosition.y,
    width: '220px'
  };

  return (
    <div className={`tool-options-panel tool-options-panel--${isDarkMode ? 'dark' : 'light'} ${isTouchDevice ? 'touch-ui' : ''}`}
      style={positionStyle}>
      
      {/* Ana Tab */}
      {activeTab === 'main' && (
        <>
          <div className={`tool-options-header tool-options-header--${isDarkMode ? 'dark' : 'light'}`}>
            <div className="tool-options-title">
              {tool === 'pen' ? 'Pen Settings' : 
               tool === 'highlighter' ? 'Highlighter Settings' : 
               'Eraser Settings'}
            </div>
            <X 
              size={isTouchDevice ? 24 : 16} 
              style={{ cursor: 'pointer' }}
              onClick={() => setShowToolOptions(false)}
            />
          </div>
          
          {/* Color section - Only show for pen and highlighter */}
          {tool !== 'eraser' && (
            <div className="color-section">
              <div className="color-section-title">Color</div>
              <div className="color-grid" style={isTouchDevice ? {gap: '8px'} : {}}>
                {colors.slice(0, isTouchDevice ? 5 : colors.length).map(c => (
                  <div 
                    key={c} 
                    className={`color-swatch ${c === color ? 'color-swatch--selected' : ''}`}
                    style={{
                      backgroundColor: c,
                      width: isTouchDevice ? '36px' : '2rem',
                      height: isTouchDevice ? '36px' : '2rem'
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              
              {isTouchDevice && (
                <div className="color-grid" style={{marginTop: '8px', gap: '8px'}}>
                  {colors.slice(5).map(c => (
                    <div 
                      key={c} 
                      className={`color-swatch ${c === color ? 'color-swatch--selected' : ''}`}
                      style={{
                        backgroundColor: c,
                        width: '36px',
                        height: '36px'
                      }}
                      onClick={() => setColor(c)}
                    />
                  ))}
                </div>
              )}
              
              {isTouchDevice && (
                <button 
                  className={`tool-options-button tool-options-button--${isDarkMode ? 'dark' : 'light'}`}
                  onClick={() => setActiveTab('custom-color')}
                  style={{ marginTop: '12px' }}
                >
                  Custom Color
                </button>
              )}
            </div>
          )}
          
          {/* Thickness section */}
          <div className="thickness-section">
            <div className="thickness-header">
              <div className="thickness-title">Thickness: {strokeWidth}px</div>
              <button 
                className={`thickness-detail-button thickness-detail-button--${isDarkMode ? 'dark' : 'light'}`}
                onClick={() => setActiveTab('thickness')}
              >
                <ChevronRight size={isTouchDevice ? 20 : 16} />
              </button>
            </div>
            
            <div className="thickness-preview" style={{ 
              backgroundColor: tool !== 'eraser' ? color : isDarkMode ? 'white' : 'black',
              opacity: tool === 'highlighter' ? 0.4 : 1,
              height: `${Math.min(strokeWidth * 1.5, 50)}px`,
              borderRadius: `${Math.min(strokeWidth * 0.75, 25)}px`
            }} />
            
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={strokeWidth} 
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className={`thickness-slider thickness-slider--${isDarkMode ? 'dark' : 'light'}`}
              style={isTouchDevice ? {height: '36px'} : {}}
            />
            
            <div className="thickness-presets">
              {strokeWidths.slice(0, 4).map(width => (
                <div 
                  key={width} 
                  className={`thickness-preset ${width === strokeWidth ? 'thickness-preset--selected' : ''}`}
                  onClick={() => setStrokeWidth(width)}
                >
                  {width}px
                </div>
              ))}
            </div>
          </div>
          
          {/* Opacity section - Only for highlighter */}
          {tool === 'highlighter' && (
            <div className="opacity-section">
              <div className="opacity-title">Opacity: {Math.round(opacity * 100)}%</div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={opacity * 100} 
                onChange={(e) => setOpacity(parseInt(e.target.value) / 100)}
                className={`opacity-slider opacity-slider--${isDarkMode ? 'dark' : 'light'}`}
                style={isTouchDevice ? {height: '36px'} : {}}
              />
            </div>
          )}
        </>
      )}
      
      {/* Thickness Ayar Sayfası */}
      {activeTab === 'thickness' && (
        <>
          <div className={`tool-options-header tool-options-header--${isDarkMode ? 'dark' : 'light'}`}>
            <button 
              className={`back-button back-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setActiveTab('main')}
            >
              <ChevronLeft size={isTouchDevice ? 20 : 16} /> Back
            </button>
            <div className="tool-options-title">Thickness</div>
          </div>
          
          <div className="thickness-detail-section">
            <div className="thickness-preview-large" style={{ 
              backgroundColor: tool !== 'eraser' ? color : isDarkMode ? 'white' : 'black',
              opacity: tool === 'highlighter' ? 0.4 : 1,
              height: `${Math.min(tempStrokeWidth * 1.5, 100)}px`,
              borderRadius: `${Math.min(tempStrokeWidth * 0.75, 50)}px`,
              marginBottom: '20px'
            }} />
            
            <div className="thickness-value-display">{tempStrokeWidth}px</div>
            
            <input 
              type="range" 
              min="1" 
              max="50" 
              value={tempStrokeWidth} 
              onChange={(e) => setTempStrokeWidth(parseInt(e.target.value))}
              className={`thickness-slider thickness-slider--${isDarkMode ? 'dark' : 'light'}`}
              style={isTouchDevice ? {height: '36px'} : {}}
            />
            
            <div className="thickness-presets-grid">
              {strokeWidths.map(width => (
                <div 
                  key={width} 
                  className={`thickness-preset-large ${width === tempStrokeWidth ? 'thickness-preset-large--selected' : ''}`}
                  onClick={() => setTempStrokeWidth(width)}
                >
                  {width}px
                </div>
              ))}
            </div>
            
            <div className="preset-buttons">
              <button 
                className={`preset-button preset-button--${isDarkMode ? 'dark' : 'light'}`}
                onClick={() => setTempStrokeWidth(1)}
              >
                Fine
              </button>
              <button 
                className={`preset-button preset-button--${isDarkMode ? 'dark' : 'light'}`}
                onClick={() => setTempStrokeWidth(5)}
              >
                Medium
              </button>
              <button 
                className={`preset-button preset-button--${isDarkMode ? 'dark' : 'light'}`}
                onClick={() => setTempStrokeWidth(12)}
              >
                Thick
              </button>
            </div>
            
            <button 
              className={`apply-button apply-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={applyStrokeWidth}
            >
              <Check size={isTouchDevice ? 20 : 16} /> Apply
            </button>
          </div>
        </>
      )}
      
      {/* Custom Color Tab */}
      {activeTab === 'custom-color' && (
        <>
          <div className={`tool-options-header tool-options-header--${isDarkMode ? 'dark' : 'light'}`}>
            <button 
              className={`back-button back-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setActiveTab('main')}
            >
              <ChevronLeft size={isTouchDevice ? 20 : 16} /> Back
            </button>
            <div className="tool-options-title">Custom Color</div>
          </div>
          
          <div className="custom-color-section">
            <div 
              className="color-preview" 
              style={{ 
                backgroundColor: color,
                marginBottom: '15px' 
              }}
            />
            
            <div className="color-input-container">
              <input 
                type="color" 
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="color-input"
              />
              <div className="color-value">{color.toUpperCase()}</div>
            </div>
            
            <div className="common-colors">
              <div className="common-colors-title">Common Colors</div>
              <div className="common-colors-grid">
                {colors.map(c => (
                  <div 
                    key={c} 
                    className={`common-color-swatch ${c === color ? 'common-color-swatch--selected' : ''}`}
                    style={{
                      backgroundColor: c
                    }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            
            <button 
              className={`apply-button apply-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setActiveTab('main')}
            >
              <Check size={isTouchDevice ? 20 : 16} /> Apply
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ToolOptions;