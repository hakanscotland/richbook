// src/components/DigitalTeachingTool/index.js
// Ana bileşen - sadece alt bileşenleri bir araya getirir ve durum yönetimini yapar

// Import doğrudan html2canvas kütüphanesini dahil et, eğer bu kütüphane yüklü değilse
// npm install html2canvas ile yükleyin
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toolbar, Timer } from './components';
import PageRenderer from './PageRenderer';
import DrawingCanvas from './DrawingCanvas';
import FocusArea from './FocusToolV2'; // Yeni FocusToolV2'yi kullanıyoruz
import ThumbnailSidebar from './ThumbnailSidebar';
import ToolOptions from './ToolOptions';
import Curtain from '../Curtain'; // Üst düzey bileşenlerden biri
import SettingsMenu from '../SettingsMenu'; // Üst düzey bileşenlerden biri
import useDrawing from './hooks/useDrawing';
import useImageDecryption from './hooks/useImageDecryption';
import useGestures from './hooks/useGestures';
import html2canvas from 'html2canvas'; // HTML2Canvas doğrudan dahil ediliyor
import './DigitalTeachingTool.css';
import './gestures.css'; // Çok parmak hareketleri için CSS
import './force-toolbar-width'; // Toolbar genişliğini zorlamak için

const DigitalTeachingTool = () => {
  // Genel UI durumu
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDoublePageView, setIsDoublePageView] = useState(false);
  const [isHalfPageView, setIsHalfPageView] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [time, setTime] = useState(new Date())
  const [isToolbarCollapsed, setIsToolbarCollapsed] = useState(false);
  
  // Timer durumu
  const [showTimer, setShowTimer] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);

  // Araç paneli durumu
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showToolOptions, setShowToolOptions] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  
  // Çizim ve sayfa durumu
  const [tool, setTool] = useState('hand');
  const [previousTool, setPreviousTool] = useState(null);
  const [color, setColor] = useState('#0096FF');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDrawings, setPageDrawings] = useState({});
  
  // Focus aracı durumu
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSelectingFocusArea, setIsSelectingFocusArea] = useState(false);
  const [focusArea, setFocusArea] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  
  // Referanslar
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  
  const {
    pages,
    isLoadingImages,
    decryptedImages
  } = useImageDecryption();
  
  // Custom hooks
  const { 
    lines, 
    currentLine, 
    handleMouseDown, 
    handleMouseMove, 
    handleMouseUp, 
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearDrawings 
  } = useDrawing({
    tool,
    color,
    strokeWidth,
    opacity,
    zoom,
    stageRef,
    currentPage,
    pageDrawings,
    setPageDrawings,
    isSelectingFocusArea,
    setIsSelectingFocusArea,
    focusArea,
    setFocusArea,
    dragStart,
    setDragStart
  });
  
  // Sayfa navigasyon fonksiyonları
  const goToPage = useCallback((pageNum) => {
    if (pageNum >= 1 && pageNum <= pages.length) {
      setCurrentPage(pageNum);
    }
  }, [pages.length, setCurrentPage]);

  const nextPage = useCallback(() => {
    if (isDoublePageView) {
      goToPage(Math.min(currentPage + 2, pages.length));
    } else {
      goToPage(currentPage + 1);
    }
  }, [currentPage, goToPage, isDoublePageView, pages.length]);
  
  const prevPage = useCallback(() => {
    if (isDoublePageView) {
      goToPage(Math.max(currentPage - 2, 1));
    } else {
      goToPage(Math.max(currentPage - 1, 1));
    }
  }, [currentPage, goToPage, isDoublePageView]);
  
  // Gesture hooks (çok parmak hareketleri için)
  const {
    isPinchActive,
    isSwipeActive
  } = useGestures({
    containerRef,
    zoom,
    setZoom,
    currentPage,
    totalPages: pages.length,
    goToPage,
    nextPage,
    prevPage,
    isDoublePageView,
    isHalfPageView,
    tool
  });
  
  // Dokunmatik cihaz tespiti
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
  // Dokunmatik cihazlar için özel işlevler
  useEffect(() => {
    // iPad'de sayfa navigasyon butonlarına dokunma işlevini iyileştir
    if (isTouchDevice) {
      console.log('Dokunmatik navigasyon işlevleri iyileştiriliyor...');
      
      // Sayfa navigasyon işlevselliğini kontrol et
      console.log('Sayfa navigasyon fonksiyonları:', { goToPage, nextPage, prevPage });
      
      // Global nesneye bağla (hata ayıklama için)
      window.richBookNav = { goToPage, nextPage, prevPage };
    }
  }, [isTouchDevice, goToPage, nextPage, prevPage]);
  
  useEffect(() => {
    // Dokunmatik cihaz algılama
    const detectTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || 
                      navigator.maxTouchPoints > 0 || 
                      navigator.msMaxTouchPoints > 0;
      
      console.log('Dokunmatik cihaz algılandı:', hasTouch);
      
      // Dokunmatik cihaz tespit edildiğinde CSS sınıfı ekle
      if (hasTouch) {
        document.documentElement.classList.add('touch-device');
        document.body.classList.add('touch-device');
      }
      
      // iPad/Tablet tespiti için daha geniş yöntemler kullan
      const isIPadOS13 = navigator.platform === 'MacIntel' && 'ontouchend' in document;
      const isIPad = /iPad/.test(navigator.userAgent) || isIPadOS13;
      const isTablet = /Tablet|iPad|Playbook|Android(?!.*Mobile)|Silk(?!.*Mobile)/.test(navigator.userAgent);
      
      // iPad veya tablet ise özel CSS sınıfları ekle
      if (isIPad || isTablet) {
        console.log('iPad/Tablet algılandı:', isIPad ? 'iPad' : 'Tablet');
        document.documentElement.classList.add('ipad-device');
        document.body.classList.add('ipad-device');
        document.documentElement.style.setProperty('--toolbar-width', '192px');
      } else {
        document.documentElement.style.setProperty('--toolbar-width', '120px');
      }
      
      return hasTouch;
    };
    
    setIsTouchDevice(detectTouchDevice());
    
    // iPad ve dokunmatik cihazlarda çizim performansını iyileştir
    if (stageRef.current) {
      const stage = stageRef.current;
      
      // Konva Stage'i dokunmatik cihazlar için optimize et
      if (stage.canvas && stage.canvas._canvas) {
        const canvas = stage.canvas._canvas;
        
        // Canvas hızlandırma ayarları
        canvas.style.willChange = 'transform';
        
        // Safari'de smoothing performansını artır
        const context = canvas.getContext('2d');
        if (context) {
          context.imageSmoothingEnabled = false;
        }
        
        // Dokunmatik cihazlar için ek optimizasyonlar
        if (isTouchDevice) {
          // Dokunmatik vurgulama efektini kaldır
          canvas.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
          
          // Dokunmatik işaretçiyi geliştir
          canvas.style.touchAction = 'none';
          
          // Piksel oranını ayarla
          const pixelRatio = window.devicePixelRatio || 1;
          stage.pixelRatio(pixelRatio);
          
          // Hit tespitini optimize et (dokunmatik cihazlar için önemli)
          stage.hitStrokeWidth(10); // Dokunmatik için daha geniş vuruş alanı
        }
      }
      
      // Konva'nın hit testi optimizasyonları
        if (typeof stage.hitGraphEnabled === 'function') {
          stage.hitGraphEnabled(false);
        } else {
          // Konva'nın yeni versiyonlarında bu özellik farklı olabilir
          // Kullanılabilir alternatifler:
          stage.listening(true); // Olayları dinlemeyi etkinleştir
        }
      
      // Konva performans ayarları
      stage.listening(true); // Olayları dinlemeyi etkinleştir
      
      // perfectDrawEnabled metodu için güvenli kontrol
      if (typeof stage.perfectDrawEnabled === 'function') {
        stage.perfectDrawEnabled(false); // Mükemmel çizim modunu devre dışı bırak
      }
      
      // Transformations kontrolü
      if (typeof stage.transformsEnabled === 'function') {
        stage.transformsEnabled('position'); // Sadece pozisyon dönüşümlerini etkinleştir
      }
    }
  }, [isTouchDevice]);
  
  // Saati güncelle
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Pencere boyutu değişikliğini izle
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC key to exit focus mode or selection mode
      if (e.key === 'Escape') {
        if (isFocusMode) {
          setIsFocusMode(false);
          setFocusArea(null);
        } else if (isSelectingFocusArea) {
          setIsSelectingFocusArea(false);
          setFocusArea(null);
          setDragStart(null);
        }
      }
      
      // F key to activate focus tool
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (!isFocusMode) {
          setIsSelectingFocusArea(!isSelectingFocusArea);
          if (isSelectingFocusArea) {
            setFocusArea(null);
          }
          setTool('hand');
          setShowToolOptions(false);
        }
      }
      
      // Spacebar to toggle between hand tool and previous tool (while held)
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault(); // Prevent page scrolling
        if (tool !== 'hand') {
          setPreviousTool(tool);
          setTool('hand');
        }
      }
    };
    
    const handleKeyUp = (e) => {
      // Release spacebar to return to previous tool
      if (e.code === 'Space') {
        e.preventDefault();
        if (previousTool && tool === 'hand') {
          setTool(previousTool);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [tool, previousTool, isFocusMode, isSelectingFocusArea]);

  // HTML2Canvas ile ekran görüntüsü alma
  const captureFocusArea = (area) => {
    console.log('Yakalama başladı, seçilen alan:', area);
    
    // Alan boyut kontrolü
    if (!area || area.width < 20 || area.height < 20) {
      console.log("Alan çok küçük");
      return;
    }
    
    try {
      // Maksimum kalitede yakalama yapmak için scale parametresini daha yüksek yap
      const captureScale = window.devicePixelRatio || 2;
      
      // Önemli: Yüksek kaliteli görüntü için doğrudan tam görüntü alanını yakala
      const captureOpts = {
        allowTaint: true,      // Güvenlik kısıtlamalarını esnet
        useCORS: true,         // Cross-origin görselleri yakalamaya çalış
        scale: captureScale,   // Yüksek kalite görüntü için ölçekleme 
        backgroundColor: isDarkMode ? '#111827' : '#ffffff',
        logging: true,         // Hata ayıklama için
        ignoreElements: (element) => {
          // Bazı gereksiz elemanları yoksay
          return element.classList && (
            element.classList.contains('focus-modal') ||
            element.classList.contains('selection-rect')
          );
        }
      };
      
      console.log('Yakalama ayarları:', captureOpts);
      
      // Sayfadan ekran görüntüsü al
      html2canvas(document.body, captureOpts).then(canvas => {
        try {
          console.log('Tam görüntü boyutu:', canvas.width, 'x', canvas.height);
          console.log('Kırpma bölgesi:', area.x, area.y, area.width, area.height);
          
          // Öğe tarafından seçilen bölgeyi kırpma
          const croppedCanvas = document.createElement('canvas');
          const ctx = croppedCanvas.getContext('2d');
          
          // Yakalanan bölgenin gerçek boyutunu ayarla
          croppedCanvas.width = area.width;
          croppedCanvas.height = area.height;
          
          // Kırpma işlemi - ana canvas'tan seçilen alanı çıkar
          ctx.drawImage(
            canvas,                         // Kaynak canvas
            area.x * captureScale,         // Kaynak X (scale ile çarp)
            area.y * captureScale,         // Kaynak Y (scale ile çarp)
            area.width * captureScale,     // Kaynak genişlik (scale ile çarp)
            area.height * captureScale,    // Kaynak yükseklik (scale ile çarp)
            0, 0,                           // Hedef pozisyon (0,0)
            area.width,                    // Hedef genişlik
            area.height                    // Hedef yükseklik
          );
          
          // Kırpılmış görüntüyü URL'e çevir
          const dataURL = croppedCanvas.toDataURL('image/png');
          
          console.log('Kırpılmış görüntü oluşturuldu');
          
          // Focus alanını ayarla ve doğru boyutları kullan
          setFocusArea({
            ...area, 
            dataURL, 
            originalWidth: area.width,
            originalHeight: area.height,
            initialZoom: 1.0, // Tam boyutta göster
            captureTime: Date.now() // Her yakalamayı benzersiz yap
          });
          
          // Modal'i göster
          setIsFocusMode(true);
          setIsSelectingFocusArea(false);
          
        } catch (cropError) {
          console.error('Kırpma hatası:', cropError);
          // Hata durumunda alternatif yöntem dene
          simpleCaptureAsFallback(area);
        }
      }).catch(error => {
        console.error('HTML2Canvas hatası:', error);
        simpleCaptureAsFallback(area);
      });
      
    } catch (error) {
      console.error('Ana yakalama hatası:', error);
      simpleCaptureAsFallback(area);
    }
  };
      
      // Basit yakalama yöntemi - son çare olarak kullan
      const simpleCaptureAsFallback = (area) => {
      try {
      console.log('Alternatif yakalama yöntemi kullanılıyor...');
      // Stage'i veya konva element referansını al
      const stage = stageRef.current;
      if (!stage) {
        console.error('Stage referansı bulunamadı!');
        return;
      }
      
      // Mevcut yapılandırmayı kaydet
      const originalSize = stage.size();
      const originalScale = stage.scale();
      
      try {
      // Görüntüyü yüksek kalitede yakalamak için geçici olarak boyutu ve ölçeği ayarla
        stage.width(area.width);
        stage.height(area.height);
        stage.scale({ x: 1, y: 1 });
        
        // Tuvali seçilen alana taşı
        stage.position({ 
            x: -area.x,
          y: -area.y
          });
            
        // Ekran görüntüsü al
        const dataURL = stage.toDataURL({
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          pixelRatio: 2 // Yüksek kalite için
        });
        
        console.log('Alternatif yakalama başarılı');
        
        // Focus alanını ayarla
        setFocusArea({
          ...area,
          dataURL,
          originalWidth: area.width,
          originalHeight: area.height,
          initialZoom: 1.0,
          captureTime: Date.now() // Her yakalamayı benzersiz yap
        });
        
        // Modu aç
        setIsFocusMode(true);
        setIsSelectingFocusArea(false);
        
      } finally {
        // Stage'i orijinal durumuna geri getir
        stage.size(originalSize);
        stage.scale(originalScale);
        stage.batchDraw();
      }
    } catch (e) {
      console.error('Basit yakalama hatası:', e);
      alert('Görüntü yakalama işlemi başarısız oldu. Lütfen tekrar deneyin.');
    }
  };
  
  // Mouse up handler - focus alanı için
  const customHandleMouseUp = () => {
    // Focus alanı seçiliyorsa
    if (isSelectingFocusArea && dragStart && focusArea) {
      // Create a copy of the focus area to avoid state issues
      const tempFocusArea = { ...focusArea };
      
      console.log('Selected area dimensions:', tempFocusArea.width, 'x', tempFocusArea.height, 'at position', tempFocusArea.x, ',', tempFocusArea.y);
      
      // Only proceed if the area is large enough
      if (tempFocusArea.width >= 20 && tempFocusArea.height >= 20) {
        // Wait a moment to ensure state is stable before capturing
        setTimeout(() => {
          captureFocusArea(tempFocusArea);
        }, 50);
      } else {
        // Show a notification if area is too small
        console.log("Selected area is too small. Please select a larger area.");
        setIsSelectingFocusArea(true); // Keep selection mode active
      }
      
      setDragStart(null);
      return;
    }
    
    // Normal çizim işlemleri için useDrawing hook'undaki handler'ı çağır
    handleMouseUp();
  };
  
  // Dokunmatik mouse yukarı işleyicisi
  const customHandleTouchEnd = (e) => {
    // Focus alanı seçiliyorsa
    if (isSelectingFocusArea && dragStart && focusArea) {
      // Create a copy of the focus area to avoid state issues
      const tempFocusArea = { ...focusArea };
      
      // Only proceed if the area is large enough
      if (tempFocusArea.width >= 20 && tempFocusArea.height >= 20) {
        // Wait a moment to ensure state is stable before capturing
        setTimeout(() => {
          captureFocusArea(tempFocusArea);
        }, 50);
      } else {
        // Show a notification if area is too small
        console.log("Selected area is too small. Please select a larger area.");
        setIsSelectingFocusArea(true); // Keep selection mode active
      }
      
      setDragStart(null);
      return;
    }
    
    // Normal çizim işlemleri için useDrawing hook'undaki handler'ı çağır
    handleTouchEnd(e);
  };
  
  // Toolbar sürükleme işleyicileri
  const startDraggingToolbar = (e) => {
    if (tool !== 'hand' && tool !== 'focus') return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - toolbarPosition.x,
      y: e.clientY - toolbarPosition.y
    });
  };

  const handleMouseMoveToolbar = (e) => {
    if (!isDragging) return;
    
    setToolbarPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const stopDraggingToolbar = () => {
    setIsDragging(false);
  };
  
  // Araç seçim işleyicisi
  const selectTool = (newTool) => {
    setTool(newTool);
    setShowToolOptions(true);
    
    // Araç seçildiğinde settings menüsünü kapat
    setShowSettings(false);
    
    // Araç türüne göre uygun değerleri ayarla
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
  };

  return (
    <div 
      ref={containerRef}
      className={`digital-teaching-container ${isDarkMode ? 'digital-teaching-container--dark' : 'digital-teaching-container--light'} ${isTouchDevice ? 'touch-device' : ''}`}
      style={{
        position: 'absolute', // 'fixed' yerine 'absolute' kullanın
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        zIndex: 0, // Diğer bileşenlerin üste çıkabilmesi için düşük bir z-index
      }}
      onMouseMove={(e) => {
        handleMouseMoveToolbar(e);
        handleMouseMove(e);
      }}
      onMouseUp={() => {
        stopDraggingToolbar();
        customHandleMouseUp();
      }}
      onTouchEnd={() => {
        stopDraggingToolbar();
        customHandleTouchEnd();
      }}
    >
      {/* Sayfa görüntüleyici */}
      <PageRenderer 
        currentPage={currentPage}
        pages={pages}
        decryptedImages={decryptedImages}
        isLoadingImages={isLoadingImages}
        zoom={zoom}
        isDoublePageView={isDoublePageView}
        isHalfPageView={isHalfPageView}
      />

      {/* Çizim alanı */}
      <DrawingCanvas 
        stageRef={stageRef}
        dimensions={dimensions}
        zoom={zoom}
        tool={isSelectingFocusArea ? 'focus' : tool}
        isSelectingFocusArea={isSelectingFocusArea}
        showCurtain={showCurtain}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUp={customHandleMouseUp}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        handleTouchEnd={customHandleTouchEnd}
        lines={lines}
        currentLine={currentLine}
      />
      
      {/* Seçim dikdörtgeni - Focus aracı için */}
      {isSelectingFocusArea && dragStart && focusArea && (
        <div 
          className="selection-rect"
          style={{
            left: `${focusArea.x}px`,
            top: `${focusArea.y}px`,
            width: `${focusArea.width}px`,
            height: `${focusArea.height}px`,
            border: '2px dashed #3b82f6', 
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            pointerEvents: 'none',
            zIndex: 700,
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2)', 
            transition: 'border-color 0.2s ease',
          }}
        />
      )}

      {/* Focus selection mode indicator */}
      {isSelectingFocusArea && (
        <div 
          style={{
            position: 'absolute',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            color: isDarkMode ? '#f9fafb' : '#1f2937',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '14px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            zIndex: 750,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div 
            style={{ 
              width: '12px', 
              height: '12px', 
              backgroundColor: '#3b82f6', 
              borderRadius: '50%', 
              animation: 'pulse 1.5s infinite' 
            }} 
          />
          {isTouchDevice ? 'Tap and drag to select focus area' : 'Click and drag to select focus area'}
        </div>
      )}

      {/* Araç çubuğu */}
      <Toolbar 
        time={time}
        isDarkMode={isDarkMode}
        toolbarPosition={toolbarPosition}
        startDraggingToolbar={startDraggingToolbar}
        tool={tool}
        setTool={setTool}
        selectTool={selectTool}
        showToolOptions={showToolOptions}
        setShowToolOptions={setShowToolOptions}
        isSelectingFocusArea={isSelectingFocusArea}
        setIsSelectingFocusArea={setIsSelectingFocusArea}
        setFocusArea={setFocusArea}
        clearDrawings={clearDrawings}
        currentPage={currentPage}
        pages={pages}
        goToPage={goToPage}
        nextPage={nextPage}
        prevPage={prevPage}
        zoom={zoom}
        setZoom={setZoom}
        showThumbnails={showThumbnails}
        setShowThumbnails={setShowThumbnails}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        showCurtain={showCurtain}
        setShowCurtain={setShowCurtain}
        isTouchDevice={isTouchDevice}
        isToolbarCollapsed={isToolbarCollapsed}
        setToolbarCollapsed={setIsToolbarCollapsed}
        showTimer={showTimer}
        setShowTimer={setShowTimer}
        setTimerMinutes={setTimerMinutes}
      />
      
      {/* Araç seçenekleri panel */}
      {showToolOptions && tool !== 'hand' && (
        <ToolOptions 
          tool={tool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          opacity={opacity}
          setOpacity={setOpacity}
          isDarkMode={isDarkMode}
          toolbarPosition={toolbarPosition}
          setShowToolOptions={setShowToolOptions}
        />
      )}
      
      {/* Ayarlar menüsü */}
      {showSettings && (
        <SettingsMenu 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          isDoublePageView={isDoublePageView}
          setIsDoublePageView={setIsDoublePageView}
          isHalfPageView={isHalfPageView}
          setIsHalfPageView={setIsHalfPageView}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {/* Perde özelliği */}
      {showCurtain && (
        <Curtain 
          isDarkMode={isDarkMode}
          onClose={() => setShowCurtain(false)}
        />
      )}
      
      {/* Timer özelliği */}
      {showTimer && (
        <Timer 
          isDarkMode={isDarkMode}
          initialMinutes={timerMinutes}
          onClose={() => setShowTimer(false)}
        />
      )}
      
      {/* Odak alanı penceresi - Yeni V2 Focus Tool kullanılıyor */}
      {isFocusMode && focusArea && (
        <FocusArea 
          focusArea={focusArea}
          setFocusArea={setFocusArea}
          isFocusMode={isFocusMode}
          setIsFocusMode={setIsFocusMode}
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          opacity={opacity}
          setOpacity={setOpacity}
          isDarkMode={isDarkMode}
        />
      )}
            
      {/* Küçük resimler kenar çubuğu */}
      {showThumbnails && (
        <ThumbnailSidebar 
          pages={pages}
          currentPage={currentPage}
          decryptedImages={decryptedImages}
          isLoadingImages={isLoadingImages}
          goToPage={goToPage}
          setShowThumbnails={setShowThumbnails}
          isDarkMode={isDarkMode}
        />
      )}
      
      {/* Durum bilgisi */}
      <div className={`status-info status-info--${isDarkMode ? 'dark' : 'light'}`}>
        {tool !== 'hand' ? `Drawing: ${tool} (${strokeWidth}px)` : 'Navigation mode'}
        {` • Zoom: ${Math.round(zoom * 100)}%`}
        {` • View: ${isDoublePageView ? 'Double Page' : isHalfPageView ? 'Half Page' : 'Single Page'}`}
        {` • Press F for focus tool, Space for hand tool`}
      </div>
      
      {/* Çok parmak hareketi göstergeleri */}
      <div className={`pinch-indicator ${isPinchActive ? 'active' : ''}`}>
        <span className="pinch-indicator-icon">⇆</span>
      </div>
      <div className={`swipe-indicator swipe-indicator-left ${isSwipeActive ? 'active' : ''}`}>
        <span className="swipe-indicator-icon">←</span>
      </div>
      <div className={`swipe-indicator swipe-indicator-right ${isSwipeActive ? 'active' : ''}`}>
        <span className="swipe-indicator-icon">→</span>
      </div>
    </div>
  );
};

export default DigitalTeachingTool;