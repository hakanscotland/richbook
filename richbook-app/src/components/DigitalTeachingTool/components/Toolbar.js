import React, { useState, useEffect } from 'react';
import { 
  Hand, ArrowLeft, ArrowRight, ZoomIn, ZoomOut,
  Grid, Settings, Move, X, ChevronDown, Clock
} from 'lucide-react';
import { CropIcon, CurtainClosedIcon, CurtainOpenIcon, DrawingToolIcon, HomeIcon } from '../icons/CustomIcons';
import DrawingTools from './DrawingTools';
import TimerSettings from './TimerSettings';
import ClockDisplay from './ClockDisplay';
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
  showDrawingTools,
  setShowDrawingTools,
  color,
  setColor,
  strokeWidth,
  setStrokeWidth,
  opacity,
  setOpacity,
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
  
  useEffect(() => {
    // iPad ve dokunmatik cihazlarda sayfa navigasyon işlevini debug için global değişkene al
    if (isTouchDevice) {
      window.toolbarNav = {
        prevPage,
        nextPage,
        goToPage
      };
      console.log('Toolbar navigasyon fonksiyonları window.toolbarNav üzerinden erişilebilir');
    }
  }, [isTouchDevice, prevPage, nextPage, goToPage]);

  return (
    <>
      <div className={`toolbar toolbar--${isDarkMode ? 'dark' : 'light'} ${isToolbarCollapsed ? 'toolbar--collapsed' : ''} ${isTouchDevice ? 'touch-toolbar' : ''}`} 
        style={{
          top: `${toolbarPosition.y}px`, 
          left: `${toolbarPosition.x}px`,
          // Collapse durumunda toolbar yüksekliğini ayarla (sadece başlık göster)
          height: isToolbarCollapsed ? 'auto' : undefined,
          transition: 'height 0.3s ease, opacity 0.2s ease',
        }}
      >
      <div 
        className="toolbar-header"
        onMouseDown={startDraggingToolbar}
        onTouchStart={startDraggingToolbar}
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
          {/* Dijital Saat - Yanıp sönen iki nokta ile */}
          <div className="toolbar-clock">
            <ClockDisplay time={time} />
          </div>
          
          {/* Row 1: Home and Settings side by side */}
          <div 
            className="toolbar-button-pair home-settings-pair"
            style={{
              display: 'grid !important',
              gridTemplateColumns: '1fr 1fr !important', 
              gridGap: '10px', 
              marginBottom: '10px',
              width: '90%'
            }}
          >
            <button 
              className={`toolbar-button tooltip toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                // Diğer panelleri kapat
                setShowDrawingTools(false);
                setShowSettings(false);
                setShowTimer(false);
                setShowCurtain(false);
                // Ana sayfaya git
                goToPage(1);
              }}
              data-tooltip="Home Page"
            >
              <HomeIcon size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showSettings ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                // Önce diğer butonlarla etkileşimde olan panelleri kapat
                setShowDrawingTools(false);
                setShowTimer(false);
                setShowCurtain(false);
                
                // Sonra Settings panelini aç/kapat
                setShowSettings(!showSettings);
              }}
              data-tooltip="Settings"
            >
              <Settings size={22} />
            </button>
          </div>
          
          {/* Drawing tools and Hand tool side by side - Hand on left, drawing on right */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px', marginBottom: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${tool === 'hand' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setTool('hand');
                setShowToolOptions(false);
              }}
              data-tooltip="Hand Tool"
            >
              <Hand size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${['pen', 'highlighter', 'eraser'].includes(tool) ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                // Önce diğer butonlarla etkileşimde olan panelleri kapat
                setShowSettings(false);
                setShowTimer(false);
                setShowCurtain(false);
                // Drawing Tools panelini aç/kapat
                setShowDrawingTools(!showDrawingTools);
                // Close the tool options panel when opening drawing tools
                if (!showDrawingTools) {
                  setShowToolOptions(false);
                }
              }}
              data-tooltip="Drawing Tools"
            >
              <DrawingToolIcon size={22} />
            </button>
          </div>
          
          {/* Row 4: Thumbnails and Focus Tool side by side */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${showThumbnails ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setShowThumbnails(!showThumbnails);
                setShowDrawingTools(false); // Drawing paneli kapat
              }}
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
                setShowDrawingTools(false); // Drawing paneli kapat
              }}
              data-tooltip="Focus Tool"
            >
              <CropIcon size={22} />
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
              className={`page-nav-button tooltip page-nav-button--${isDarkMode ? 'dark' : 'light'} ${isTouchDevice ? 'touch-button' : ''}`}
              onClick={prevPage}
              disabled={currentPage <= 1}
              data-tooltip="Previous Page"
                style={{ minHeight: isTouchDevice ? '40px' : '32px' }}
            >
                <ArrowLeft size={isTouchDevice ? 24 : 20} />  {/* iPad ve touch cihazlar için daha büyük ikon */}
              </button>
              
              <button 
                className={`page-nav-button tooltip page-nav-button--${isDarkMode ? 'dark' : 'light'} ${isTouchDevice ? 'touch-button' : ''}`}
                onClick={nextPage}
                disabled={currentPage >= pages.length}
                data-tooltip="Next Page"
                style={{ minHeight: isTouchDevice ? '40px' : '32px' }}
              >
                <ArrowRight size={isTouchDevice ? 24 : 20} />  {/* iPad ve touch cihazlar için daha büyük ikon */}
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
                  setShowDrawingTools(false); // Drawing paneli kapat
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
              onClick={() => {
                setShowTimer(false); // Timer'ı kapat
                setShowDrawingTools(false); // Drawing paneli kapat
                setShowCurtain(!showCurtain);
              }}
              data-tooltip="Curtain"
            >
              {showCurtain ? <CurtainClosedIcon size={22} /> : <CurtainOpenIcon size={22} />}
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
      
      {/* Drawing Tools Panel */}
      {showDrawingTools && (
        <DrawingTools
          isDarkMode={isDarkMode}
          tool={tool}
          selectTool={selectTool}
          onClearDrawings={clearDrawings}
          toolbarPosition={toolbarPosition}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          opacity={opacity}
          setOpacity={setOpacity}
        />
      )}
    </>
  );
};

export default Toolbar;