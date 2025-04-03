import React from 'react';
import { Pencil, Highlighter, Eraser, Trash2, ZoomIn, ZoomOut, Save, Square, Circle, Type } from 'lucide-react';
import './styles.css';

/**
 * Header component with tool controls for the Focus Area
 */
const ToolHeader = ({
  tool, 
  selectFocusTool, 
  color, 
  strokeWidth, 
  handleFocusColorButtonClick, 
  handleZoomIn, 
  handleZoomOut, 
  handleSaveFocusArea, 
  handleClearAll, 
  handleClose, 
  isDarkMode,
  startDraggingFocusPopup
}) => {
  return (
    <div 
      className={`focus-header focus-header--${isDarkMode ? 'dark' : 'light'}`}
      onMouseDown={startDraggingFocusPopup}
      onTouchStart={startDraggingFocusPopup}
    >
      <div className="focus-tools">
        <button
          className={`focus-tool-button ${tool === 'pen' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => selectFocusTool('pen')}
          title="Pen Tool"
        >
          <Pencil size={20} />
        </button>
        
        <button
          className={`focus-tool-button ${tool === 'highlighter' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => selectFocusTool('highlighter')}
          title="Highlighter Tool"
        >
          <Highlighter size={20} />
        </button>
        
        <button
          className={`focus-tool-button ${tool === 'eraser' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => selectFocusTool('eraser')}
          title="Eraser Tool"
        >
          <Eraser size={20} />
        </button>
        
        {/* Shape Tools */}
        <button
          className={`focus-tool-button ${tool === 'rect' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => selectFocusTool('rect')}
          title="Rectangle Tool"
        >
          <Square size={20} />
        </button>
        
        <button
          className={`focus-tool-button ${tool === 'ellipse' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => selectFocusTool('ellipse')}
          title="Ellipse Tool"
        >
          <Circle size={20} />
        </button>
        
        <button
          className={`focus-tool-button ${tool === 'text' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => selectFocusTool('text')}
          title="Text Tool"
        >
          <Type size={20} />
        </button>
        
        <button
          className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={handleClearAll}
          title="Clear All"
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
        onClick={handleClose}
      >
        ✕
      </button>
    </div>
  );
};

export default ToolHeader;