import React from 'react';
import { 
  Pencil, 
  Highlighter, 
  Eraser, 
  Trash2, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  X as CloseIcon
} from 'lucide-react';
import './styles.css';

/**
 * Right Side Toolbar component for FocusArea
 */
const SideToolbar = ({
  tool,
  selectFocusTool,
  handleFocusColorButtonClick,
  handleZoomIn,
  handleZoomOut,
  handleSaveFocusArea,
  handleClearAll,
  handleClose,
  isDarkMode
}) => {
  return (
    <div 
      className={`focus-side-toolbar focus-side-toolbar--${isDarkMode ? 'dark' : 'light'}`}
    >
      <div className="focus-side-tools">
        {/* Kalem aracı */}
        <button
          className={`focus-side-tool-button ${tool === 'pen' ? 'focus-side-tool-button--active' : ''} focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            selectFocusTool('pen');
          }}
          title="Kalem Aracı"
        >
          <Pencil size={20} />
        </button>
        
        {/* İşaretleyici aracı */}
        <button
          className={`focus-side-tool-button ${tool === 'highlighter' ? 'focus-side-tool-button--active' : ''} focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            selectFocusTool('highlighter');
          }}
          title="İşaretleyici Aracı"
        >
          <Highlighter size={20} />
        </button>
        
        {/* Silgi aracı */}
        <button
          className={`focus-side-tool-button ${tool === 'eraser' ? 'focus-side-tool-button--active' : ''} focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            selectFocusTool('eraser');
          }}
          title="Silgi Aracı"
        >
          <Eraser size={20} />
        </button>
        
        <div className="focus-side-tool-separator"></div>
        
        {/* Zoom In */}
        <button
          className={`focus-side-tool-button focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomIn();
          }}
          title="Yakınlaştır"
        >
          <ZoomIn size={20} />
        </button>
        
        {/* Zoom Out */}
        <button
          className={`focus-side-tool-button focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleZoomOut();
          }}
          title="Uzaklaştır"
        >
          <ZoomOut size={20} />
        </button>
        
        <div className="focus-side-tool-separator"></div>
        
        {/* Tümünü Temizle */}
        <button
          className={`focus-side-tool-button focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
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
          className={`focus-side-tool-button focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSaveFocusArea();
          }}
          title="Görüntüyü Kaydet"
        >
          <Save size={20} />
        </button>
        
        <div className="focus-side-tool-separator"></div>
        
        {/* Ayarlar butonları */}
        <button
          className={`focus-side-tool-button focus-side-tool-button--${isDarkMode ? 'dark' : 'light'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleFocusColorButtonClick(e, tool);
          }}
          title="Araç Ayarları"
        >
          <div
            className="focus-side-color-swatch"
            style={{
              backgroundColor: tool === 'eraser' ? '#ffffff' : tool === 'pen' ? '#000000' : '#ffff00',
              opacity: tool === 'highlighter' ? 0.4 : 1
            }}
          />
        </button>
      </div>
      
      {/* Kapat butonu */}
      <button
        className={`focus-side-close-button focus-side-close-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose();
        }}
        title="Kapat"
      >
        <CloseIcon size={20} />
      </button>
    </div>
  );
};

export default SideToolbar;