// src/components/DigitalTeachingTool/Toolbar.js
import React, { useState } from 'react';
import { 
  Hand, Pencil, Highlighter, Eraser, Search, Trash2,
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Grid, Settings, Move, X
} from 'lucide-react';

const Toolbar = ({ 
  time,
  isDarkMode,
  toolbarPosition,
  startDraggingToolbar,
  tool,
  setTool,
  selectTool,
  showToolOptions,
  setShowToolOptions,
  isSelectingFocusArea,
  setIsSelectingFocusArea,
  setFocusArea,
  clearDrawings,
  currentPage,
  pages,
  goToPage,
  nextPage,
  prevPage,
  zoom,
  setZoom,
  showThumbnails,
  setShowThumbnails,
  showSettings,
  setShowSettings,
  showCurtain,
  setShowCurtain
}) => {
  // Sayfa numarası düzenleme durumu
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");

  return (
    <div className={`toolbar toolbar--${isDarkMode ? 'dark' : 'light'}`} 
      style={{
        top: `${toolbarPosition.y}px`, 
        left: `${toolbarPosition.x}px`,
      }}
    >
      <div 
        className="toolbar-header"
        onMouseDown={startDraggingToolbar}
      >
        <div style={{ padding: '0.25rem' }}>
          <Move size={16} />
        </div>
        <div style={{ padding: '0.25rem' }}>
          <X size={16} />
        </div>
      </div>
      
      {/* Saat */}
      <div className="toolbar-clock">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      
      {/* Hand Aracı */}
      <button 
        className={`toolbar-button tooltip ${tool === 'hand' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => {
          setTool('hand');
          setShowToolOptions(false);
        }}
        data-tooltip="Selection Tool"
      >
        <Hand size={20} />
      </button>
      
      {/* Çizim Araçları */}
      <button 
        className={`toolbar-button tooltip ${tool === 'pen' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => selectTool('pen')}
        data-tooltip="Pen Tool"
      >
        <Pencil size={20} />
      </button>
      
      <button 
        className={`toolbar-button tooltip ${tool === 'highlighter' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => selectTool('highlighter')}
        data-tooltip="Highlighter Tool"
      >
        <Highlighter size={20} />
      </button>
      
      <button 
        className={`toolbar-button tooltip ${tool === 'eraser' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => selectTool('eraser')}
        data-tooltip="Eraser Tool"
      >
        <Eraser size={20} />
      </button>
      
      <button 
        className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={clearDrawings}
        data-tooltip="Clear Drawings"
      >
        <Trash2 size={20} />
      </button>
      
      {/* Focus Tool */}
      <button 
        className={`toolbar-button tooltip ${isSelectingFocusArea ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => {
          setIsSelectingFocusArea(!isSelectingFocusArea);
          if (isSelectingFocusArea) {
            setFocusArea(null);
          }
          // Seçim modunda iken diğer araçları devre dışı bırak
          setTool('hand');
          setShowToolOptions(false);
        }}
        data-tooltip="Focus Tool"
      >
        <Search size={20} />
      </button>
      
      {/* Sayfa Navigasyonu */}
      <div className="toolbar-navigation">
        <div 
          className={`page-indicator page-indicator--${isDarkMode ? 'dark' : 'light'}`}
          onClick={() => {
            if (!isEditingPage) {
              setIsEditingPage(true);
              setPageInputValue(currentPage.toString());
            }
          }}
        >
          {isEditingPage ? (
            <input
              type="text"
              value={pageInputValue}
              onChange={(e) => {
                // Sadece sayı girişine izin ver
                const value = e.target.value.replace(/[^0-9]/g, '');
                setPageInputValue(value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const pageNum = parseInt(pageInputValue);
                  if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages.length) {
                    goToPage(pageNum);
                    setIsEditingPage(false);
                  }
                } else if (e.key === 'Escape') {
                  setIsEditingPage(false);
                }
              }}
              onBlur={() => {
                setIsEditingPage(false);
              }}
              autoFocus
              className="page-input"
            />
          ) : (
            `${currentPage}/${pages.length}`
          )}
        </div>
        
        <div className="page-nav-buttons">
          <button 
            className={`page-nav-button tooltip page-nav-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={prevPage}
            disabled={currentPage <= 1}
            data-tooltip="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          
          <button 
            className={`page-nav-button tooltip page-nav-button--${isDarkMode ? 'dark' : 'light'}`}
            onClick={nextPage}
            disabled={currentPage >= pages.length}
            data-tooltip="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      
      {/* Zoom Kontrolleri */}
      <button 
        className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
        data-tooltip="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      
      <button 
        className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
        data-tooltip="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      
      {/* Diğer Kontroller */}
      <button 
        className={`toolbar-button tooltip ${showThumbnails ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => setShowThumbnails(!showThumbnails)}
        data-tooltip="Thumbnails"
      >
        <Grid size={20} />
      </button>
      
      <button 
        className={`toolbar-button tooltip ${showSettings ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => setShowSettings(!showSettings)}
        data-tooltip="Settings"
      >
        <Settings size={20} />
      </button>
      
      <button 
        className={`toolbar-button tooltip ${showCurtain ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
        onClick={() => setShowCurtain(!showCurtain)}
        data-tooltip="Curtain"
      >
        <div className="curtain-icon" />
      </button>
    </div>
  );
};

export default Toolbar;