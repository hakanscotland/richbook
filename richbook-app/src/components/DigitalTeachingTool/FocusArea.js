// src/components/DigitalTeachingTool/FocusArea.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Layer, Line } from 'react-konva';
import { Pencil, Highlighter, Eraser, Trash2, X, ZoomIn, ZoomOut, Save } from 'lucide-react';
import './FocusArea.css';

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
  const [isLoading, setIsLoading] = useState(true);
  const [focusZoom, setFocusZoom] = useState(1.2); // Başlangıçta biraz daha yakınlaştırılmış
  
  // Resize functionality
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState(null);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ 
    width: focusArea?.originalWidth || 600, 
    height: focusArea?.originalHeight || 400 
  });
  
  // Refs
  const focusCanvasRef = useRef(null);
  const focusPopupRef = useRef(null);
  
  // Initialize container size when focus area changes
  useEffect(() => {
    if (focusArea && focusArea.originalWidth && focusArea.originalHeight) {
      setContainerSize({
        width: Math.min(window.innerWidth * 0.8, focusArea.originalWidth),
        height: Math.min(window.innerHeight * 0.8, focusArea.originalHeight)
      });
    }
  }, [focusArea]);
  
  // Initialize focus area on load with proper zoom and position
  useEffect(() => {
    if (focusArea && focusArea.dataURL) {
      // İlk yükleme sırasında initialZoom değerini kullan (varsa)
      if (focusArea.initialZoom) {
        setFocusZoom(focusArea.initialZoom);
      }
      
      // Yakalanan görüntü yüklendikten sonra ortalama ve hizalama için
      const img = new Image();
      img.onload = () => {
        setIsLoading(false);
        
        // Odak alanı için en iyi büyüklüğü belirle
        const containerWidth = Math.min(window.innerWidth * 0.8, 1200);
        const containerHeight = Math.min(window.innerHeight * 0.8, 800);
        
        // Görüntünün en-boy oranını koru, ancak container sınırlarına uygun olarak ayarla
        const aspectRatio = img.width / img.height;
        let finalWidth, finalHeight;
        
        if (containerWidth / containerHeight > aspectRatio) {
          // Container daha geniş, yüksekliğe göre sınırla
          finalHeight = Math.min(img.height, containerHeight * 0.8);
          finalWidth = finalHeight * aspectRatio;
        } else {
          // Container daha yüksek, genişliğe göre sınırla
          finalWidth = Math.min(img.width, containerWidth * 0.8);
          finalHeight = finalWidth / aspectRatio;
        }
        
        // Container boyutunu güncelle
        setContainerSize({
          width: finalWidth + 80, // Kenar boşlukları için ekstra alan
          height: finalHeight + 130 // Üst bar ve kenar boşlukları için ekstra alan
        });
        
        // Popup penceresini ekranın ortasına yerleştir
        setFocusPopupPosition({
          x: (window.innerWidth - (finalWidth + 80)) / 2,
          y: (window.innerHeight - (finalHeight + 130)) / 2
        });
      };
      
      img.src = focusArea.dataURL;
      
      img.onerror = () => {
        console.error("Failed to load focus area image");
        setIsLoading(false);
      };
      
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [focusArea]);

  // Handle click outside for tool options panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      // If panel is shown and click is outside the panel
      if (showFocusToolOptions && !e.target.closest('.tool-options-panel')) {
        setShowFocusToolOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showFocusToolOptions]);
  
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
  const startDraggingFocusPopup = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!focusPopupRef.current) return;
    
    const rect = focusPopupRef.current.getBoundingClientRect();
    setIsDraggingFocusPopup(true);
    setFocusPopupDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);
  
  const handleMouseMoveFocusPopup = useCallback((e) => {
    if (!isDraggingFocusPopup) return;
    
    setFocusPopupPosition({
      x: e.clientX - focusPopupDragOffset.x,
      y: e.clientY - focusPopupDragOffset.y
    });
  }, [isDraggingFocusPopup, focusPopupDragOffset]);
  
  const stopDraggingFocusPopup = useCallback(() => {
    setIsDraggingFocusPopup(false);
  }, []);
  
  // Resize handlers
  const startResizing = useCallback((e, direction) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    });
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !focusPopupRef.current) return;
    
    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newSize = { ...containerSize };
    
    if (resizeDirection.includes('e')) {
      newSize.width = Math.max(300, containerSize.width + deltaX);
    } else if (resizeDirection.includes('w')) {
      newSize.width = Math.max(300, containerSize.width - deltaX);
    }
    
    if (resizeDirection.includes('s')) {
      newSize.height = Math.max(200, containerSize.height + deltaY);
    } else if (resizeDirection.includes('n')) {
      newSize.height = Math.max(200, containerSize.height - deltaY);
    }
    
    setContainerSize(newSize);
    setResizeStart({
      x: e.clientX,
      y: e.clientY
    });
  }, [isResizing, resizeDirection, resizeStart, containerSize]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
  }, []);
  
  // Renk butonu işleyicisi - Fixed version
  const handleFocusColorButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Position the panel below the button instead of to the right
    setFocusToolOptionsPosition({
      x: rect.left, // Align to the left edge of the button
      y: rect.bottom + 10 // Start 10px below the button
    });
    
    // Toggle panel state
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
  
  // Focus zoom handlers
  const handleZoomIn = useCallback(() => {
    setFocusZoom(prev => Math.min(prev + 0.1, 3));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setFocusZoom(prev => Math.max(prev - 0.1, 0.5));
  }, []);
  
  // Save focus area as image
  const handleSaveFocusArea = () => {
    if (!focusCanvasRef.current) return;
    
    try {
      // Create a combined canvas with the image and drawings
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = focusArea.originalWidth || focusArea.width;
      canvas.height = focusArea.originalHeight || focusArea.height;
      
      // Draw the original image
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create a temporary Konva stage to render the drawings
        const tempStage = focusCanvasRef.current.clone();
        const dataURL = tempStage.toDataURL();
        
        // Draw the annotations over the image
        const drawingsImg = new Image();
        drawingsImg.onload = () => {
          ctx.drawImage(drawingsImg, 0, 0, canvas.width, canvas.height);
          
          // Create download link
          const link = document.createElement('a');
          link.download = `focus-area-${Date.now()}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        drawingsImg.src = dataURL;
      };
      img.src = focusArea.dataURL;
    } catch (error) {
      console.error('Error saving focus area:', error);
    }
  };
  
  // Focus araç seçenekleri paneli - Updated version
  const FocusToolOptionsPanel = () => {
    if (!showFocusToolOptions) return null;
    
    return (
      <div className={`tool-options-panel tool-options-panel--${isDarkMode ? 'dark' : 'light'}`} 
        style={{
          position: 'absolute',
          top: `${focusToolOptionsPosition.y}px`,
          left: `${focusToolOptionsPosition.x}px`,
          zIndex: 1400,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowFocusToolOptions(false);
            }}
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

  // Mouse hareketi için genel olay işleyicisi
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingFocusPopup) {
        handleMouseMoveFocusPopup(e);
      }
      
      if (isResizing) {
        handleResizeMove(e);
      }
    };
    
    const handleMouseUp = () => {
      stopDraggingFocusPopup();
      stopResizing();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingFocusPopup, isResizing, handleMouseMoveFocusPopup, handleResizeMove, stopDraggingFocusPopup, stopResizing]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to close focus area
      if (e.key === 'Escape') {
        setIsFocusMode(false);
        setFocusArea(null);
      }
      
      // + or = to zoom in
      if (e.key === '+' || e.key === '=') {
        handleZoomIn();
      }
      
      // - to zoom out
      if (e.key === '-') {
        handleZoomOut();
      }
      
      // Spacebar to toggle hand tool (temporarily)
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        if (tool !== 'hand') {
          // Store current tool to return to it later
          setTool('hand');
        }
      }
    };
    
    const handleKeyUp = (e) => {
      // When spacebar is released, return to previous tool
      if (e.code === 'Space') {
        e.preventDefault();
        // Return to a drawing tool
        setTool('pen');
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setIsFocusMode, setFocusArea, tool, setTool, handleZoomIn, handleZoomOut]);

  return (
    <div className="focus-modal" 
      onMouseMove={handleMouseMoveFocusPopup}
      onMouseUp={stopDraggingFocusPopup}
    >
      <div 
        ref={focusPopupRef}
        className={`focus-container focus-container--${isDarkMode ? 'dark' : 'light'}`}
        style={{
          left: focusPopupPosition.x || '50%',
          top: focusPopupPosition.y || '50%',
          transform: !focusPopupPosition.x ? 'translate(-50%, -50%)' : 'none',
          width: `${containerSize.width}px`,
          height: `${containerSize.height}px`,
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
            
            {/* Zoom controls */}
            <button
              className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <ZoomIn size={20} />
            </button>
            <button
              className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <ZoomOut size={20} />
            </button>
            
            {/* Save button */}
            <button
              className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={handleSaveFocusArea}
              title="Save Image"
            >
              <Save size={20} />
            </button>
            {/* Enhanced color selector */}
            <div
              className={`focus-color-selector focus-color-selector--${isDarkMode ? 'dark' : 'light'}`}
              onClick={handleFocusColorButtonClick}
            >
              <div
                className="focus-color-swatch"
                style={{
                  backgroundColor: color,
                }}
              />
              <span style={{ fontSize: '0.9rem' }}>{strokeWidth}px</span>
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
          {/* Loading indicator */}
          {isLoading && (
            <div className={`loading-indicator loading-indicator--${isDarkMode ? 'dark' : 'light'}`}>
              <div className="spinner" />
              <p>Loading focus area...</p>
            </div>
          )}
          
          <div className={`focus-image-container focus-image-container--${isDarkMode ? 'dark' : 'light'}`}>
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
                  cursor: tool === 'hand' ? 'grab' : 'crosshair',
                }}
                scaleX={focusZoom}
                scaleY={focusZoom}
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
        
        {/* Resize handles */}
        <div 
          className="resize-handle resize-handle--se"
          onMouseDown={(e) => startResizing(e, 'se')}
        />

        <div 
          className="resize-handle resize-handle--sw"
          onMouseDown={(e) => startResizing(e, 'sw')}
        />

        <div 
          className="resize-handle resize-handle--ne"
          onMouseDown={(e) => startResizing(e, 'ne')}
        />

        <div 
          className="resize-handle resize-handle--nw"
          onMouseDown={(e) => startResizing(e, 'nw')}
        />
        
        {/* Keyboard shortcuts info */}
        <div className={`focus-shortcuts-info focus-shortcuts-info--${isDarkMode ? 'dark' : 'light'}`}>
          ESC: Close • Space: Hand tool • +/-: Zoom
        </div>
        
        {/* Zoom indicator */}
        <div className="focus-zoom-indicator">
          {Math.round(focusZoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default FocusArea;