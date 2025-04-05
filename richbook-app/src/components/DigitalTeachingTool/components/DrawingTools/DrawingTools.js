import React, { useRef } from 'react';
import { Pencil, Highlighter, Eraser, Trash2 } from 'lucide-react';
import './DrawingTools.css';

const DrawingTools = ({
  isDarkMode,
  tool,
  selectTool,
  onClearDrawings,
  toolbarPosition,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  opacity,
  setOpacity,
}) => {
  const panelRef = useRef(null);

  // Calculate position based on toolbar position
  const getPanelPosition = () => {
    // Panel will appear to the right of the toolbar
    return {
      left: `${toolbarPosition.x + 120}px`, // Position to the right of toolbar
      top: `${toolbarPosition.y}px`, // Align with the top of toolbar
    };
  };

  // Handle tool selection
  const handleToolSelect = (selectedTool) => {
    selectTool(selectedTool);
    // Keep the panel open for easier tool switching
  };

  // Renk seçenekleri
  const colorOptions = [
    '#000000', // Siyah
    '#FFFFFF', // Beyaz
    '#0096FF', // Mavi
    '#FF0000', // Kırmızı
    '#00AA00', // Yeşil
    '#FF9500', // Turuncu
    '#9900EF'  // Mor
  ];

  // Kalem kalınlığı seçenekleri
  const strokeWidthOptions = [
    { value: 1, label: 'XS' },
    { value: 2, label: 'S' },
    { value: 4, label: 'M' },
    { value: 6, label: 'L' },
    { value: 10, label: 'XL' }
  ];

  // Opacity seçenekleri (Fosforlu kalem için)
  const opacityOptions = [
    { value: 0.3, label: 'Low' },
    { value: 0.5, label: 'Medium' },
    { value: 0.7, label: 'High' }
  ];
  
  return (
    <div className="drawing-tools-container" style={getPanelPosition()}>
      <div 
        ref={panelRef}
        className={`drawing-tools-panel drawing-tools-panel--${isDarkMode ? 'dark' : 'light'}`}
      >
        <div className="drawing-tools-content">
          {/* Araç Seçimi */}
          <div className="drawing-tools-section">
            <div className="drawing-tools-buttons">
              <button 
              className={`drawing-tool-button ${tool === 'pen' ? 'drawing-tool-button--active' : ''}`}
              onClick={() => handleToolSelect('pen')}
                title="Pen Tool"
              >
              <Pencil size={20} />
              </button>
              
              <button 
              className={`drawing-tool-button ${tool === 'highlighter' ? 'drawing-tool-button--active' : ''}`}
              onClick={() => handleToolSelect('highlighter')}
                title="Highlighter Tool"
              >
              <Highlighter size={20} />
              </button>
              
              <button 
              className={`drawing-tool-button ${tool === 'eraser' ? 'drawing-tool-button--active' : ''}`}
              onClick={() => handleToolSelect('eraser')}
                title="Eraser Tool"
              >
              <Eraser size={20} />
              </button>
            </div>
          </div>
          
          {/* Renk Seçimi - Sadece kalem ve fosforlu kalem için göster */}
          {(tool === 'pen' || tool === 'highlighter') && (
            <div className="drawing-tools-section">
              <div className="drawing-tools-colors">
                {colorOptions.map((clr) => (
                  <button 
                    key={clr}
                    className={`color-option ${color === clr ? 'color-option--active' : ''}`}
                    style={{ 
                      backgroundColor: clr,
                      opacity: tool === 'highlighter' ? 0.5 : 1 
                    }}
                    onClick={() => setColor(clr)}
                    title={clr === '#000000' ? 'Black' : 
                           clr === '#FFFFFF' ? 'White' : 
                           clr === '#0096FF' ? 'Blue' : 
                           clr === '#FF0000' ? 'Red' : 
                           clr === '#00AA00' ? 'Green' : 
                           clr === '#FF9500' ? 'Orange' : 
                           clr === '#9900EF' ? 'Purple' : 'Color'}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Kalınlık Seçimi - Tüm araçlar için */}
          <div className="drawing-tools-section">
            <div className="drawing-tools-stroke-width">
              {strokeWidthOptions.map((option) => (
                <button 
                  key={option.value}
                  className={`stroke-width-option ${strokeWidth === option.value ? 'stroke-width-option--active' : ''}`}
                  onClick={() => setStrokeWidth(option.value)}
                  title={`${option.label} Width`}
                >
                  <div 
                  className="stroke-width-circle" 
                  style={{ 
                  width: option.value + 4,
                  height: option.value + 4,
                  backgroundColor: tool === 'eraser' ? '#888' : color,
                    opacity: tool === 'highlighter' ? opacity : 1
                    }}
                    />
                </button>
              ))}
            </div>
          </div>
          
          {/* Saydamlık Seçimi - Sadece fosforlu kalem için */}
          {tool === 'highlighter' && (
            <div className="drawing-tools-section">
              <div className="drawing-tools-opacity">
                {opacityOptions.map((option) => (
                  <button 
                    key={option.value}
                    className={`opacity-option ${Math.abs(opacity - option.value) < 0.1 ? 'opacity-option--active' : ''}`}
                    onClick={() => setOpacity(option.value)}
                    title={`${option.label} Opacity`}
                  >
                    <div 
                      className="opacity-preview" 
                      style={{ 
                        backgroundColor: color,
                        opacity: option.value
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Temizle Butonu */}
          <button 
            className="drawing-tool-button drawing-tool-button--clear"
            onClick={onClearDrawings}
            title="Clear All Drawings"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DrawingTools;