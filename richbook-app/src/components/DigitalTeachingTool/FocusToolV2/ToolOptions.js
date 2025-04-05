import React, { useEffect } from 'react';
import { X, PenLine, Highlighter, Eraser } from 'lucide-react';
import './styles.css';

/**
 * Panel for tool options like color and thickness
 * Sağ panel tasarımı (araçların sağında açılır panel)
 */
const ToolOptions = ({
  tool, 
  color, 
  setColor, 
  strokeWidth, 
  setStrokeWidth, 
  setShowFocusToolOptions, 
  isDarkMode
}) => {
  
  // iPad için ekstra kontrol
  useEffect(() => {
    // Dokunmatik cihaz mı kontrol et
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
      // Panelin konumunu denetleyen bir fonksiyon
      const checkPosition = () => {
        // Panel elemanını bul
        const panel = document.querySelector('.tool-options-panel');
        if (!panel) return;
        
        // Panel konumunu kontrol et
        const panelRect = panel.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        
        // Ekranın sağ tarafına taşıyorsa, konumunu ayarla
        if (panelRect.right > windowWidth - 20) {
          const parent = panel.parentElement;
          if (parent) {
            parent.style.left = `${Math.max(80, windowWidth - panelRect.width - 30)}px`;
          }
        }
      };
      
      // Panelin pozisyonunu kontrol et
      setTimeout(checkPosition, 50);
      setTimeout(checkPosition, 200);
    }
  }, []);
  
  return (
    <div className={`tool-options-panel tool-options-panel--${isDarkMode ? 'dark' : 'light'}`}>
      <div className={`tool-options-header tool-options-header--${isDarkMode ? 'dark' : 'light'}`}>
        <div className="tool-options-title">
        {tool === 'pen' ? <><PenLine size={16} style={{marginRight: '5px'}} /> Pen Settings</> : 
        tool === 'highlighter' ? <><Highlighter size={16} style={{marginRight: '5px'}} /> Highlighter Settings</> : 
        <><Eraser size={16} style={{marginRight: '5px'}} /> Eraser Settings</>}
        </div>
        <X 
          size={16} 
          style={{ cursor: 'pointer' }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowFocusToolOptions(false);
          }}
        />
      </div>
      
      {/* Color selection - Only show for pen and highlighter */}
      {tool !== 'eraser' && (
        <div className="color-section">
          <div className="color-section-title">Color</div>
          <div className="color-grid">
            {['#000000', '#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8000FF', '#FF00FF', '#FFFFFF'].map(c => (
              <div 
                key={c} 
                className={`color-swatch ${c === color ? 'color-swatch--selected' : ''}`}
                style={{ 
                  backgroundColor: c,
                  cursor: 'pointer',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: c === color ? '2px solid #3b82f6' : '1px solid #d1d5db'
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setColor(c);
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Thickness selection */}
      <div className="thickness-section">
        <div className="thickness-title">Thickness</div>
        <div className="thickness-options">
          {[1, 2, 3, 5, 8, 12, 18, 24].map(width => (
            <div 
              key={width} 
              className={`thickness-swatch ${width === strokeWidth ? 'thickness-swatch--selected' : ''}`}
              style={{ 
                width: `${Math.min(width * 2, 32)}px`, 
                height: `${Math.min(width * 2, 32)}px`, 
                backgroundColor: tool !== 'eraser' ? color : isDarkMode ? 'white' : 'black',
                opacity: tool === 'highlighter' ? 0.4 : 1,
                cursor: 'pointer',
                borderRadius: '50%',
                border: width === strokeWidth ? '2px solid #3b82f6' : '1px solid #d1d5db'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setStrokeWidth(width);
              }}
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