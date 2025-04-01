// DigitalTeachingTool.js - Tüm özellikleri içeren ve html2canvas ile güncellenmiş tam sürüm
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Group, Image as KonvaImage } from 'react-konva';
import { 
  Home, Settings, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, 
  Hand, Pencil, Move, RotateCcw, Grid, FileText, Clock, 
  X, Trash2, Highlighter, Eraser, Search
} from 'lucide-react';
import SettingsMenu from './SettingsMenu';
import Curtain from './Curtain';
import html2canvas from 'html2canvas';

const DigitalTeachingTool = () => {
  // State for book pages and current page
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDrawings, setPageDrawings] = useState({});
  
  // Drawing state
  const [tool, setTool] = useState('hand');
  const [color, setColor] = useState('#0096FF'); // Blue default
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Page navigation state
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("");
  
  // Focus tool state
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isSelectingFocusArea, setIsSelectingFocusArea] = useState(false);
  const [focusArea, setFocusArea] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [focusDrawings, setFocusDrawings] = useState([]);
  const [currentFocusLine, setCurrentFocusLine] = useState(null);
  const [isFocusDrawing, setIsFocusDrawing] = useState(false);
  
  // UI state
  const [zoom, setZoom] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDoublePageView, setIsDoublePageView] = useState(false);
  const [isHalfPageView, setIsHalfPageView] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showToolOptions, setShowToolOptions] = useState(false);
  const [showCurtain, setShowCurtain] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [time, setTime] = useState(new Date());
  
  // Refs
  const stageRef = useRef(null);
  const containerRef = useRef(null);
  const focusCanvasRef = useRef(null);
  
  // Calculate window dimensions for canvas
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  // Predefined colors for quick selection
  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#FF8000', // Orange
    '#FFFF00', // Yellow
    '#00FF00', // Green
    '#00FFFF', // Cyan
    '#0000FF', // Blue
    '#8000FF', // Purple
    '#FF00FF', // Magenta
    '#FFFFFF'  // White
  ];

  // Predefined stroke widths
  const strokeWidths = [1, 2, 3, 5, 8, 12, 18, 24];

  // Load book pages
  useEffect(() => {
    // Define your book pages
    const bookPages = [
      { id: 1, src: 'book/page1.jpg' },
      { id: 2, src: 'book/page2.jpg' },
      { id: 3, src: 'book/page3.jpg' },
      { id: 4, src: 'book/page4.jpg' },
      { id: 5, src: 'book/page5.jpg' },
      { id: 6, src: 'book/page6.jpg' },
      // Add more pages as needed
    ];
    setPages(bookPages);
    
    // Add window resize listener
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save and load drawings for each page
  useEffect(() => {
    // Save current drawings before changing page
    if (lines.length > 0) {
      setPageDrawings(prev => ({
        ...prev,
        [currentPage]: lines
      }));
    }
    
    // Load drawings for the current page
    const savedDrawings = pageDrawings[currentPage] || [];
    setLines(savedDrawings);
  }, [currentPage]);

  // Handle toolbar dragging
  const startDraggingToolbar = (e) => {
    if (tool !== 'hand') return; // Only allow dragging in hand mode
    
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

  // Drawing handlers - Fixed to work with Konva stage
  const handleMouseDown = () => {
    if (isSelectingFocusArea) {
      if (!stageRef.current) return;
      
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Tıklama pozisyonunu kaydet
      setDragStart({
        x: pointerPosition.x,
        y: pointerPosition.y
      });
      setFocusArea(null);
      return;
    }
    
    if (tool === 'hand' || !stageRef.current) return;
    
    setIsDrawing(true);
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Adjust position based on zoom and stage position
    const x = pointerPosition.x / zoom;
    const y = pointerPosition.y / zoom;
    
    // Create new line with tool-specific properties
    let newLine = {
      tool,
      points: [x, y],
      strokeWidth,
    };
    
    // Set properties based on the selected tool
    if (tool === 'pen') {
      newLine.color = color;
      newLine.opacity = opacity;
    } else if (tool === 'highlighter') {
      newLine.color = color;
      newLine.opacity = 0.4; // Highlighters are semi-transparent
      newLine.strokeWidth = strokeWidth * 2; // Highlighters are thicker
    } else if (tool === 'eraser') {
      newLine.color = '#ffffff'; // Doesn't matter for eraser
      newLine.opacity = 1;
      newLine.strokeWidth = strokeWidth * 3; // Erasers are thicker
    }
    
    setCurrentLine(newLine);
  };

  const handleMouseMove = () => {
    if (isSelectingFocusArea && dragStart) {
      const stage = stageRef.current;
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Sürükleme alanını güncelle
      setFocusArea({
        x: Math.min(dragStart.x, pointerPosition.x),
        y: Math.min(dragStart.y, pointerPosition.y),
        width: Math.abs(pointerPosition.x - dragStart.x),
        height: Math.abs(pointerPosition.y - dragStart.y)
      });
      return;
    }
    
    if (!isDrawing || !currentLine || !stageRef.current) return;
    
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Adjust position based on zoom and stage position
    const x = pointerPosition.x / zoom;
    const y = pointerPosition.y / zoom;
    
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, x, y]
    });
  };

  const handleMouseUp = () => {
    if (isSelectingFocusArea && dragStart && focusArea) {
      if (focusArea.width > 20 && focusArea.height > 20) {
        // Daha doğru bir koordinat yakalama için, doğrudan containerRef'i hedef alalım
        const containerElement = containerRef.current;
        if (!containerElement) {
          console.error("Container elementi bulunamadı");
          setFocusArea(null);
          setDragStart(null);
          return;
        }
        
        // Seçilen alanın geçici kopyasını yapın ve görüntüyü almadan önce kırmızı seçim çerçevesini gizleyin
        const tempFocusArea = {...focusArea};
        setFocusArea(null);
        
        // Konteynerin görülebilir alanını hesaplayalım
        const containerRect = containerElement.getBoundingClientRect();
        
        // Kısa bir gecikme ekleyerek UI'ın güncellenmesini bekleyelim
        setTimeout(() => {
          // Stage'in olduğu alanın görüntüsünü al
          html2canvas(containerElement, {
            // Sayfadaki kaydırma çubuklarını yok say
            scrollX: 0,
            scrollY: 0,
            // Ölçeklendirme faktörlerini ayarla
            scale: window.devicePixelRatio, // Retina ekranlar için ölçeklendirme
            // Tüm elementleri yakala, stage dahil
            ignoreElements: (element) => {
              // Sadece seçim çerçevesini ve araç çubuğunu yok sayın
              return element.classList && 
                     (element.classList.contains('selection-rect') || 
                      element.classList.contains('toolbar'));
            }
          }).then(canvas => {
            try {
              // Koordinatları hesapla - container içindeki pozisyonu al
              // zoom faktörünü de dikkate al
              const x = tempFocusArea.x / zoom;
              const y = tempFocusArea.y / zoom;
              const width = tempFocusArea.width / zoom;
              const height = tempFocusArea.height / zoom;
              
              // Kırpma işlemi, konteyner sınırları içinde kalacak şekilde
              const ctx = canvas.getContext('2d');
              
              // Kırpılacak alanın sınırlarını kontrol et
              const actualX = Math.max(0, x);
              const actualY = Math.max(0, y);
              const actualWidth = Math.min(width, canvas.width - actualX);
              const actualHeight = Math.min(height, canvas.height - actualY);
              
              if (actualWidth <= 0 || actualHeight <= 0) {
                throw new Error("Geçerli kırpma boyutları hesaplanamadı");
              }
              
              // Canvas'ı kırp
              const imageData = ctx.getImageData(actualX, actualY, actualWidth, actualHeight);
              
              // Yeni bir canvas oluştur
              const croppedCanvas = document.createElement('canvas');
              croppedCanvas.width = actualWidth;
              croppedCanvas.height = actualHeight;
              const croppedCtx = croppedCanvas.getContext('2d');
              croppedCtx.putImageData(imageData, 0, 0);
              
              // dataURL'i al
              const dataURL = croppedCanvas.toDataURL();
              
              // Odak alanını güncelle
              setFocusArea({
                ...tempFocusArea,
                dataURL: dataURL,
                // Orijinal boyutları koruyalım
                originalWidth: tempFocusArea.width,
                originalHeight: tempFocusArea.height
              });
              
              // Odak modunu etkinleştir
              setIsFocusMode(true);
              setIsSelectingFocusArea(false);
            } catch (error) {
              console.error("Görüntü kırpma hatası:", error);
              // Hata mesajıyla birlikte boş bir canvas oluşturalım
              const fallbackCanvas = document.createElement('canvas');
              fallbackCanvas.width = tempFocusArea.width;
              fallbackCanvas.height = tempFocusArea.height;
              const fallbackCtx = fallbackCanvas.getContext('2d');
              fallbackCtx.fillStyle = '#f0f0f0';
              fallbackCtx.fillRect(0, 0, tempFocusArea.width, tempFocusArea.height);
              fallbackCtx.font = '14px Arial';
              fallbackCtx.fillStyle = 'black';
              fallbackCtx.textAlign = 'center';
              fallbackCtx.fillText('Görüntü alınamadı', tempFocusArea.width/2, tempFocusArea.height/2);
              
              // Fallback görüntüsünü kullan
              setFocusArea({
                ...tempFocusArea,
                dataURL: fallbackCanvas.toDataURL()
              });
              
              setIsFocusMode(true);
              setIsSelectingFocusArea(false);
            }
          }).catch(error => {
            console.error("Ekran görüntüsü alınamadı:", error);
            setFocusArea(null);
          });
        }, 100);
      } else {
        // Çok küçük bir alan seçilmişse, odaklamayı iptal et
        setFocusArea(null);
      }
      setDragStart(null);
      return;
    }
    
    if (!isDrawing || !currentLine) return;
    
    setIsDrawing(false);
    setLines([...lines, currentLine]);
    setCurrentLine(null);
    
    // Update page drawings
    setPageDrawings(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), currentLine]
    }));
  };

  // Odak alanı için mouse olay işleyicileri
  const handleFocusMouseDown = () => {
    if (tool === 'hand' || !focusCanvasRef.current) return;
    
    setIsFocusDrawing(true);
    const stage = focusCanvasRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Create new line with tool-specific properties
    let newLine = {
      tool,
      points: [pointerPosition.x, pointerPosition.y],
      strokeWidth,
    };
    
    // Set properties based on the selected tool
    if (tool === 'pen') {
      newLine.color = color;
      newLine.opacity = opacity;
    } else if (tool === 'highlighter') {
      newLine.color = color;
      newLine.opacity = 0.4; // Highlighters are semi-transparent
      newLine.strokeWidth = strokeWidth * 2; // Highlighters are thicker
    } else if (tool === 'eraser') {
      newLine.color = '#ffffff'; // Doesn't matter for eraser
      newLine.opacity = 1;
      newLine.strokeWidth = strokeWidth * 3; // Erasers are thicker
    }
    
    setCurrentFocusLine(newLine);
  };

  const handleFocusMouseMove = () => {
    if (!isFocusDrawing || !currentFocusLine || !focusCanvasRef.current) return;
    
    const stage = focusCanvasRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    setCurrentFocusLine({
      ...currentFocusLine,
      points: [...currentFocusLine.points, pointerPosition.x, pointerPosition.y]
    });
  };

  const handleFocusMouseUp = () => {
    if (!isFocusDrawing || !currentFocusLine) return;
    
    setIsFocusDrawing(false);
    setFocusDrawings([...focusDrawings, currentFocusLine]);
    setCurrentFocusLine(null);
  };

  // Navigation functions
  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= pages.length) {
      // Save current drawings before changing page
      if (lines.length > 0) {
        setPageDrawings(prev => ({
          ...prev,
          [currentPage]: lines
        }));
      }
      
      setCurrentPage(pageNum);
      
      // Load drawings for the new page
      const savedDrawings = pageDrawings[pageNum] || [];
      setLines(savedDrawings);
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

  // Clear drawings on current page
  const clearDrawings = () => {
    setLines([]);
    setCurrentLine(null);
    
    // Update page drawings
    setPageDrawings(prev => ({
      ...prev,
      [currentPage]: []
    }));
  };

  // Tool selection helper
  const selectTool = (newTool) => {
    setTool(newTool);
    setShowToolOptions(true);
    
    // Set appropriate default properties for each tool
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

  // Combined tool options panel
  const ToolOptionsPanel = () => {
    return (
      <div style={{
        position: 'absolute',
        left: toolbarPosition.x + 80,
        top: toolbarPosition.y,
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        color: isDarkMode ? '#f9fafb' : '#1f2937',
        borderRadius: '0.5rem',
        padding: '0.75rem',
        zIndex: 1100,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        width: '220px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
        }}>
          <div style={{ fontWeight: 'bold' }}>
            {tool === 'pen' ? 'Pen Settings' : 
             tool === 'highlighter' ? 'Highlighter Settings' : 
             'Eraser Settings'}
          </div>
          <X 
            size={16} 
            style={{ cursor: 'pointer' }}
            onClick={() => setShowToolOptions(false)}
          />
        </div>
        
        {/* Color section - Only show for pen and highlighter */}
        {tool !== 'eraser' && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Color</div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem'
            }}>
              {colors.map(c => (
                <div 
                  key={c} 
                  style={{ 
                    width: '2rem', 
                    height: '2rem', 
                    borderRadius: '50%', 
                    backgroundColor: c,
                    border: c === color ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    cursor: 'pointer'
                  }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Thickness section */}
        <div>
          <div style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Thickness</div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '0.75rem'
          }}>
            {strokeWidths.map(width => (
              <div 
                key={width} 
                style={{ 
                  width: `${Math.min(width * 2, 32)}px`, 
                  height: `${Math.min(width * 2, 32)}px`, 
                  borderRadius: '50%', 
                  backgroundColor: tool !== 'eraser' ? color : isDarkMode ? 'white' : 'black',
                  border: width === strokeWidth ? '2px solid #3b82f6' : 'none',
                  cursor: 'pointer',
                  opacity: tool === 'highlighter' ? 0.4 : 1
                }}
                onClick={() => setStrokeWidth(width)}
              />
            ))}
          </div>
          <input 
            type="range" 
            min="1" 
            max="50" 
            value={strokeWidth} 
            onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ 
            textAlign: 'center',
            marginTop: '0.5rem',
            fontSize: '0.875rem'
          }}>
            {strokeWidth}px
          </div>
        </div>
      </div>
    );
  };

  // Enhanced toolbar with expanded drawing options
  const Toolbar = () => {
    const toolbarStyle = {
      position: 'absolute', 
      top: `${toolbarPosition.y}px`, 
      left: `${toolbarPosition.x}px`,
      zIndex: 1000,
      opacity: 0.95,
      userSelect: 'none',
      backgroundColor: isDarkMode ? '#1f2937' : '#f3f4f6',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      borderRadius: '0.5rem',
      padding: '0.25rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      width: '60px', // Daha dar toolbar genişliği
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    };
    
    const buttonStyle = (isActive) => ({
      padding: '0.5rem',
      borderRadius: '0.375rem',
      backgroundColor: isActive ? '#3b82f6' : 'transparent',
      color: isActive ? 'white' : isDarkMode ? '#f9fafb' : '#1f2937',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0.125rem',
      border: 'none',
      outline: 'none',
      width: '40px',
      height: '40px'
    });
    
    return (
      <div style={toolbarStyle} className="toolbar">
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem',
            cursor: 'move',
            padding: '0.25rem',
            width: '100%'
          }}
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
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.75rem',
          fontWeight: 'bold', 
          marginBottom: '0.5rem'
        }}>
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
        
        {/* Hand Aracı */}
        <button 
          style={buttonStyle(tool === 'hand')} 
          onClick={() => {
            setTool('hand');
            setShowToolOptions(false);
          }}
          title="Selection Tool"
        >
          <Hand size={20} />
        </button>
        
        {/* Çizim Araçları */}
        <button 
          style={buttonStyle(tool === 'pen')} 
          onClick={() => selectTool('pen')}
          title="Pen"
        >
          <Pencil size={20} />
        </button>
        
        <button 
          style={buttonStyle(tool === 'highlighter')}
          onClick={() => selectTool('highlighter')}
          title="Highlighter"
        >
          <Highlighter size={20} />
        </button>
        
        <button 
          style={buttonStyle(tool === 'eraser')}
          onClick={() => selectTool('eraser')}
          title="Eraser"
        >
          <Eraser size={20} />
        </button>
        
        <button 
          style={buttonStyle(false)}
          onClick={clearDrawings}
          title="Clear Drawings"
        >
          <Trash2 size={20} />
        </button>
        
        {/* Focus Tool */}
        <button 
          style={buttonStyle(isSelectingFocusArea)}
          onClick={() => {
            setIsSelectingFocusArea(!isSelectingFocusArea);
            if (isSelectingFocusArea) {
              setFocusArea(null);
            }
            // Seçim modunda iken diğer araçları devre dışı bırak
            setTool('hand');
            setShowToolOptions(false);
          }}
          title="Focus Tool"
        >
          <Search size={20} />
        </button>
        
        {/* Sayfa Navigasyonu */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          margin: '0.5rem 0'
        }}>
          <div 
            style={{ 
              fontSize: '0.75rem',
              marginBottom: '0.25rem',
              padding: '0.25rem 0.5rem',
              backgroundColor: isDarkMode ? '#374151' : '#e5e7eb',
              borderRadius: '0.375rem',
              textAlign: 'center',
              cursor: 'pointer'
            }}
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
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  textAlign: 'center',
                  fontSize: 'inherit',
                  padding: 0,
                  outline: 'none'
                }}
              />
            ) : (
              `${currentPage}/${pages.length}`
            )}
          </div>
          
          <div style={{ display: 'flex' }}>
            <button 
              style={{
                ...buttonStyle(false),
                padding: '0.25rem',
                width: '30px',
                height: '30px'
              }} 
              onClick={prevPage}
              disabled={currentPage <= 1}
              title="Previous Page"
            >
              <ChevronLeft size={16} />
              </button>
            
            <button 
              style={{
                ...buttonStyle(false),
                padding: '0.25rem',
                width: '30px',
                height: '30px'
              }} 
              onClick={nextPage}
              disabled={currentPage >= pages.length}
              title="Next Page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Zoom Kontrolleri */}
        <button 
          style={buttonStyle(false)} 
          onClick={() => setZoom(prev => Math.min(prev + 0.1, 3))}
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        
        <button 
          style={buttonStyle(false)} 
          onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        
        {/* Diğer Kontroller */}
        <button 
          style={buttonStyle(showThumbnails)}
          onClick={() => setShowThumbnails(!showThumbnails)}
          title="Thumbnails"
        >
          <Grid size={20} />
        </button>
        
        <button 
          style={buttonStyle(showSettings)}
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={20} />
        </button>
        
        <button 
          style={buttonStyle(showCurtain)}
          onClick={() => setShowCurtain(!showCurtain)}
          title="Curtain"
        >
          <div style={{ 
            width: '20px', 
            height: '20px', 
            backgroundColor: 'black', 
            opacity: 0.6 
          }} />
        </button>
      </div>
    );
  };

  // Page thumbnails sidebar
  const ThumbnailSidebar = () => {
    const sidebarStyle = {
      position: 'absolute',
      left: '1rem',
      top: '1rem',
      bottom: '1rem',
      width: '150px',
      backgroundColor: isDarkMode ? '#1f2937' : 'white',
      color: isDarkMode ? '#f9fafb' : '#1f2937',
      borderRadius: '0.5rem',
      padding: '0.5rem',
      overflowY: 'auto',
      zIndex: 900,
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    };
    
    return (
      <div style={sidebarStyle}>
        <div style={{ 
          fontWeight: 'bold', 
          marginBottom: '0.5rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span>Pages</span>
          <X 
            size={16} 
            onClick={() => setShowThumbnails(false)} 
            style={{ cursor: 'pointer' }} 
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {pages.map((page, index) => (
            <div 
              key={page.id} 
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s ease-out',
                border: currentPage === index + 1 
                  ? '2px solid #3b82f6' 
                  : `1px solid ${isDarkMode ? '#4b5563' : '#d1d5db'}`,
                borderRadius: '0.375rem',
                overflow: 'hidden'
              }}
              onClick={() => {
                goToPage(index + 1);
                setShowThumbnails(false);
              }}
            >
              <img 
                src={page.src} 
                alt={`Page ${index + 1}`} 
                style={{ width: '100%', display: 'block' }} 
              />
              <div style={{ 
                textAlign: 'center', 
                fontSize: '0.875rem', 
                marginTop: '0.25rem',
                paddingBottom: '0.25rem'
              }}>
                Page {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Main application component
  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: isDarkMode ? '#111827' : '#f9fafb'
      }}
      onMouseMove={(e) => {
        handleMouseMoveToolbar(e);
        handleMouseMove();
      }}
      onMouseUp={() => {
        stopDraggingToolbar();
        handleMouseUp();
      }}
    >
      {/* Background page display */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.2s ease-out',
          display: 'flex',
          gap: '10px'
        }}>
          {/* Current page display */}
          {currentPage <= pages.length && (
            <div>
              <img 
                src={pages[currentPage - 1]?.src} 
                alt={`Page ${currentPage}`}
                style={{
                  maxHeight: isHalfPageView ? '45vh' : '90vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  objectPosition: isHalfPageView ? 'top' : 'center',
                  clipPath: isHalfPageView ? 'inset(0 0 50% 0)' : 'none'
                }}
              />
            </div>
          )}
          
          {/* Second page in double view */}
          {isDoublePageView && currentPage + 1 <= pages.length && (
            <div>
              <img 
                src={pages[currentPage]?.src} 
                alt={`Page ${currentPage + 1}`}
                style={{
                  maxHeight: isHalfPageView ? '45vh' : '90vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  objectPosition: isHalfPageView ? 'top' : 'center',
                  clipPath: isHalfPageView ? 'inset(0 0 50% 0)' : 'none'
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Drawing stage with events directly on the stage */}
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        ref={stageRef}
        scale={{ x: zoom, y: zoom }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: showCurtain ? 750 : 500, // Lower than curtain but higher than page
          cursor: isSelectingFocusArea ? 'crosshair' : (tool === 'hand' ? 'grab' : 'crosshair'),
          pointerEvents: tool === 'hand' && !isSelectingFocusArea ? 'none' : 'auto'
        }}
      >
        <Layer>
          {/* Draw existing lines */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.color}
              strokeWidth={line.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              opacity={line.opacity || 1}
              globalCompositeOperation={
                line.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          ))}
          
          {/* Draw current line */}
          {currentLine && (
            <Line
              points={currentLine.points}
              stroke={currentLine.color}
              strokeWidth={currentLine.strokeWidth}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              opacity={currentLine.opacity || 1}
              globalCompositeOperation={
                currentLine.tool === 'eraser' ? 'destination-out' : 'source-over'
              }
            />
          )}
        </Layer>
      </Stage>
      
      {/* Seçim Dikdörtgeni */}
      {isSelectingFocusArea && dragStart && focusArea && (
        <div 
          className="selection-rect"
          style={{
            position: 'absolute',
            left: `${focusArea.x}px`,
            top: `${focusArea.y}px`,
            width: `${focusArea.width}px`,
            height: `${focusArea.height}px`,
            border: '2px dashed red',
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            pointerEvents: 'none',
            zIndex: 700
          }}
        />
      )}

      {/* Toolbar */}
      <Toolbar />
      
      {/* Tool Options Panel */}
      {showToolOptions && tool !== 'hand' && <ToolOptionsPanel />}
      
      {/* Settings Menu */}
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
      
      {/* Improved Curtain */}
      {showCurtain && (
        <Curtain 
          isDarkMode={isDarkMode}
          onClose={() => setShowCurtain(false)}
        />
      )}
      
      {/* Focus Area Pop-up */}
      {isFocusMode && focusArea && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '80%',
              maxWidth: '1200px',
              backgroundColor: isDarkMode ? '#1f2937' : 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 1rem',
                alignItems: 'center',
                borderBottom: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={{
                    backgroundColor: tool === 'pen' ? '#3b82f6' : 'transparent',
                    color: tool === 'pen' ? 'white' : isDarkMode ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => selectTool('pen')}
                >
                  <Pencil size={20} />
                </button>
                <button
                  style={{
                    backgroundColor: tool === 'highlighter' ? '#3b82f6' : 'transparent',
                    color: tool === 'highlighter' ? 'white' : isDarkMode ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => selectTool('highlighter')}
                >
                  <Highlighter size={20} />
                </button>
                <button
                  style={{
                    backgroundColor: tool === 'eraser' ? '#3b82f6' : 'transparent',
                    color: tool === 'eraser' ? 'white' : isDarkMode ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => selectTool('eraser')}
                >
                  <Eraser size={20} />
                </button>
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: isDarkMode ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '0.375rem',
                    padding: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => {
                    setFocusDrawings([]);
                    setCurrentFocusLine(null);
                  }}
                  title="Clear Drawings"
                >
                  <Trash2 size={20} />
                </button>
                <div
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginLeft: '1rem'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: color,
                      border: '1px solid #d1d5db',
                      cursor: 'pointer'
                    }}
                    onClick={() => setShowToolOptions(!showToolOptions)}
                  />
                  <span>{strokeWidth}px</span>
                </div>
              </div>
              <button
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: isDarkMode ? 'white' : 'black',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.5rem'
                }}
                onClick={() => {
                  setIsFocusMode(false);
                  setFocusArea(null);
                  setFocusDrawings([]);
                  setCurrentFocusLine(null);
                }}
              >
                ✕
              </button>
            </div>
            
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                justifyContent: 'center',
                position: 'relative'
              }}
            >
              {/* Seçilen alanın görüntüsü */}
              <div
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  maxHeight: '70vh',
                  maxWidth: '100%'
                }}
              >
                {/* Arka plan olarak ekran görüntüsü */}
                <div
                  style={{
                    position: 'relative',
                    width: focusArea.originalWidth || focusArea.width, // Orijinal boyutu kullan
                    height: focusArea.originalHeight || focusArea.height,
                    backgroundColor: '#f0f0f0',
                    backgroundImage: `url(${focusArea.dataURL})`,
                    backgroundSize: 'contain', // 'contain' yerine '100% 100%' daha doğru olabilir
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                  }}
                >
                  {/* Çizim için konva stage */}
                  <Stage
                    width={focusArea.originalWidth || focusArea.width}
                    height={focusArea.originalHeight || focusArea.height}
                    ref={focusCanvasRef}
                    onMouseDown={handleFocusMouseDown}
                    onMouseMove={handleFocusMouseMove}
                    onMouseUp={handleFocusMouseUp}
                    style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      cursor: tool === 'hand' ? 'grab' : 'crosshair'
                    }}
                  >
                    <Layer>
                      {/* Mevcut çizimler */}
                      {focusDrawings.map((line, i) => (
                        <Line
                          key={i}
                          points={line.points}
                          stroke={line.color}
                          strokeWidth={line.strokeWidth}
                          tension={0.5}
                          lineCap="round"
                          lineJoin="round"
                          opacity={line.opacity || 1}
                          globalCompositeOperation={
                            line.tool === 'eraser' ? 'destination-out' : 'source-over'
                          }
                        />
                      ))}
                      
                      {/* Şu anda çizilen çizgi */}
                      {currentFocusLine && (
                        <Line
                          points={currentFocusLine.points}
                          stroke={currentFocusLine.color}
                          strokeWidth={currentFocusLine.strokeWidth}
                          tension={0.5}
                          lineCap="round"
                          lineJoin="round"
                          opacity={currentFocusLine.opacity || 1}
                          globalCompositeOperation={
                            currentFocusLine.tool === 'eraser' ? 'destination-out' : 'source-over'
                          }
                        />
                      )}
                    </Layer>
                  </Stage>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Page thumbnails sidebar */}
      {showThumbnails && <ThumbnailSidebar />}
      
      {/* Status information */}
      <div style={{
        position: 'absolute',
        bottom: '0.5rem',
        right: '0.5rem',
        padding: '0.5rem',
        fontSize: '0.875rem',
        backgroundColor: isDarkMode ? '#1f2937' : 'white',
        color: isDarkMode ? '#f9fafb' : '#1f2937',
        borderRadius: '0.375rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        zIndex: 1000
      }}>
        {tool !== 'hand' ? `Drawing: ${tool} (${strokeWidth}px)` : 'Navigation mode'}
        {` • Zoom: ${Math.round(zoom * 100)}%`}
        {` • View: ${isDoublePageView ? 'Double Page' : isHalfPageView ? 'Half Page' : 'Single Page'}`}
      </div>
    </div>
  );
};

export default DigitalTeachingTool;