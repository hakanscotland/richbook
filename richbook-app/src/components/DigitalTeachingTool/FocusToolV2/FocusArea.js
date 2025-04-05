import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pencil, 
  Highlighter, 
  Eraser, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  X as CloseIcon,
  Move,
  Settings
} from 'lucide-react';
import { saveFocusAreaAsImage } from './utils';
import { useDragging, useKeyboardShortcuts, useDrawing } from './hooks';
import FocusImage from './FocusImage';
import Whiteboard from './Whiteboard';
import ToolOptions from './ToolOptions';
import './styles.css';

/**
 * FocusArea Component for capturing and annotating screen areas
 * 
 * This component creates a popup with a captured screenshot and a whiteboard
 * area for annotations and explanations.
 */
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
  // Initialize state using custom hooks - Sadeleştirilmiş
  const {
    focusDrawings,
    setFocusDrawings,
    currentFocusLine,
    setCurrentFocusLine,
    isFocusDrawing,
    setIsFocusDrawing,
    focusShapes,
    setFocusShapes,
    // eslint-disable-next-line no-unused-vars
    tempShape,
    setTempShape,
    selectedShape,
    setSelectedShape
  } = useDrawing();
  
  const {
    focusPopupPosition,
    focusPopupRef,
    startDraggingFocusPopup,
    handleMouseMoveFocusPopup,
    stopDraggingFocusPopup,
    setFocusPopupPosition
  } = useDragging();
  
  // Additional state
  const [showFocusToolOptions, setShowFocusToolOptions] = useState(false);
  const [focusToolOptionsPosition, setFocusToolOptionsPosition] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [focusZoom, setFocusZoom] = useState(1.2); // Initial zoom level increased by 20%
  
  // Refs
  const focusCanvasRef = useRef(null);
  const whiteboardCanvasRef = useRef(null);
  
  // Canvas dimensions state
  const [stageSize, setStageSize] = useState({
    width: 600,
    height: 400
  });
  
  // Container dimensions state
  const [containerSize, setContainerSize] = useState({
    width: focusArea?.originalWidth || 600,
    height: focusArea?.originalHeight || 400
  });
  
  // Whiteboard dimensions state
  const [whiteboardSize, setWhiteboardSize] = useState({
    width: 600,
    height: 400
  });
  
  // Handle zoom in, increasing zoom level with limits
  const handleZoomIn = useCallback(() => {
    setFocusZoom(prev => {
      const newZoom = Math.min(prev + 0.2, 3.0); // Larger zoom step, max zoom 3x
      console.log('Zoom in to:', newZoom);
      return parseFloat(newZoom.toFixed(1)); // Limit precision to 1 decimal place
    });
  }, []);
  
  // Handle zoom out, decreasing zoom level with minimum limit
  const handleZoomOut = useCallback(() => {
    setFocusZoom(prev => {
      const newZoom = Math.max(prev - 0.2, 0.5); // Larger zoom step, min zoom 0.5x
      console.log('Zoom out to:', newZoom);
      return parseFloat(newZoom.toFixed(1)); // Limit precision to 1 decimal place
    });
  }, []);
  
  useKeyboardShortcuts(
    setIsFocusMode, 
    setFocusArea, 
    handleZoomIn, 
    handleZoomOut, 
    focusShapes, 
    selectedShape, 
    setFocusShapes, 
    setSelectedShape
  );
  
  // Initialize container size when focus area changes
  useEffect(() => {
    if (focusArea && focusArea.originalWidth && focusArea.originalHeight) {
      // Initialize sizing with a short delay to avoid race conditions
      setTimeout(() => {
        // Get viewport restrictions
        const maxWidth = window.innerWidth * 0.9; // 90% of viewport width
        const maxHeight = window.innerHeight * 0.9; // 90% of viewport height
        
        // Original dimensions from the captured area
        const originalWidth = focusArea.originalWidth;
        const originalHeight = focusArea.originalHeight;
        
        console.log('Original focus dimensions:', originalWidth, 'x', originalHeight);
        
        // Minimum dimensions to ensure UI is usable
        const minWidth = Math.max(800, originalWidth * 1.8);
        const minHeight = Math.max(600, originalHeight * 1.8);
        
        // Calculate aspect ratio to preserve proportions
        const aspectRatio = originalWidth / originalHeight;
        
        // Initial container sizing (at least 80% larger than content)
        let containerWidth = Math.max(minWidth, originalWidth * 1.8);
        let containerHeight = Math.max(minHeight, originalHeight * 1.8);
        
        // Adjust if container exceeds viewport bounds
        if (containerWidth > maxWidth) {
          containerWidth = maxWidth;
          containerHeight = containerWidth / aspectRatio;
        }
        
        if (containerHeight > maxHeight) {
          containerHeight = maxHeight;
          containerWidth = containerHeight * aspectRatio;
        }
        
        // Ensure minimum sizes are respected despite viewport constraints
        containerWidth = Math.max(800, containerWidth);
        containerHeight = Math.max(600, containerHeight);
        
        console.log('Final container size:', containerWidth, 'x', containerHeight);
        
        // Update container size
        setContainerSize({
          width: containerWidth,
          height: containerHeight
        });
        
        // Calculate whiteboard size (2/3 of container width)
        setWhiteboardSize({
          width: containerWidth * 0.66,
          height: containerHeight
        });
        
        // Center the popup
        setFocusPopupPosition({
          x: (window.innerWidth - containerWidth) / 2,
          y: (window.innerHeight - containerHeight) / 2
        });
      }, 0);
    }
  }, [focusArea, setFocusPopupPosition]);
  
  // Initialize focus area on load with proper zoom
  useEffect(() => {
    if (focusArea && focusArea.dataURL) {
      // Set initial zoom to 1.2 for slightly larger display
      setFocusZoom(1.2);
      setIsLoading(true);
      
      console.log('Focus area initialization:', {
        originalWidth: focusArea.originalWidth,
        originalHeight: focusArea.originalHeight,
        captureTime: focusArea.captureTime || 'not set'
      });
      
      // Load and measure the captured image
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully with dimensions:', img.width, 'x', img.height);
        
        // Save actual image dimensions
        setStageSize({
          width: focusArea.originalWidth,  // Captured area width
          height: focusArea.originalHeight // Captured area height
        });
        
        // Center the popup in the viewport 
        setFocusPopupPosition({
          x: (window.innerWidth - containerSize.width) / 2,
          y: (window.innerHeight - containerSize.height) / 2
        });
        
        setIsLoading(false);
      };
      
      // Error handling for image loading
      img.onerror = (e) => {
        console.error('Failed to load focus area image:', e);
        // Use dimensions directly from the focus area object
        setStageSize({
          width: focusArea.originalWidth,
          height: focusArea.originalHeight
        });
        setIsLoading(false);
      };
      
      // Set the image source to start loading
      img.src = focusArea.dataURL;
      
      // Cleanup on unmount
      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }
  }, [focusArea, containerSize, setFocusPopupPosition]);

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
  
  // Tool selection - Sadeleştirilmiş araç seti
  const selectFocusTool = (newTool) => {
    // Sadece izin verilen araçları kontrol et
    if (['pen', 'highlighter', 'eraser', 'hand'].includes(newTool)) {
      setTool(newTool);
      
      // Set tool properties
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
    }
    
    // Close panel when tool changes
    setShowFocusToolOptions(false);
  };
  
  // Popup penceresi içindeki araç butonları için güvenli tıklama işleyicisi
  const handleToolButtonClick = (e, newTool) => {
    // Tıklama olayının popup'ta yeniden konumlandırmaya neden olmasını engelle
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Aracı değiştir
    if (newTool) {
      selectFocusTool(newTool);
    }
  };
  
  // Color button handler - for left toolbar
  const handleFocusColorButtonClick = (e, toolType) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Get button position
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const focusContainerRect = focusPopupRef.current.getBoundingClientRect();
    
    // Set the current tool to the selected one if needed
    if (toolType && toolType !== tool) {
      selectFocusTool(toolType);
    }
    
    // Dokunmatik cihazları tespit et
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Konumlandırmayı cihaz türüne göre ayarla
    if (isTouchDevice) {
      // iPad ve dokunmatik cihazlar için ayarlar penceresini daha merkezi konumlandır
      // Böylece ekranın dışına taşmasını önleriz
      setFocusToolOptionsPosition({
        x: 80, // Sol araç çubuğundan biraz daha uzak
        y: Math.min(
          Math.max(buttonRect.top - focusContainerRect.top, 60), // Minimum 60px yukarıda
          focusContainerRect.height - 300 // Panel yüksekliğini göz önünde bulundur
        )
      });
    } else {
      // Masaüstü cihazlar için normal konumlandırma
      setFocusToolOptionsPosition({
        x: 70, // Sol araç çubuğunun genişliği + 10px boşluk
        y: buttonRect.top - focusContainerRect.top
      });
    }
    
    // Toggle panel visibility
    setShowFocusToolOptions(!showFocusToolOptions);
  };
  
  // Drawing handlers for both canvas areas - Sadece basit araçlar için
  const handleCanvasMouseDown = (e, canvasType) => {
    if (tool === 'hand' || !(canvasType === 'whiteboard' ? whiteboardCanvasRef.current : focusCanvasRef.current)) return;
    
    // Start drawing
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    const stage = canvasType === 'whiteboard' ? whiteboardCanvasRef.current : focusCanvasRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Adjust mouse/touch position based on zoom
    const x = pointerPosition.x / (canvasType === 'whiteboard' ? 1 : focusZoom);
    const y = pointerPosition.y / (canvasType === 'whiteboard' ? 1 : focusZoom);
    
    // For normal drawing tools
    setIsFocusDrawing(true);
    
    // Create new line based on tool properties
    let newLine = {
      tool,
      points: [x, y],
      strokeWidth,
      canvasType
    };
    
    // Set tool properties
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

  const handleCanvasMouseMove = (e, canvasType) => {
    // Mouse/touch movement for drawing
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    const stage = canvasType === 'whiteboard' ? whiteboardCanvasRef.current : focusCanvasRef.current;
    if (!stage) return;
    
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Adjust mouse/touch position based on zoom
    const x = pointerPosition.x / (canvasType === 'whiteboard' ? 1 : focusZoom);
    const y = pointerPosition.y / (canvasType === 'whiteboard' ? 1 : focusZoom);
    
    // Çizim aracı aktifse ve geçerli çizgi varsa devam et
    if (isFocusDrawing && currentFocusLine && currentFocusLine.canvasType === canvasType) {
      setCurrentFocusLine({
        ...currentFocusLine,
        points: [...currentFocusLine.points, x, y]
      });
    }
  };

  const handleCanvasMouseUp = (e, canvasType) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    // Çizimi tamamla
    if (isFocusDrawing && currentFocusLine && currentFocusLine.canvasType === canvasType) {
      setIsFocusDrawing(false);
      setFocusDrawings([...focusDrawings, currentFocusLine]);
      setCurrentFocusLine(null);
    }
  };

  // Shape rendering function removed since it's not used
  
  // Handler to save the focus area as an image
  const handleSaveFocusArea = () => {
    saveFocusAreaAsImage(
      focusArea,
      stageSize,
      containerSize,
      whiteboardSize,
      focusZoom,
      focusDrawings
    );
  };
  
  // Handler to clear all drawings and shapes
  const handleClearAll = () => {
    setFocusDrawings([]);
    setFocusShapes([]);
    setCurrentFocusLine(null);
    setTempShape(null);
    setSelectedShape(null);
  };
  
  // Handler to close the focus area
  const handleClose = () => {
    setIsFocusMode(false);
    setFocusArea(null);
    setFocusDrawings([]);
    setFocusShapes([]);
    setCurrentFocusLine(null);
    setTempShape(null);
    setSelectedShape(null);
    setShowFocusToolOptions(false);
  };

  return (
    <div 
      className="focus-modal"
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
          display: 'flex',
          flexDirection: 'row'
        }}
      >
        {/* Hareket ettirilebilir başlık çubuğu */}
        <div 
          className={`focus-drag-handle focus-drag-handle--${isDarkMode ? 'dark' : 'light'}`}
          onMouseDown={startDraggingFocusPopup}
          onTouchStart={startDraggingFocusPopup}
        >
          <div className="focus-drag-handle-icon">
            <Move size={18} />
          </div>
          <div className="focus-drag-handle-text">
            Taşımak için sürükle
          </div>
          <button
            className={`focus-close-button focus-close-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClose();
            }}
            title="Kapat"
          >
            <CloseIcon size={26} />
          </button>
        </div>
        
        {/* Sol taraftaki araç çubuğu */}
        <div className={`focus-left-toolbar focus-left-toolbar--${isDarkMode ? 'dark' : 'light'}`}>
          {/* Kalem aracı */}
          <button
            className={`focus-left-tool-button ${tool === 'pen' ? 'focus-left-tool-button--active' : ''} focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => handleToolButtonClick(e, 'pen')}
            title="Kalem Aracı"
          >
            <Pencil size={20} />
          </button>
          
          {/* İşaretleyici aracı */}
          <button
            className={`focus-left-tool-button ${tool === 'highlighter' ? 'focus-left-tool-button--active' : ''} focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => handleToolButtonClick(e, 'highlighter')}
            title="İşaretleyici Aracı"
          >
            <Highlighter size={20} />
          </button>
          
          {/* Silgi aracı */}
          <button
            className={`focus-left-tool-button ${tool === 'eraser' ? 'focus-left-tool-button--active' : ''} focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => handleToolButtonClick(e, 'eraser')}
            title="Silgi Aracı"
          >
            <Eraser size={20} />
          </button>
          
          <div className="focus-left-tool-separator"></div>
          
          {/* Yakınlaştır */}
          <button
            className={`focus-left-tool-button focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleZoomIn();
            }}
            title="Yakınlaştır (+)"
          >
            <ZoomIn size={20} />
            <span className="zoom-button-info">{Math.round(focusZoom * 100)}%</span>
          </button>
          
          {/* Uzaklaştır */}
          <button
            className={`focus-left-tool-button focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleZoomOut();
            }}
            title="Uzaklaştır (-)"
          >
            <ZoomOut size={20} />
          </button>
          
          <div className="focus-left-tool-separator"></div>
          
          {/* Temizle */}
          <button
            className={`focus-left-tool-button focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleClearAll();
            }}
            title="Tümünü Temizle"
          >
            <Trash2 size={20} />
          </button>
          
          {/* Kaydet */}
          <button
            className={`focus-left-tool-button focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveFocusArea();
            }}
            title="Görüntüyü Kaydet"
          >
            <Save size={20} />
          </button>
          
          <div className="focus-left-tool-separator"></div>
          
          {/* Ayarlar */}
          <button
            className={`focus-left-tool-button focus-left-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFocusColorButtonClick(e, tool);
            }}
            title="Araç Ayarları"
          >
            <Settings size={20} />
          </button>
        </div>
        
        <div className="focus-main-content" data-testid="focus-main-content">
          {/* Loading indicator */}
          {isLoading && (
            <div className={`loading-indicator loading-indicator--${isDarkMode ? 'dark' : 'light'}`}>
              <div className="spinner" />
              <p>Loading focus area...</p>
            </div>
          )}
          
          <div className="focus-split-container">
            {/* Focus area image (screenshot) - 1/4 of the width */}
            <FocusImage
              focusArea={focusArea}
              stageSize={stageSize}
              focusCanvasRef={focusCanvasRef}
              handleCanvasMouseDown={handleCanvasMouseDown}
              handleCanvasMouseMove={handleCanvasMouseMove}
              handleCanvasMouseUp={handleCanvasMouseUp}
              focusZoom={focusZoom}
              tool={tool}
              focusDrawings={focusDrawings}
              currentFocusLine={currentFocusLine}
              isDarkMode={isDarkMode}
              containerSize={containerSize}
            />
            
            {/* Whiteboard area - 3/4 of the width */}
            <Whiteboard
              whiteboardCanvasRef={whiteboardCanvasRef}
              whiteboardSize={whiteboardSize}
              handleCanvasMouseDown={handleCanvasMouseDown}
              handleCanvasMouseMove={handleCanvasMouseMove}
              handleCanvasMouseUp={handleCanvasMouseUp}
              tool={tool}
              focusDrawings={focusDrawings}
              currentFocusLine={currentFocusLine}
              containerSize={containerSize}
            />
          </div>
        </div>
        
        {/* Tool Options Panel */}
        {showFocusToolOptions && (
          <div 
            className="tool-options-wrapper" 
            style={{
              position: 'absolute',
              top: `${focusToolOptionsPosition.y}px`,
              left: `${focusToolOptionsPosition.x}px`
            }}
          >
            <ToolOptions
              showFocusToolOptions={showFocusToolOptions}
              tool={tool}
              color={color}
              setColor={setColor}
              strokeWidth={strokeWidth}
              setStrokeWidth={setStrokeWidth}
              setShowFocusToolOptions={setShowFocusToolOptions}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
        
        {/* Keyboard shortcuts info */}
        <div className={`focus-shortcuts-info focus-shortcuts-info--${isDarkMode ? 'dark' : 'light'}`}>
          <strong>Klavye Kısayolları:</strong> 
          ESC: Kapat • 
          <span className="shortcut-zoom-key">+/-: Yakınlaştır/Uzaklaştır</span> • 
          Delete: Seçili öğeyi sil
        </div>
        
        {/* Zoom indicator */}
        <div className="focus-zoom-indicator">
          <ZoomIn size={16} style={{ marginRight: '4px' }} />
          {Math.round(focusZoom * 100)}%
        </div>
      </div>
    </div>
  );
};

export default FocusArea;