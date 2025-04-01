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
  const [time, setTime] = useState(new Date());
  
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

  // Focus alanı ekran görüntüsü alma fonksiyonu
  const captureFocusArea = async (area) => {
    console.log("captureFocusArea called with:", area);
    
    if (!area || area.width < 20 || area.height < 20) {
      console.log("Area too small or invalid");
      return;
    }
    
    const containerElement = containerRef.current;
    if (!containerElement) {
      console.error("Container element not found");
      return;
    }
    
    // Seçim dikdörtgenini geçici olarak gizle
    setFocusArea(null);
    
    // Kısa bir gecikme ekle
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      console.log("Starting html2canvas capture");
      const canvas = await html2canvas(containerElement, {
        scrollX: 0,
        scrollY: 0,
        scale: 1,
        ignoreElements: (element) => {
          return element.classList && 
                 (element.classList.contains('selection-rect') || 
                  element.classList.contains('toolbar'));
        }
      });
      
      console.log("html2canvas capture successful", canvas.width, canvas.height);
      
      // Koordinatları hesapla
      const x = Math.floor(area.x / zoom);
      const y = Math.floor(area.y / zoom);
      const width = Math.ceil(area.width / zoom);
      const height = Math.ceil(area.height / zoom);
      
      // Kırpma işlemi
      const ctx = canvas.getContext('2d');
      const actualX = Math.max(0, x);
      const actualY = Math.max(0, y);
      const actualWidth = Math.min(width, canvas.width - actualX);
      const actualHeight = Math.min(height, canvas.height - actualY);
      
      if (actualWidth <= 0 || actualHeight <= 0) {
        throw new Error("Invalid cropping dimensions");
      }
      
      // Canvas'ı kırp
      const imageData = ctx.getImageData(actualX, actualY, actualWidth, actualHeight);
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = actualWidth;
      croppedCanvas.height = actualHeight;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.putImageData(imageData, 0, 0);
      
      // dataURL'i al
      const dataURL = croppedCanvas.toDataURL();
      
      // Focus alanını güncelle ve modu etkinleştir
      setFocusArea({
        ...area,
        dataURL: dataURL,
        originalWidth: area.width,
        originalHeight: area.height
      });
      
      setIsFocusMode(true);
      setIsSelectingFocusArea(false);
      
      console.log("Focus mode activated");
    } catch (error) {
      console.error("Error capturing focus area:", error);
      
      // Fallback görüntüsü
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = area.width;
      fallbackCanvas.height = area.height;
      const fallbackCtx = fallbackCanvas.getContext('2d');
      fallbackCtx.fillStyle = '#f0f0f0';
      fallbackCtx.fillRect(0, 0, area.width, area.height);
      fallbackCtx.font = '14px Arial';
      fallbackCtx.fillStyle = 'black';
      fallbackCtx.textAlign = 'center';
      fallbackCtx.fillText('Görüntü alınamadı', area.width/2, area.height/2);
      
      // Fallback görüntüsünü kullan
      setFocusArea({
        ...area,
        dataURL: fallbackCanvas.toDataURL(),
        originalWidth: area.width,
        originalHeight: area.height
      });
      
      setIsFocusMode(true);
      setIsSelectingFocusArea(false);
    }
  };
  
  // Mouse up handler - focus alanı için
  const customHandleMouseUp = () => {
    console.log("CustomHandleMouseUp called. isSelectingFocusArea:", isSelectingFocusArea);
    
    // Focus alanı seçiliyorsa
    if (isSelectingFocusArea && dragStart && focusArea) {
      console.log("Focus area selected:", focusArea);
      const tempFocusArea = { ...focusArea };
      captureFocusArea(tempFocusArea);
      setDragStart(null);
      return;
    }
    
    // Normal çizim işlemleri için useDrawing hook'undaki handler'ı çağır
    handleMouseUp();
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
      goToPage(currentPage - 1);
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
      className={`digital-teaching-container ${isDarkMode ? 'digital-teaching-container--dark' : 'digital-teaching-container--light'}`}
      onMouseMove={(e) => {
        handleMouseMoveToolbar(e);
        handleMouseMove(e);
      }}
      onMouseUp={() => {
        stopDraggingToolbar();
        customHandleMouseUp();
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
          }}
        />
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
      </div>
    </div>
  );
};

export default DigitalTeachingTool;