// src/components/DigitalTeachingTool/index.js
// Ana bileşen - sadece alt bileşenleri bir araya getirir ve durum yönetimini yapar

import React, { useState, useEffect, useRef } from 'react';
import { Stage, Layer } from 'react-konva';
import Toolbar from './Toolbar';
import PageRenderer from './PageRenderer';
import DrawingCanvas from './DrawingCanvas';
import FocusArea from './FocusArea';
import ThumbnailSidebar from './ThumbnailSidebar';
import ToolOptions from './ToolOptions';
import Curtain from '../Curtain'; // Üst düzey bileşenlerden biri
import SettingsMenu from '../SettingsMenu'; // Üst düzey bileşenlerden biri
import useDrawing from './hooks/useDrawing';
import useImageDecryption from './hooks/useImageDecryption';
import html2canvas from 'html2canvas';
import './DigitalTeachingTool.css';

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
  
  // Custom hooks
  const { 
    lines, 
    currentLine, 
    isDrawing, 
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
  
  const {
    pages,
    isLoadingImages,
    decryptedImages
  } = useImageDecryption();
  
  // Dokunmatik cihaz tespiti
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  
// index.js dosyasında bulunan useEffect hook'unu şu şekilde düzeltin:

useEffect(() => {
  // Dokunmatik cihaz algılama
  const detectTouchDevice = () => {
    return ('ontouchstart' in window) || 
      (navigator.maxTouchPoints > 0) || 
      (navigator.msMaxTouchPoints > 0);
  };
  
  setIsTouchDevice(detectTouchDevice());
  
  // iPad ve dokunmatik cihazlarda çizim performansını iyileştir
  // Bu kısmı düzeltelim:
  if (stageRef.current) {
    // Konva Stage'in düzgün yüklendiğinden emin ol
    const stage = stageRef.current;
    
    // NOT: Konva'nın canvas'a erişimi bu şekilde olmalı
    // Hatalı olan kısım burasıydı:
    if (stage.canvas) {
      // canvas nesnesine doğrudan erişim
      stage.canvas._canvas.style.width = '100%';
      stage.canvas._canvas.style.height = '100%';
    }
    
    // Dokunmatik olaylar için listening parametresini ayarla
    stage.listening(true);

    // iPad'de Konva performansını optimize et
    if (isTouchDevice && stageRef.current) {
      // Gereksiz yeniden çizim işlemlerini azalt
      stageRef.current.batchDraw();
      
      // Safari'de smoothing performansını artır
      const context = stageRef.current.getContext()._context;
      context.imageSmoothingEnabled = false;
    }
        
    // Hit tespiti ayarlarını optimize et
    if (typeof stage.hitOnDragEnabled === 'function') {
      stage.hitOnDragEnabled(false);
      }
    }
  }, []);
  
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

  // Focus alanı ekran görüntüsü alma fonksiyonu
  const captureFocusArea = async (area) => {
    // Validate the area dimensions
    if (!area || area.width < 20 || area.height < 20) {
      console.log("Area too small or invalid");
      return;
    }
    
    const containerElement = containerRef.current;
    if (!containerElement) {
      console.error("Container element not found");
      return;
    }
    
    // Hide the selection rectangle temporarily
    const tempArea = {...area};
    setFocusArea(null);
    
    // Add a short delay to ensure UI updates before capture
    await new Promise(resolve => setTimeout(resolve, 200));
    
    try {
      // Capture the entire container
      const canvas = await html2canvas(containerElement, {
        scrollX: 0,
        scrollY: 0,
        scale: window.devicePixelRatio || 1, // Use device pixel ratio for better quality
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.classList && 
                 (element.classList.contains('selection-rect') || 
                  element.classList.contains('toolbar') ||
                  element.classList.contains('tool-options-panel'));
        }
      });
      
      // Calculate coordinates with zoom consideration
      const x = Math.floor(tempArea.x);
      const y = Math.floor(tempArea.y);
      const width = Math.ceil(tempArea.width);
      const height = Math.ceil(tempArea.height);
      
      // Crop the captured image
      const ctx = canvas.getContext('2d');
      const actualX = Math.max(0, x);
      const actualY = Math.max(0, y);
      const actualWidth = Math.min(width, canvas.width - actualX);
      const actualHeight = Math.min(height, canvas.height - actualY);
      
      if (actualWidth <= 0 || actualHeight <= 0) {
        throw new Error("Invalid cropping dimensions");
      }
      
      // Create a new canvas for the cropped area
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = actualWidth;
      croppedCanvas.height = actualHeight;
      const croppedCtx = croppedCanvas.getContext('2d');
      
      // Copy the image data from the source canvas to the cropped canvas
      const imageData = ctx.getImageData(actualX, actualY, actualWidth, actualHeight);
      croppedCtx.putImageData(imageData, 0, 0);
      
      // Get the data URL
      const dataURL = croppedCanvas.toDataURL('image/png');
      
      // Update focus area and enable focus mode
      setFocusArea({
        ...tempArea,
        dataURL: dataURL,
        originalWidth: actualWidth,
        originalHeight: actualHeight
      });
      
      setIsFocusMode(true);
      setIsSelectingFocusArea(false);
    } catch (error) {
      console.error("Error capturing focus area:", error);
      
      // Create a fallback image if capture fails
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = tempArea.width;
      fallbackCanvas.height = tempArea.height;
      const fallbackCtx = fallbackCanvas.getContext('2d');
      fallbackCtx.fillStyle = '#f0f0f0';
      fallbackCtx.fillRect(0, 0, tempArea.width, tempArea.height);
      fallbackCtx.font = '14px Arial';
      fallbackCtx.fillStyle = 'black';
      fallbackCtx.textAlign = 'center';
      fallbackCtx.fillText('Görüntü alınamadı', tempArea.width/2, tempArea.height/2);
      
      // Use the fallback image
      setFocusArea({
        ...tempArea,
        dataURL: fallbackCanvas.toDataURL(),
        originalWidth: tempArea.width,
        originalHeight: tempArea.height
      });
      
      setIsFocusMode(true);
      setIsSelectingFocusArea(false);
    }
  };
  
  // Mouse up handler - focus alanı için
  const customHandleMouseUp = () => {
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
        // You could implement a toast notification here
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
  const customHandleTouchEnd = () => {
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
    handleTouchEnd();
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
  
  // Sayfa navigasyon fonksiyonları
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pages.length) {
      setCurrentPage(pageNum);
    }
  };

  const nextPage = () => {
    if (isDoublePageView) {
      goToPage(Math.min(currentPage + 2, pages.length));
    } else {
      goToPage(currentPage + 1);
    }
  };
  
  const prevPage = () => {
    if (isDoublePageView) {
      goToPage(Math.max(currentPage - 2, 1));
    } else {
      goToPage(Math.max(currentPage - 1, 1));
    }
  };
  
  // Araç seçim işleyicisi
  const selectTool = (newTool) => {
    setTool(newTool);
    setShowToolOptions(true);
    
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
      onMouseMove={(e) => {
        handleMouseMoveToolbar(e);
        handleMouseMove(e);
      }}
      onMouseUp={() => {
        stopDraggingToolbar();
        customHandleMouseUp();
      }}
      onTouchMove={(e) => {
        // Dokunmatik olayları engelle
        e.preventDefault();
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
            border: '2px dashed #3b82f6', // Use a more visible blue color
            backgroundColor: 'rgba(59, 130, 246, 0.1)', // Light blue background
            pointerEvents: 'none',
            zIndex: 700,
            boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.2)', // Add subtle white outline for visibility
            transition: 'border-color 0.2s ease', // Smooth transition for visual feedback
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
        isToolbarCollapsed={isToolbarCollapsed}  // Yeni prop
        setToolbarCollapsed={setIsToolbarCollapsed}  // Yeni prop
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
      
      {/* Odak alanı penceresi */}
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
    </div>
  );
};

export default DigitalTeachingTool;