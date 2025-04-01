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
  setPageDrawings 
}) => {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [focusArea, setFocusArea] = useState(null);
  const [isSelectingFocusArea, setIsSelectingFocusArea] = useState(false);
  
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
      
      // Burada 'focus' tool özel kontrolünü ekleyin
      if ((tool === 'hand' || tool === 'focus') || !stageRef.current) return;
    
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
      const pointerPosition = stage.getPointerPosition();
      if (!pointerPosition) return;
      
      // Seçim alanını güncelle
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

    console.log("MouseUp - isSelectingFocusArea:", isSelectingFocusArea);
    console.log("MouseUp - dragStart:", dragStart);
    console.log("MouseUp - focusArea:", focusArea);

// ve biraz sonra, html2canvas çağrısının öncesinde:
console.log("Attempting to capture with html2canvas");

    // Focus alanı seçim işlemi tamamlandıysa
    if (isSelectingFocusArea && dragStart && focusArea) {
      // Burada focus alanı işleme mantığı olmalı
      // DigitalTeachingTool ana bileşeninde ele alınıyor
      setDragStart(null);
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
    clearDrawings
  };
};

export default useDrawing;