// src/components/DigitalTeachingTool/hooks/useDrawing.js
import { useState, useEffect } from 'react';

/**
 * Çizim işlevselliği için özel hook
 */
const useDrawing = ({ 
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
}) => {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Sayfa değişikliklerini izle
  useEffect(() => {
    // Mevcut çizimleri kaydet
    if (lines.length > 0) {
      setPageDrawings(prev => ({
        ...prev,
        [currentPage]: lines
      }));
    }
    
    // Yeni sayfadaki çizimleri yükle
    const savedDrawings = pageDrawings[currentPage] || [];
    setLines(savedDrawings);
  }, [currentPage, pageDrawings, setPageDrawings]);
  
  // Mouse down işleyicisi
  const handleMouseDown = (e) => {
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
      
      // Başlangıçta odak alanı yok, fare hareket ettikçe oluşturulacak
      setFocusArea(null);
      return;
    }
    
    // Eğer el aracı seçiliyse çizim yapmaya gerek yok
    if (tool === 'hand' || !stageRef.current) return;
    
    setIsDrawing(true);
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Zoom'a göre konumu ayarla
    const x = pointerPosition.x / zoom;
    const y = pointerPosition.y / zoom;
    
    // Araç özelliklerine göre yeni çizgi oluştur
    let newLine = {
      tool,
      points: [x, y],
      strokeWidth,
    };
    
    // Araç türüne göre özellikleri ayarla
    if (tool === 'pen') {
      newLine.color = color;
      newLine.opacity = opacity;
    } else if (tool === 'highlighter') {
      newLine.color = color;
      newLine.opacity = 0.4; // Yarı saydam
      newLine.strokeWidth = strokeWidth * 2; // Daha kalın
    } else if (tool === 'eraser') {
      newLine.color = '#ffffff'; // Silgi için renk önemli değil
      newLine.opacity = 1;
      newLine.strokeWidth = strokeWidth * 3; // Silgi daha kalın
    }
    
    setCurrentLine(newLine);
  };

  // Mouse move işleyicisi
  const handleMouseMove = () => {
    if (isSelectingFocusArea && dragStart) {
      const stage = stageRef.current;
      if (!stage) return;
      
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Calculate dimensions
      const width = Math.abs(pointerPosition.x - dragStart.x);
      const height = Math.abs(pointerPosition.y - dragStart.y);
      
      // Only update if it's at least 20x20 pixels or set a minimum
      const minDimension = 20;
      const finalWidth = Math.max(width, minDimension);
      const finalHeight = Math.max(height, minDimension);
      
      // Update focus area
      setFocusArea({
        x: Math.min(dragStart.x, pointerPosition.x),
        y: Math.min(dragStart.y, pointerPosition.y),
        width: finalWidth,
        height: finalHeight
      });
      return;
    }
    
    if (!isDrawing || !currentLine || !stageRef.current) return;
    
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // Zoom'a göre konumu ayarla
    const x = pointerPosition.x / zoom;
    const y = pointerPosition.y / zoom;
    
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, x, y]
    });
  };

  // Mouse up işleyicisi
  const handleMouseUp = () => {
    // Focus alanı seçim işlemi tamamlandıysa
    // This will be handled by the parent component for seamless UI experience
    if (isSelectingFocusArea && dragStart && focusArea) {
      // We're letting the parent component handle the capture
      // This prevents visual glitches and ensures proper timing
      return;
    }
    
    if (!isDrawing || !currentLine) return;
    
    setIsDrawing(false);
    setLines([...lines, currentLine]);
    setCurrentLine(null);
    
    // Sayfa çizimlerini güncelle
    setPageDrawings(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), currentLine]
    }));
  };

  // Dokunmatik olay işleyicileri - iPad desteği için
  // Touch Start işleyicisi
  const handleTouchStart = (e) => {
    e.evt.preventDefault(); // Sayfanın kaydırılmasını engelle
    
    // Apple Pencil basınç algılama
  const touch = e.evt.touches[0];
  if (touch && touch.force && touch.force > 0) {
    // Basınç değerini 0-1 aralığında normalize et
    const pressureValue = Math.min(touch.force / 2, 1);
    // Basınca göre kalem kalınlığını ayarla
    newLine.strokeWidth = Math.max(1, strokeWidth * pressureValue * 2);
  }
    if (!touch) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    // Focus alanı seçimi için
    if (isSelectingFocusArea) {
      setDragStart({
        x: pos.x,
        y: pos.y
      });
      setFocusArea(null);
      return;
    }
    
    // Eğer el aracı seçiliyse çizim yapmaya gerek yok
    if (tool === 'hand') return;

    // Apple Pencil'ın açı bilgisini almak için
    if (touch && touch.radiusX && touch.radiusY) {
      const angle = Math.atan2(touch.radiusY, touch.radiusX);
      // Açıya göre kalem ucunu ayarla
    }
    
    setIsDrawing(true);
    
    // Zoom'a göre konumu ayarla
    const x = pos.x / zoom;
    const y = pos.y / zoom;
    
    // Araç özelliklerine göre yeni çizgi oluştur
    let newLine = {
      tool,
      points: [x, y],
      strokeWidth,
    };
    
    // Araç türüne göre özellikleri ayarla
    if (tool === 'pen') {
      newLine.color = color;
      newLine.opacity = opacity;
    } else if (tool === 'highlighter') {
      newLine.color = color;
      newLine.opacity = 0.4; // Yarı saydam
      newLine.strokeWidth = strokeWidth * 2; // Daha kalın
    } else if (tool === 'eraser') {
      newLine.color = '#ffffff'; // Silgi için renk önemli değil
      newLine.opacity = 1;
      newLine.strokeWidth = strokeWidth * 3; // Silgi daha kalın
    }
    
    setCurrentLine(newLine);
  };

  // Touch Move işleyicisi
  const handleTouchMove = (e) => {
    e.evt.preventDefault(); // Sayfanın kaydırılmasını engelle
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const pos = stage.getPointerPosition();
    if (!pos) return;
    
    // Focus alanı seçimi için
    if (isSelectingFocusArea && dragStart) {
      const width = Math.abs(pos.x - dragStart.x);
      const height = Math.abs(pos.y - dragStart.y);
      
      const minDimension = 20;
      const finalWidth = Math.max(width, minDimension);
      const finalHeight = Math.max(height, minDimension);
      
      setFocusArea({
        x: Math.min(dragStart.x, pos.x),
        y: Math.min(dragStart.y, pos.y),
        width: finalWidth,
        height: finalHeight
      });
      return;
    }
    
    if (!isDrawing || !currentLine) return;
    
    // Zoom'a göre konumu ayarla
    const x = pos.x / zoom;
    const y = pos.y / zoom;
    
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, x, y]
    });
  };

  // Touch End işleyicisi
  const handleTouchEnd = (e) => {
    if (e.evt) {
      e.evt.preventDefault(); // Sayfanın kaydırılmasını engelle
    }
    
    // Focus alanı seçimi için
    if (isSelectingFocusArea && dragStart && focusArea) {
      // Bunu ana bileşen ele alacak
      return;
    }
    
    if (!isDrawing || !currentLine) return;
    
    setIsDrawing(false);
    setLines([...lines, currentLine]);
    setCurrentLine(null);
    
    // Sayfa çizimlerini güncelle
    setPageDrawings(prev => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), currentLine]
    }));
  };

  // Tüm çizimleri temizle
  const clearDrawings = () => {
    setLines([]);
    setCurrentLine(null);
    
    // Sayfa çizimlerini güncelle
    setPageDrawings(prev => ({
      ...prev,
      [currentPage]: []
    }));
  };

  // Dokunmatik olaylarda throttle kullanarak performansı iyileştirme
  const throttle = (callback, delay) => {
    let lastCall = 0;
    return function(...args) {
      const now = new Date().getTime();
      if (now - lastCall < delay) {
        return;
      }
      lastCall = now;
      return callback(...args);
    };
  };
  
  // Throttled dokunmatik hareket işleyicisi
  const throttledTouchMove = throttle(handleTouchMove, 16); // ~60fps


  return {
    lines,
    setLines,
    currentLine,
    isDrawing,
    dragStart,
    focusArea,
    setFocusArea,
    isSelectingFocusArea,
    setIsSelectingFocusArea,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    clearDrawings
  };
};

export default useDrawing;