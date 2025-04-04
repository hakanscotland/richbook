// src/components/DigitalTeachingTool/hooks/useDrawing.js
import { useState, useEffect, useCallback } from 'react';

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
      // Kalıcı kaydetme için ve sayfa geçişlerinde verilerin korunması için
      setPageDrawings(prev => {
        const updatedDrawings = {
          ...prev,
          [currentPage]: lines
        };
        
        // İsteğe bağlı - localStorage'da saklamak için
        try {
          localStorage.setItem(`pageDrawings_${currentPage}`, JSON.stringify(lines));
        } catch (error) {
          console.error('Sayfa çizimlerini saklama hatası:', error);
        }
        
        return updatedDrawings;
      });
    }
    
    // Yeni sayfadaki çizimleri yükle
    const loadDrawings = () => {
      // Önce belleğe kaydedilmiş çizimleri kontrol et
      let savedDrawings = pageDrawings[currentPage] || [];
      
      // Eğer belleğe kaydedilmiş çizim yoksa, localStorage'a bak (İsteğe bağlı)
      if (savedDrawings.length === 0) {
        try {
          const storedDrawings = localStorage.getItem(`pageDrawings_${currentPage}`);
          if (storedDrawings) {
            savedDrawings = JSON.parse(storedDrawings);
            
            // localStorage'dan yüklenen çizimleri pageDrawings'e ekle
            setPageDrawings(prev => ({
              ...prev,
              [currentPage]: savedDrawings
            }));
          }
        } catch (error) {
          console.error('LocalStorage\'dan çizim yükleme hatası:', error);
        }
      }
      
      // Çizimleri yerel state'e yükle
      setLines(savedDrawings);
    };
    
    // Yeni sayfadaki çizimleri yükle
    loadDrawings();
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);  // lines ve pageDrawings dependency'lerini çıkardık - döngüsel güncellemeleri önlemek için
  
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
    
    // ÖNEMLİ DEĞİŞİKLİK: Pointer pozisyonunu doğrudan alma
    // Stage'in içindeki ilk Layer'a göre relatif konumu hesapla
    // Bu, zoom kayması sorununu çözmelidir.
    
    // İşlem sırası:
    // 1. Önce pointer pozisyonunu alıyoruz (ekran koordinatları)
    // 2. Stage'den relativPosition hesaplıyoruz
    // Böylece zoom seviyesinden bağımsız doğru konumu alıyoruz
    
    // DENEYSEL: Global koordinatları lokal koordinatlara çevir
    const position = stage.getPointerPosition();
    
    // Stage'den ilk layer'a referans al
    const layer = stage.findOne('Layer');
    
    if (!layer) {
      console.error('Layer bulunamadı, koordinat dönüşümü yapılamadı.');
      return;
    }
    
    // Global'den lokal koordinatlara çevirme (zoom ve pan kompanzasyonu)
    const relativePosition = layer.getRelativePointerPosition();
    
    // Eğer relativePosition alınamadıysa, stage pozisyonunu kullan
    const x = relativePosition ? relativePosition.x : position.x;
    const y = relativePosition ? relativePosition.y : position.y;
    
    console.log('Çizim başlangıç koordinatları:', x, y, 'Zoom seviyesi:', zoom);
    
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
    
    // ÖNEMLİ DEĞİŞİKLİK: getRelativePointerPosition kullanarak zoom/pan'a göre düzgün çizim
    // Stage'den ilk layer'a referans al
    const layer = stage.findOne('Layer');
    
    if (!layer) {
      console.error('Layer bulunamadı, koordinat dönüşümü yapılamadı.');
      return;
    }
    
    // Global'den lokal koordinatlara çevirme (zoom ve pan kompanzasyonu)
    const relativePosition = layer.getRelativePointerPosition();
    
    // Eğer relativePosition alınamadıysa, stage pozisyonunu kullan
    const x = relativePosition ? relativePosition.x : pointerPosition.x;
    const y = relativePosition ? relativePosition.y : pointerPosition.y;
    
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
      // Safari'de kaydırma davranışını engelle
      if (e.evt) {
        e.evt.preventDefault(); 
      }
      
      if (isSelectingFocusArea) {
        if (!stageRef.current) return;
        
        const stage = stageRef.current;
        const touch = e.evt.touches[0];
        if (!touch) return;
        
        // Dokunmatik koordinatların doğru dönüşümü için
        const boundingRect = stage.container().getBoundingClientRect();
        const offsetX = touch.clientX - boundingRect.left;
        const offsetY = touch.clientY - boundingRect.top;

        // Stage konumu ve zoom'ı dikkate alarak gerçek koordinatları hesapla
        // Odak alanı seçimi için sadece offsetX/Y değerleri kullanılıyor, stageOffset gerekmemektedir
        // const stageOffset = {
        //   x: stage.x(),
        //   y: stage.y()
        // };

        // Dokunmatik pozisyonunu stage'in ofset ve zoom değerine göre düzeltiyoruz
        // Odak alanı seçimi için sadece ofset değerleri kullanılıyor
        // const adjustedX = (offsetX - stageOffset.x) / zoom;
        // const adjustedY = (offsetY - stageOffset.y) / zoom;
        
        setDragStart({
          x: offsetX,
          y: offsetY
        });
        
        setFocusArea(null);
        return;
      }
      
      
    
    // Eğer el aracı seçiliyse çizim yapmaya gerek yok
    if (tool === 'hand' || !stageRef.current) return;
    
    setIsDrawing(true);
    const stage = stageRef.current;
    const pointerPosition = stage.getPointerPosition();
    if (!pointerPosition) return;
    
    // ÖNEMLİ DEĞİŞİKLİK: Dokunmatik için relatif pozisyon
    // Stage'den ilk layer'a referans al
    const layer = stage.findOne('Layer');
    
    if (!layer) {
      console.error('Layer bulunamadı, koordinat dönüşümü yapılamadı.');
      return;
    }
    
    // Global'den lokal koordinatlara çevirme (zoom ve pan kompanzasyonu)
    const relativePosition = layer.getRelativePointerPosition();
    
    // Eğer relativePosition alınamadıysa, stage pozisyonunu kullan
    const x = relativePosition ? relativePosition.x : pointerPosition.x;
    const y = relativePosition ? relativePosition.y : pointerPosition.y;
    
    console.log('Dokunmatik başlangıç koordinatları:', x, y, 'Zoom seviyesi:', zoom);
    
    // Araç özelliklerine göre yeni çizgi oluştur
    let newLine = {
      tool,
      points: [x, y],
      strokeWidth,
    };
    
   // Apple Pencil basınç desteği
  if (e.evt && e.evt.touches && e.evt.touches[0] && e.evt.touches[0].force !== undefined && e.evt.touches[0].force > 0) {
    const touchForce = e.evt.touches[0].force;
    const pressureValue = Math.min(touchForce / 2, 1);
    newLine.strokeWidth = Math.max(1, strokeWidth * pressureValue * 2);
  }
  
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
      // Safari'de kaydırma davranışını engelle
      if (e.evt) {
        e.evt.preventDefault();
      }
      
      const stage = stageRef.current;
      if (!stage) return;
      
      // Dokunmatik koordinatları manuel hesaplama
      const touch = e.evt.touches[0];
      if (!touch) return;
      
      // Dokunmatik koordinatların doğru dönüşümü için
      const boundingRect = stage.container().getBoundingClientRect();
      const offsetX = touch.clientX - boundingRect.left;
      const offsetY = touch.clientY - boundingRect.top;
      
      // Focus alanı seçimi için
      if (isSelectingFocusArea && dragStart) {
        const width = Math.abs(offsetX - dragStart.x);
        const height = Math.abs(offsetY - dragStart.y);
        
        const minDimension = 20;
        const finalWidth = Math.max(width, minDimension);
        const finalHeight = Math.max(height, minDimension);
        
        setFocusArea({
          x: Math.min(dragStart.x, offsetX),
          y: Math.min(dragStart.y, offsetY),
          width: finalWidth,
          height: finalHeight
        });
        return;
      }
      
      if (!isDrawing || !currentLine) return;
      
      // ÖNEMLİ DEĞİŞİKLİK: Dokunmatik için geçerli Layer'dan relatif pozisyon hesaplama
      // Çizim koordinatlarındaki kayma sorunu için özel yaklaşım
      
      // Stage'den ilk layer'a referans al
      const layer = stage.findOne('Layer');
      
      if (!layer) {
        console.error('Layer bulunamadı, koordinat dönüşümü yapılamadı.');
        return;
      }
      
      // Dokunmatik koordinatları manual olarak lokal koordinatlara çevirme
      // 1. Önce dokunmatik olayın ekran koordinatlarını al
      // 2. Layer'a göre relatif pozisyonu hesapla
      
      // Dokunmatik için hesaplama ekstra dikkat gerektirir
      const stageBox = stage.container().getBoundingClientRect();
      const layerPosition = {
        x: (offsetX - stageBox.left - stage.x()) / stage.scaleX(),
        y: (offsetY - stageBox.top - stage.y()) / stage.scaleY()
      };
      
      const x = layerPosition.x;
      const y = layerPosition.y;
      
      // Apple Pencil basınç güncellemesi
      let updatedLine = {
        ...currentLine,
        points: [...currentLine.points, x, y]
      };
      
      if (e.evt && e.evt.touches && e.evt.touches[0] && e.evt.touches[0].force !== undefined && e.evt.touches[0].force > 0) {
        // Basınç değişimine göre kalem kalınlığını güncelle
        const touchForce = e.evt.touches[0].force;
        const pressureValue = Math.min(touchForce / 2, 1);
        const baseStrokeWidth = tool === 'highlighter' ? strokeWidth * 2 : 
                              tool === 'eraser' ? strokeWidth * 3 : 
                              strokeWidth;
        updatedLine.strokeWidth = Math.max(1, baseStrokeWidth * pressureValue);
      }
      
      setCurrentLine(updatedLine);
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
    // Lokal çizim satırlarını temizle
    setLines([]);
    setCurrentLine(null);
    
    // Sayfa çizimlerini güncelle - kalıcı olarak temizle
    setPageDrawings(prev => {
      // Geçerli sayfa için boş bir dizi ata, diğer sayfaları koru
      const updatedDrawings = {
        ...prev,
        [currentPage]: []
      };
      
      // Yerel depolama için çizimleri sil (kaldır)
      try {
        localStorage.removeItem(`pageDrawings_${currentPage}`);
      } catch (error) {
        console.error('LocalStorage temizleme hatası:', error);
      }
      
      return updatedDrawings;
    });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throttledTouchMove = useCallback(throttle(handleTouchMove, 16), [handleTouchMove]); // ~60fps


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
    handleTouchMove: throttledTouchMove, // Performans için throttle kullan
    handleTouchEnd,
    clearDrawings
  };
};

export default useDrawing;