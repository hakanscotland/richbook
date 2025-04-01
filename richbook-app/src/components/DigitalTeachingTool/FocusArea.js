// src/components/DigitalTeachingTool/FocusArea.js
import React, { useState, useRef } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Pencil, Highlighter, Eraser, Trash2, X } from 'lucide-react';

const FocusArea = ({
  focusArea,
  setFocusArea,
  isFocusMode,
  setIsFocusMode,
  tool,
  setTool,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  opacity,
  setOpacity,
  isDarkMode
}) => {
  // State
  const [focusDrawings, setFocusDrawings] = useState([]);
  const [currentFocusLine, setCurrentFocusLine] = useState(null);
  const [isFocusDrawing, setIsFocusDrawing] = useState(false);
  const [showFocusToolOptions, setShowFocusToolOptions] = useState(false);
  const [focusToolOptionsPosition, setFocusToolOptionsPosition] = useState({ x: 0, y: 0 });
  const [focusPopupPosition, setFocusPopupPosition] = useState({ x: 0, y: 0 });
  const [isDraggingFocusPopup, setIsDraggingFocusPopup] = useState(false);
  const [focusPopupDragOffset, setFocusPopupDragOffset] = useState({ x: 0, y: 0 });
  
  // Refs
  const focusCanvasRef = useRef(null);
  const focusPopupRef = useRef(null);
  
  // Araç seçimi
  const selectFocusTool = (newTool) => {
    setTool(newTool);
    
    // Araç özelliklerini ayarla
    if (newTool === 'highlighter') {
      setOpacity(0.4);
      if (strokeWidth < 5) setStrokeWidth(5);
    } else if (newTool === 'eraser') {
      setOpacity(1);
      if (strokeWidth < 8) setStrokeWidth(8);
    } else if (newTool === 'pen') {
      setOpacity(1);
      if (strokeWidth > 5) setStrokeWidth(3);
    }
    
    // Araç değişince paneli kapat
    setShowFocusToolOptions(false);
  };
  
  // Focus popup sürükleme işleyicileri
  const startDraggingFocusPopup = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!focusPopupRef.current) return;
    
    const rect = focusPopupRef.current.getBoundingClientRect();
    setIsDraggingFocusPopup(true);
    setFocusPopupDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  const handleMouseMoveFocusPopup = (e) => {
    if (!isDraggingFocusPopup) return;
    
    setFocusPopupPosition({
      x: e.clientX - focusPopupDragOffset.x,
      y: e.clientY - focusPopupDragOffset.y
    });
  };
  
  const stopDraggingFocusPopup = () => {
    setIsDraggingFocusPopup(false);
  };
  
  // Renk butonu işleyicisi
  const handleFocusColorButtonClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    
    setFocusToolOptionsPosition({
      x: rect.right + 10,
      y: rect.top
    });
    
    setShowFocusToolOptions(!showFocusToolOptions);
  };
  
  // Focus alanı çizim işleyicileri
  const handleFocusMouseDown = () => {
    if (tool === 'hand' || !focusCanvasRef.current) return;
    
    setIsFocusDrawing(true);
    const stage = focusCanvasRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Yeni çizgi oluştur
    let newLine = {
      tool,
      points: [pointerPosition.x, pointerPosition.y],
      strokeWidth,
    };
    
    // Araç özelliklerini ayarla
    if (tool === 'pen') {
      newLine.color = color;
      newLine.opacity = opacity;
    } else if (tool === 'highlighter') {
      newLine.color = color;
      newLine.opacity = 0.4;
      newLine.strokeWidth = strokeWidth * 2;
    } else if (tool === 'eraser') {
      newLine.color = '#ffffff';
      newLine.opacity = 1;
      newLine.strokeWidth = strokeWidth * 3;
    }
    
    setCurrentFocusLine(newLine);
  };

  const handleFocusMouseMove = () => {
    if (!isFocusDrawing || !currentFocusLine || !focusCanvasRef.current) return;
    
    const stage = focusCanvasRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    setCurrentFocusLine({
      ...currentFocusLine,
      points: [...currentFocusLine.points, pointerPosition.x, pointerPosition.y]
    });
  };

  const handleFocusMouseUp = () => {
    if (!isFocusDrawing || !currentFocusLine) return;
    
    setIsFocusDrawing(false);
    setFocusDrawings([...focusDrawings, currentFocusLine]);
    setCurrentFocusLine(null);
  };
  
  // Focus araç seçenekleri paneli
  const FocusToolOptionsPanel = () => {
    if (!showFocusToolOptions) return null;
    
    return (
      <div className={`tool-options-panel tool-options-panel--${isDarkMode ? 'dark' : 'light'}`} 
        style={{
          position: 'absolute',
          top: `${focusToolOptionsPosition.y}px`,
          left: `${focusToolOptionsPosition.x}px`,
          zIndex: 1300
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
            onClick={() => setShowFocusToolOptions(false)}
          />
        </div>
        
        {/* Renk seçimi - Sadece kalem ve fosforlu kalem için göster */}
        {tool !== 'eraser' && (
          <div className="color-section">
            <div className="color-section-title">Color</div>
            <div className="color-grid">
              {['#000000', '#FF0000', '#FF8000', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#8000FF', '#FF00FF', '#FFFFFF'].map(c => (
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
        
        {/* Kalınlık seçimi */}
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

  // Mouse hareketi için genel olay işleyicisi
  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingFocusPopup) {
        handleMouseMoveFocusPopup(e);
      }
    };
    
    const handleMouseUp = () => {
      stopDraggingFocusPopup();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingFocusPopup]);

  return (
    <div className="focus-modal" 
      onMouseMove={handleMouseMoveFocusPopup}
      onMouseUp={stopDraggingFocusPopup}
    >
      <div 
        ref={focusPopupRef}
        className={`focus-container focus-container--${isDarkMode ? 'dark' : 'light'}`}
        style={{
          position: 'absolute',
          left: focusPopupPosition.x || '50%',
          top: focusPopupPosition.y || '50%',
          transform: !focusPopupPosition.x ? 'translate(-50%, -50%)' : 'none',
        }}
      >
        <div 
          className={`focus-header focus-header--${isDarkMode ? 'dark' : 'light'}`}
          onMouseDown={startDraggingFocusPopup}
        >
          <div className="focus-tools">
            <button
              className={`focus-tool-button ${tool === 'pen' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => selectFocusTool('pen')}
            >
              <Pencil size={20} />
            </button>
            <button
              className={`focus-tool-button ${tool === 'highlighter' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => selectFocusTool('highlighter')}
            >
              <Highlighter size={20} />
            </button>
            <button
              className={`focus-tool-button ${tool === 'eraser' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => selectFocusTool('eraser')}
            >
              <Eraser size={20} />
            </button>
            <button
              className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setFocusDrawings([]);
                setCurrentFocusLine(null);
              }}
              title="Clear Drawings"
            >
              <Trash2 size={20} />
            </button>
            <div
              className="focus-color-selector"
              onClick={handleFocusColorButtonClick}
            >
              <div
                className="focus-color-swatch"
                style={{
                  backgroundColor: color,
                }}
              />
              <span>{strokeWidth}px</span>
            </div>
          </div>
          <button
            className={`focus-close-button focus-close-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={() => {
              setIsFocusMode(false);
              setFocusArea(null);
              setFocusDrawings([]);
              setCurrentFocusLine(null);
              setShowFocusToolOptions(false);
            }}
          >
            ✕
          </button>
        </div>
        
        <div className="focus-content">
          <div className="focus-image-container">
            <div
              className="focus-image"
              style={{
                width: focusArea.originalWidth || focusArea.width,
                height: focusArea.originalHeight || focusArea.height,
                backgroundImage: `url(${focusArea.dataURL})`,
              }}
            >
              <Stage
                width={focusArea.originalWidth || focusArea.width}
                height={focusArea.originalHeight || focusArea.height}
                ref={focusCanvasRef}
                onMouseDown={handleFocusMouseDown}
                onMouseMove={handleFocusMouseMove}
                onMouseUp={handleFocusMouseUp}
                className="focus-canvas"
                style={{ 
                  cursor: tool === 'hand' ? 'grab' : 'crosshair'
                }}
              >
                <Layer>
                  {/* Mevcut çizimler */}
                  {focusDrawings.map((line, i) => (
                    <Line
                      key={i}
                      points={line.points}
                      stroke={line.color}
                      strokeWidth={line.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      opacity={line.opacity || 1}
                      globalCompositeOperation={
                        line.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                    />
                  ))}
                  
                  {/* Şu anda çizilen çizgi */}
                  {currentFocusLine && (
                    <Line
                      points={currentFocusLine.points}
                      stroke={currentFocusLine.color}
                      strokeWidth={currentFocusLine.strokeWidth}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      opacity={currentFocusLine.opacity || 1}
                      globalCompositeOperation={
                        currentFocusLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                      }
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
        
        {/* Focus araç seçenekleri paneli */}
        {showFocusToolOptions && <FocusToolOptionsPanel />}
      </div>
    </div>
  );
};

export default FocusArea;