import React, { useState, useEffect } from 'react';
import { 
  Hand, Pencil, Highlighter, Eraser, Search, Trash2,
  ArrowLeft, ArrowRight, ZoomIn, ZoomOut,
  Grid, Settings, Move, X, ChevronDown, Eye, EyeOff, Clock
} from 'lucide-react';
import TimerSettings from './TimerSettings';
import './Toolbar.css';

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
  setShowCurtain,
  isTouchDevice,
  isToolbarCollapsed = false,  // Yeni prop: toolbar durumu
  setToolbarCollapsed = () => {},  // Yeni prop: toolbar durumunu değiştiren fonksiyon
  showTimer = false,
  setShowTimer = () => {},
  setTimerMinutes = () => {},
}) => {
  // Sayaç için state'ler
  const [timerMinutes, setTimerMinutesLocal] = useState(5);
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  
  // Timer input değiştiğinde parent komponente bildir
  useEffect(() => {
    setTimerMinutes(timerMinutes);
  }, [timerMinutes, setTimerMinutes]);
  
  // Sayfa numarası düzenleme durumu
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");

  // Timer ayarlarını kaydet
  const handleSaveTimerSettings = (minutes) => {
    setTimerMinutesLocal(minutes);
    setShowTimerSettings(false);
    setShowTimer(true);
  };
  
  return (
    <>
      <div className={`toolbar toolbar--${isDarkMode ? 'dark' : 'light'} ${isToolbarCollapsed ? 'toolbar--collapsed' : ''}`} 
        style={{
          top: `${toolbarPosition.y}px`, 
          left: `${toolbarPosition.x}px`,
          // Collapse durumunda toolbar yüksekliğini ayarla (sadece başlık göster)
          height: isToolbarCollapsed ? 'auto' : undefined,
          transition: 'height 0.3s ease, opacity 0.2s ease',
          width: '120px'
        }}
      >
      <div 
        className="toolbar-header"
        onMouseDown={startDraggingToolbar}
      >
        <div style={{ 
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'move'
        }}>
          <Move size={20} />
        </div>
        <div 
          style={{ 
            padding: '0.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setToolbarCollapsed(!isToolbarCollapsed)}
          title={isToolbarCollapsed ? "Expand toolbar" : "Collapse toolbar"}
        >
          {isToolbarCollapsed ? <ChevronDown size={20} /> : <X size={20} />}
        </div>
      </div>
      
      {/* Toolbar içeriği - Collapse durumundaysa gizle */}
      {!isToolbarCollapsed && (
        <>
          {/* Saat */}
          <div className="toolbar-clock">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          
          {/* Paired tool buttons in rows */}
          
          {/* Row 1: Hand and Settings side by side */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${tool === 'hand' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setTool('hand');
                setShowToolOptions(false);
              }}
              data-tooltip="Selection Tool"
            >
              <Hand size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showSettings ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setShowSettings(!showSettings)}
              data-tooltip="Settings"
            >
              <Settings size={22} />
            </button>
          </div>
          
          {/* Row 2: Pen Tool and Highlighter side by side */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${tool === 'pen' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => selectTool('pen')}
              data-tooltip="Pen Tool"
            >
              <Pencil size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${tool === 'highlighter' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => selectTool('highlighter')}
              data-tooltip="Highlighter Tool"
            >
              <Highlighter size={22} />
            </button>
          </div>
          
          {/* Row 3: Eraser and Clear side by side */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${tool === 'eraser' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => selectTool('eraser')}
              data-tooltip="Eraser Tool"
            >
              <Eraser size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={clearDrawings}
              data-tooltip="Clear Drawings"
            >
              <Trash2 size={22} />
            </button>
          </div>
          
          {/* Row 4: Thumbnails and Focus Tool side by side */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${showThumbnails ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setShowThumbnails(!showThumbnails)}
              data-tooltip="Thumbnails"
            >
              <Grid size={22} />
            </button>
            
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
              <Search size={22} />
            </button>
          </div>
          
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
                <ArrowLeft size={20} />
              </button>
              
              <button 
                className={`page-nav-button tooltip page-nav-button--${isDarkMode ? 'dark' : 'light'}`}
                onClick={nextPage}
                disabled={currentPage >= pages.length}
                data-tooltip="Next Page"
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
          
          {/* Row 5: Zoom controls side by side */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
              data-tooltip="Zoom In"
            >
              <ZoomIn size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              data-tooltip="Zoom Out"
            >
              <ZoomOut size={22} />
            </button>
          </div>
          
          {/* Timer ve Curtain kontrolleri yan yana */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${showTimer ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                if (!showTimer) {
                  setShowTimerSettings(true);
                } else {
                  setShowTimer(false);
                }
              }}
              data-tooltip="Timer"
            >
              <Clock size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showCurtain ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setShowCurtain(!showCurtain)}
              data-tooltip="Curtain"
            >
              {showCurtain ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
          
          {/* Logo at the bottom */}
          <div className="toolbar-logo">
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
              <img src="logo.png" alt="Richbook Logo" style={{ width: '50px', height: 'auto' }} />
              <div className="toolbar-logo-text">RichBook</div>
            </div>
          </div>
        </>
      )}
    </div>
    
      {/* Timer Settings Modal */}
      {showTimerSettings && (
        <TimerSettings
          isDarkMode={isDarkMode}
          initialMinutes={timerMinutes}
          onSave={handleSaveTimerSettings}
          onCancel={() => setShowTimerSettings(false)}
        />
      )}
    </>
  );
};

export default Toolbar;