import React from 'react';
import { Pencil, Highlighter, Eraser, Trash2, ZoomIn, ZoomOut, Save, ChevronRight } from 'lucide-react';
import './styles.css';

/**
 * Header component with tool controls for the Focus Area
 * Sadeleştirilmiş araç seti ile
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
        {/* Sadece ana araçlar */}
        <div className="tool-button-group">
          <button
            className={`focus-tool-button ${tool === 'pen' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => selectFocusTool(e, 'pen')}
            title="Pen Tool"
          >
            <Pencil size={20} />
          </button>
          <button 
            className={`focus-tool-settings-button focus-tool-settings-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFocusColorButtonClick(e, 'pen');
            }}
            title="Kalem Ayarları - Sağ Menüde Açılır"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="tool-button-group">
          <button
            className={`focus-tool-button ${tool === 'highlighter' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => selectFocusTool(e, 'highlighter')}
            title="Highlighter Tool"
          >
            <Highlighter size={20} />
          </button>
          <button 
            className={`focus-tool-settings-button focus-tool-settings-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFocusColorButtonClick(e, 'highlighter');
            }}
            title="İşaretleyici Ayarları - Sağ Menüde Açılır"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="tool-button-group">
          <button
            className={`focus-tool-button ${tool === 'eraser' ? 'focus-tool-button--active' : ''} focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => selectFocusTool(e, 'eraser')}
            title="Eraser Tool"
          >
            <Eraser size={20} />
          </button>
          <button 
            className={`focus-tool-settings-button focus-tool-settings-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleFocusColorButtonClick(e, 'eraser');
            }}
            title="Silgi Ayarları - Sağ Menüde Açılır"
          >
            <ChevronRight size={14} />
          </button>
        </div>
        
        <button
          className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleClearAll();
          }}
          title="Clear All"
        >
          <Trash2 size={20} />
        </button>
        
        {/* Zoom ve Kaydetme butonları */}
        <button
          className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomIn();
          }}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        
        <button
          className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomOut();
          }}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        
        <button
          className={`focus-tool-button focus-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveFocusArea();
          }}
          title="Save Image"
        >
          <Save size={20} />
        </button>
      </div>
      
      <button
        className={`focus-close-button focus-close-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
      >
        <span style={{ fontSize: '24px', fontWeight: 'bold' }}>✕</span>
      </button>
    </div>
  );
};

export default ToolHeader;