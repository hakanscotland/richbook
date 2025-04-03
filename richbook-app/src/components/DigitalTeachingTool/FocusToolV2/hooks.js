import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook to handle focus popup dragging functionality
 * @returns {Object} - Dragging related state and handlers
 */
export function useDragging() {
  const [isDraggingFocusPopup, setIsDraggingFocusPopup] = useState(false);
  const [focusPopupPosition, setFocusPopupPosition] = useState({ x: 0, y: 0 });
  const [focusPopupDragOffset, setFocusPopupDragOffset] = useState({ x: 0, y: 0 });
  const focusPopupRef = useRef(null);

  // Start dragging the popup
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
  
  // Handle mouse movement during dragging
  const handleMouseMoveFocusPopup = useCallback((e) => {
    if (!isDraggingFocusPopup) return;
    
    setFocusPopupPosition({
      x: e.clientX - focusPopupDragOffset.x,
      y: e.clientY - focusPopupDragOffset.y
    });
  }, [isDraggingFocusPopup, focusPopupDragOffset]);
  
  // Stop dragging
  const stopDraggingFocusPopup = useCallback(() => {
    setIsDraggingFocusPopup(false);
  }, []);

  // Setup global event listeners for dragging
  useEffect(() => {
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
  }, [isDraggingFocusPopup, handleMouseMoveFocusPopup, stopDraggingFocusPopup]);

  return {
    isDraggingFocusPopup,
    focusPopupPosition,
    focusPopupDragOffset,
    focusPopupRef,
    startDraggingFocusPopup,
    handleMouseMoveFocusPopup,
    stopDraggingFocusPopup,
    setFocusPopupPosition
  };
}

/**
 * Hook to handle keyboard shortcuts
 * @param {Function} setIsFocusMode - Function to set focus mode
 * @param {Function} setFocusArea - Function to set focus area
 * @param {Function} handleZoomIn - Function to handle zoom in
 * @param {Function} handleZoomOut - Function to handle zoom out
 * @param {Array} focusShapes - Array of shapes
 * @param {string|null} selectedShape - Selected shape ID
 * @param {Function} setFocusShapes - Function to set focus shapes
 * @param {Function} setSelectedShape - Function to set selected shape
 */
export function useKeyboardShortcuts(
  setIsFocusMode, 
  setFocusArea, 
  handleZoomIn, 
  handleZoomOut, 
  focusShapes, 
  selectedShape, 
  setFocusShapes, 
  setSelectedShape
) {
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
      
      // Delete to remove selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShape) {
          setFocusShapes(focusShapes.filter(shape => shape.id !== selectedShape));
          setSelectedShape(null);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    setIsFocusMode, 
    setFocusArea, 
    handleZoomIn, 
    handleZoomOut, 
    focusShapes, 
    selectedShape, 
    setFocusShapes, 
    setSelectedShape
  ]);
}

/**
 * Hook to handle canvas drawing functionality
 * @returns {Object} - Drawing related state and handlers
 */
export function useDrawing() {
  const [focusDrawings, setFocusDrawings] = useState([]);
  const [currentFocusLine, setCurrentFocusLine] = useState(null);
  const [isFocusDrawing, setIsFocusDrawing] = useState(false);
  const [focusShapes, setFocusShapes] = useState([]);
  const [tempShape, setTempShape] = useState(null);
  const [selectedShape, setSelectedShape] = useState(null);
  
  return {
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
  };
}