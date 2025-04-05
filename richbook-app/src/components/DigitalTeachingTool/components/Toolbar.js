import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Hand, ArrowLeft, ArrowRight, ZoomIn, ZoomOut,
  Grid, Settings, Move, X, ChevronDown, Clock, Trash2, RotateCcw
} from 'lucide-react';
import { CropIcon, CurtainClosedIcon, CurtainOpenIcon, DrawingToolIcon, HomeIcon } from '../icons/CustomIcons';
import DrawingTools from './DrawingTools';
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
  showTooltips = true, // Tooltip gösterme ayarı
  autoFadeToolbar = true, // Toolbar otomatik solma özelliği
}) => {
  // Sayfa numarası düzenleme durumu
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");
  
  // Konsola showTooltips değierini yazdıralım
  useEffect(() => {
    console.log('Toolbar içinde tooltip state: ', showTooltips);
  }, [showTooltips]);

  // Auto-fade functionality
  const [isToolbarFaded, setIsToolbarFaded] = useState(false);
  const inactivityTimerRef = useRef(null);

  // Mouse hareketi veya tıklama gibi etkileşimleri izle
  const startInactivityTimer = useCallback(() => {
    // Önce mevcut timer'i temizle
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Toolbar'i görünür yap
    setIsToolbarFaded(false);

    // AutoFade etkinleştirilmişse 10 saniye sonra soluklaştır
    if (autoFadeToolbar) {
      inactivityTimerRef.current = setTimeout(() => {
        setIsToolbarFaded(true);
      }, 10000); // 10 saniye
    }
  }, [autoFadeToolbar]);

  // Component yüklenirken ve autoFadeToolbar ayarı değiştiğinde inaktivite timer'ı başlat
  useEffect(() => {
    // AutoFade devre dışıysa ve toolbar faded durumdaysa, görünür duruma getir
    if (!autoFadeToolbar && isToolbarFaded) {
      setIsToolbarFaded(false);
    } else {
      startInactivityTimer();
    }

    // Event dinleyicileri ekle
    const handleEvent = () => startInactivityTimer();
    document.addEventListener('mousemove', handleEvent);
    document.addEventListener('click', handleEvent);
    document.addEventListener('touchstart', handleEvent);
    document.addEventListener('keydown', handleEvent);

    // Cleanup
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      document.removeEventListener('mousemove', handleEvent);
      document.removeEventListener('click', handleEvent);
      document.removeEventListener('touchstart', handleEvent);
      document.removeEventListener('keydown', handleEvent);
    };
  }, [autoFadeToolbar, isToolbarFaded, startInactivityTimer]);

  // Zoom'u sıfırlama fonksiyonu
  const resetZoom = () => {
    setZoom(1);
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
      <div className={`toolbar toolbar--${isDarkMode ? 'dark' : 'light'} ${isToolbarCollapsed ? 'toolbar--collapsed' : ''} ${isTouchDevice ? 'touch-toolbar' : ''} ${isToolbarFaded ? 'toolbar--faded' : ''}`} 
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
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
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
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${showSettings ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
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
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${tool === 'hand' ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setTool('hand');
                setShowToolOptions(false);
              }}
              data-tooltip="Hand Tool"
            >
              <Hand size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${['pen', 'highlighter', 'eraser'].includes(tool) ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                // Önce diğer butonlarla etkileşimde olan panelleri kapat
                setShowSettings(false);
                setShowTimer(false);
                setShowCurtain(false);
                
                // Drawing Tools panelini aç/kapat
                const willOpen = !showDrawingTools;
                setShowDrawingTools(willOpen);
                
                // Eğer panel açılıyorsa, kalem seçili olsun
                if (willOpen) {
                  selectTool('pen');
                  setColor('#000000'); // Siyah renk
                  setStrokeWidth(4);    // Orta kalınlık (M boyutu)
                }
                
                // Close the tool options panel when opening drawing tools
                if (willOpen) {
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
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${showThumbnails ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setShowThumbnails(!showThumbnails);
                setShowDrawingTools(false); // Drawing paneli kapat
              }}
              data-tooltip="Thumbnails"
            >
              <Grid size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${isSelectingFocusArea ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
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
          
          {/* Row 4.5: Reset ve Clear butonları yan yana */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px', marginBottom: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={resetZoom}
              data-tooltip="Reset Zoom"
            >
              <RotateCcw size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={clearDrawings}
              data-tooltip="Clear All"
            >
              <Trash2 size={22} />
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
              className={`page-nav-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} page-nav-button--${isDarkMode ? 'dark' : 'light'} ${isTouchDevice ? 'touch-button' : ''}`}
              onClick={prevPage}
              disabled={currentPage <= 1}
              data-tooltip="Previous Page"
                style={{ minHeight: isTouchDevice ? '40px' : '32px' }}
            >
                <ArrowLeft size={isTouchDevice ? 24 : 20} />  {/* iPad ve touch cihazlar için daha büyük ikon */}
              </button>
              
              <button 
                className={`page-nav-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} page-nav-button--${isDarkMode ? 'dark' : 'light'} ${isTouchDevice ? 'touch-button' : ''}`}
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
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
              data-tooltip="Zoom In"
            >
              <ZoomIn size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
              data-tooltip="Zoom Out"
            >
              <ZoomOut size={22} />
            </button>
          </div>
          
          {/* Timer ve Curtain kontrolleri yan yana */}
          <div className="toolbar-button-pair" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridGap: '10px' }}>
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${showTimer ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
              onClick={() => {
                setShowTimer(!showTimer);
                setShowDrawingTools(false); // Drawing paneli kapat
              }}
              data-tooltip="Timer"
            >
              <Clock size={22} />
            </button>
            
            <button 
              className={`toolbar-button tooltip ${showTooltips ? 'tooltip-enabled' : ''} ${showCurtain ? 'toolbar-button--active' : ''} toolbar-button--${isDarkMode ? 'dark' : 'light'}`}
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
          
          {/* Dijital Saat - Logo üstüne taşındı, doğal görünüm */}
          <div className="toolbar-clock toolbar-clock--natural">
            <ClockDisplay time={time} />
          </div>
          
          {/* Logo at the bottom */}
          <div className="toolbar-logo">
            <div 
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}
              onDoubleClick={() => window.open('https://www.richbook.co.uk', '_blank')}
              title="Double-click to visit Richbook website"
            >
              <img src="logo.png" alt="Richbook Logo" style={{ width: '50px', height: 'auto' }} />
              <div className="toolbar-logo-text">RichBook</div>
            </div>
          </div>
        </>
      )}
    </div>
    
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