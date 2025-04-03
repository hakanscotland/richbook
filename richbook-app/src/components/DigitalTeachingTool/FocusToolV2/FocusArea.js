import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Rect, Ellipse, Text, Line } from 'react-konva';
import { saveFocusAreaAsImage } from './utils';
import { useDragging, useKeyboardShortcuts, useDrawing } from './hooks';
import ToolHeader from './ToolHeader';
import ToolOptions from './ToolOptions';
import FocusImage from './FocusImage';
import Whiteboard from './Whiteboard';
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
  // Initialize state using custom hooks
  const {
    focusDrawings,
    setFocusDrawings,
    currentFocusLine,
    setCurrentFocusLine,
    isFocusDrawing,
    setIsFocusDrawing,
    focusShapes,
    setFocusShapes,
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
  
  // Set up keyboard shortcuts
  const handleZoomIn = useCallback(() => {
    setFocusZoom(prev => {
      const newZoom = Math.min(prev + 0.1, 3);
      return parseFloat(newZoom.toFixed(2)); // Limit precision to 2 decimal places
    });
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setFocusZoom(prev => {
      const newZoom = Math.max(prev - 0.1, 0.5);
      return parseFloat(newZoom.toFixed(2)); // Limit precision to 2 decimal places
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
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      
      // Calculate the size of the popup container
      const containerWidth = Math.min(maxWidth, Math.max(600, focusArea.originalWidth * 1.5));
      const containerHeight = Math.min(maxHeight, Math.max(400, focusArea.originalHeight * 1.5));
      
      setContainerSize({
        width: containerWidth,
        height: containerHeight
      });
      
      // Calculate the whiteboard size (3/4 of the container width)
      setWhiteboardSize({
        width: containerWidth * 0.75,
        height: containerHeight
      });
    }
  }, [focusArea]);
  
  // Initialize focus area on load with proper zoom
  useEffect(() => {
    if (focusArea && focusArea.dataURL) {
      // Set initial zoom to 1.2 (20% larger)
      setFocusZoom(1.2);
      
      // Load the captured image
      const img = new Image();
      img.onload = () => {
        setIsLoading(false);
        
        // Save the actual image dimensions
        setStageSize({
          width: img.width,
          height: img.height
        });
        
        // Center the popup in the viewport
        setFocusPopupPosition({
          x: (window.innerWidth - containerSize.width) / 2,
          y: (window.innerHeight - containerSize.height) / 2
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
  
  // Tool selection
  const selectFocusTool = (newTool) => {
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
    
    // Close panel when tool changes
    setShowFocusToolOptions(false);
  };
  
  // Color button handler
  const handleFocusColorButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Set position for the color selection panel
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Check if panel would overflow the right edge of the screen
    const windowWidth = window.innerWidth;
    const panelWidth = 200; // Estimated panel width
    
    // If panel would overflow right, position it on the left
    let xPos = rect.left;
    if (xPos + panelWidth > windowWidth - 20) {
      xPos = rect.right - panelWidth;
    }

    // Position the panel below the button
    setFocusToolOptionsPosition({
      x: xPos,
      y: rect.bottom + 10 // Start 10px below the button
    });
    
    // Toggle panel state
    setShowFocusToolOptions(!showFocusToolOptions);
  };
  
  // Drawing handlers for both canvas areas
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
    
    // Special handling for shape tools
    if (['rect', 'ellipse', 'line', 'text'].includes(tool)) {
      // Start shape drawing
      const shapeId = Date.now().toString();
      if (tool === 'rect') {
        setTempShape({
          id: shapeId,
          type: 'rect',
          x: x,
          y: y,
          width: 0,
          height: 0,
          color,
          strokeWidth,
          opacity,
          canvasType
        });
      } else if (tool === 'ellipse') {
        setTempShape({
          id: shapeId,
          type: 'ellipse',
          x: x,
          y: y,
          radiusX: 0,
          radiusY: 0,
          color,
          strokeWidth,
          opacity,
          canvasType
        });
      } else if (tool === 'line') {
        setTempShape({
          id: shapeId,
          type: 'line',
          points: [x, y, x, y],
          color,
          strokeWidth,
          opacity,
          canvasType
        });
      } else if (tool === 'text') {
        // Show prompt for text
        const textToAdd = window.prompt('Enter text:', '');
        if (textToAdd) {
          const newText = {
            id: shapeId,
            type: 'text',
            x: x,
            y: y,
            text: textToAdd,
            fontSize: 16,
            color,
            opacity,
            canvasType
          };
          setFocusShapes([...focusShapes, newText]);
        }
      }
    } else {
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
    }
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
    
    // For shape drawing
    if (tempShape && tempShape.canvasType === canvasType) {
      if (tempShape.type === 'rect') {
        // Update rectangle
        const width = x - tempShape.x;
        const height = y - tempShape.y;
        setTempShape({
          ...tempShape,
          width: width,
          height: height
        });
      } else if (tempShape.type === 'ellipse') {
        // Update ellipse
        const radiusX = Math.abs(x - tempShape.x);
        const radiusY = Math.abs(y - tempShape.y);
        setTempShape({
          ...tempShape,
          radiusX: radiusX,
          radiusY: radiusY
        });
      } else if (tempShape.type === 'line') {
        // Update line
        const newPoints = [tempShape.points[0], tempShape.points[1], x, y];
        setTempShape({
          ...tempShape,
          points: newPoints
        });
      }
    } else if (isFocusDrawing && currentFocusLine && currentFocusLine.canvasType === canvasType) {
      // For normal drawing tools
      setCurrentFocusLine({
        ...currentFocusLine,
        points: [...currentFocusLine.points, x, y]
      });
    }
  };

  const handleCanvasMouseUp = (e, canvasType) => {
    e.evt.preventDefault();
    e.evt.stopPropagation();
    
    // Complete shape drawing
    if (tempShape && tempShape.canvasType === canvasType) {
      // Check if it's a valid shape (not zero dimensions)
      let isValidShape = false;
      
      if (tempShape.type === 'rect') {
        isValidShape = Math.abs(tempShape.width) > 5 && Math.abs(tempShape.height) > 5;
      } else if (tempShape.type === 'ellipse') {
        isValidShape = tempShape.radiusX > 5 && tempShape.radiusY > 5;
      } else if (tempShape.type === 'line') {
        const startX = tempShape.points[0];
        const startY = tempShape.points[1];
        const endX = tempShape.points[2];
        const endY = tempShape.points[3];
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        isValidShape = distance > 5; // 5 pixels minimum length
      }
      
      if (isValidShape) {
        setFocusShapes([...focusShapes, tempShape]);
      }
      
      setTempShape(null);
    } else if (isFocusDrawing && currentFocusLine && currentFocusLine.canvasType === canvasType) {
      // For normal drawing tools
      setIsFocusDrawing(false);
      setFocusDrawings([...focusDrawings, currentFocusLine]);
      setCurrentFocusLine(null);
    }
  };

  // Shape rendering function
  const renderShape = (shape) => {
    const common = {
      stroke: shape.color || color,
      strokeWidth: shape.strokeWidth || strokeWidth,
      opacity: shape.opacity || opacity,
      fill: shape.fill || 'transparent',
      draggable: tool === 'hand',
      onClick: () => setSelectedShape(shape.id),
    };
    
    if (shape.type === 'rect') {
      return (
        <Rect
          key={shape.id}
          x={shape.x}
          y={shape.y}
          width={shape.width}
          height={shape.height}
          {...common}
        />
      );
    } else if (shape.type === 'ellipse') {
      return (
        <Ellipse
          key={shape.id}
          x={shape.x}
          y={shape.y}
          radiusX={shape.radiusX}
          radiusY={shape.radiusY}
          {...common}
        />
      );
    } else if (shape.type === 'line') {
      return (
        <Line
          key={shape.id}
          points={shape.points}
          {...common}
        />
      );
    } else if (shape.type === 'text') {
      return (
        <Text
          key={shape.id}
          x={shape.x}
          y={shape.y}
          text={shape.text}
          fontSize={shape.fontSize || 16}
          fontFamily="Arial"
          fill={shape.color || color}
          {...common}
        />
      );
    }
    
    return null;
  };
  
  // Handler to save the focus area as an image
  const handleSaveFocusArea = () => {
    saveFocusAreaAsImage(
      focusArea,
      stageSize,
      containerSize,
      whiteboardSize,
      focusZoom,
      focusDrawings,
      focusShapes
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
        }}
      >
        {/* Tool Header */}
        <ToolHeader
          tool={tool}
          selectFocusTool={selectFocusTool}
          color={color}
          strokeWidth={strokeWidth}
          handleFocusColorButtonClick={handleFocusColorButtonClick}
          handleZoomIn={handleZoomIn}
          handleZoomOut={handleZoomOut}
          handleSaveFocusArea={handleSaveFocusArea}
          handleClearAll={handleClearAll}
          handleClose={handleClose}
          isDarkMode={isDarkMode}
          startDraggingFocusPopup={startDraggingFocusPopup}
        />
        
        <div className="focus-content">
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
              focusShapes={focusShapes}
              tempShape={tempShape}
              currentFocusLine={currentFocusLine}
              renderShape={renderShape}
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
              focusShapes={focusShapes}
              tempShape={tempShape}
              currentFocusLine={currentFocusLine}
              renderShape={renderShape}
              containerSize={containerSize}
            />
          </div>
        </div>
        
        {/* Tool Options Panel */}
        <div style={{
          position: 'absolute',
          top: focusToolOptionsPosition.y,
          left: focusToolOptionsPosition.x,
        }}>
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
        
        {/* Keyboard shortcuts info */}
        <div className={`focus-shortcuts-info focus-shortcuts-info--${isDarkMode ? 'dark' : 'light'}`}>
          ESC: Close • +/-: Zoom • Delete: Remove selected
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