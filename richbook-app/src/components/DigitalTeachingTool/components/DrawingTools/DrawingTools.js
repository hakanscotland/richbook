import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Highlighter, Trash2 } from 'lucide-react';
import { CustomEraserIcon } from '../../icons/CustomIcons';
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
    // Panel will appear to the right of the toolbar with additional offset
    // Get the actual toolbar width from CSS variable or default to 150px
    const toolbarWidth = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--toolbar-width')) || 150;
    
    // iPad için daha az boşluk bırakalım
    const offsetX = isIPad ? 10 : 20; // iPad için daha az boşluk
    
    // Ekranın sağ kenarından taşma kontrolu
    let leftPosition = toolbarPosition.x + toolbarWidth + offsetX;
    
    // Eğer iPad ise ve highlight seçiliyse, üst konumu biraz yukari kaydır
    // Bu, kaydırma çubuğunun aşağıya taşmasını engelleyecek
    let topPosition = toolbarPosition.y;
    if (isIPad && tool === 'highlighter') {
      topPosition = Math.max(0, topPosition - 30); // 30px yukarı kaydır
    }
    
    return {
      left: `${leftPosition}px`,
      top: `${topPosition}px`,
    };
  };

  // Handle tool selection
  const handleToolSelect = (selectedTool) => {
    selectTool(selectedTool);
    // Keep the panel open for easier tool switching
  };

  // iPad detection
  const [isIPad, setIsIPad] = useState(false);
  
  useEffect(() => {
    // iPad detection function
    const detectIPad = () => {
      return (/iPad/.test(navigator.userAgent) || 
             (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    };
    
    setIsIPad(detectIPad());
  }, []);

  // Renk seçenekleri - iPad için optimize edildi
  const getColorOptions = () => {
    if (isIPad) {
      // iPad için daha az renk seçeneği sunarak dikey alanı azaltalım
      return [
        '#000000', // Siyah
        '#0096FF', // Mavi
        '#FF0000', // Kırmızı
        '#00AA00', // Yeşil
      ];
    } else {
      return [
        '#000000', // Siyah
        '#FFFFFF', // Beyaz
        '#0096FF', // Mavi
        '#FF0000', // Kırmızı
        '#00AA00', // Yeşil
        '#9900EF'  // Mor
      ];
    }
  };
  
  const colorOptions = getColorOptions();

  // Adjust stroke width options based on device and tool
  const getStrokeWidthOptions = () => {
    if (isIPad && tool === 'highlighter') {
      // Reduced options for highlighter on iPad to save vertical space
      return [
        { value: 2, label: 'S' },
        { value: 6, label: 'M' },
        { value: 12, label: 'L' }
      ];
    } else {
      // Default options
      return [
        { value: 1, label: 'XS' },
        { value: 2, label: 'S' },
        { value: 4, label: 'M' },
        { value: 6, label: 'L' },
        { value: 10, label: 'XL' }
      ];
    }
  };
  
  const strokeWidthOptions = getStrokeWidthOptions();

  // Opacity seçenekleri (Fosforlu kalem için)
  const getOpacityOptions = () => {
    if (isIPad) {
      // iPad için daha az saydamlık seçeneği
      return [
        { value: 0.3, label: 'Low' },
        { value: 0.7, label: 'High' }
      ];
    } else {
      return [
        { value: 0.3, label: 'Low' },
        { value: 0.5, label: 'Medium' },
        { value: 0.7, label: 'High' }
      ];
    }
  };
  
  const opacityOptions = getOpacityOptions();
  
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
              <CustomEraserIcon size={20} />
              </button>
            </div>
          </div>
          
          {/* Renk Seçimi - Sadece kalem ve fosforlu kalem için göster */}
          {(tool === 'pen' || tool === 'highlighter') && (
            <div className="drawing-tools-section">
              <div className="drawing-tools-colors" style={{ gap: isIPad ? '1px' : '2px' }}>
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
                           clr === '#9900EF' ? 'Purple' : 'Color'}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Kalınlık Seçimi - Tüm araçlar için */}
          <div className="drawing-tools-section">
            <div className="drawing-tools-stroke-width" style={{ gap: isIPad ? '0' : '1px' }}>
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
              <div className="drawing-tools-opacity" style={{ gap: isIPad ? '0' : '1px' }}>
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