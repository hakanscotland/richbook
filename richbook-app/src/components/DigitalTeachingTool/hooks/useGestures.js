import { useEffect, useRef, useState } from 'react';

// Çok parmak hareketlerini (multitouch gestures) işleyen hook
const useGestures = ({ 
  containerRef, 
  zoom, 
  setZoom, 
  currentPage, 
  totalPages, 
  goToPage,
  nextPage,
  prevPage,
  isDoublePageView,
  isHalfPageView,
  tool
}) => {
  // Son dokunma pozisyonları
  const touchesRef = useRef([]);
  // Başlangıç mesafesi (pinch-zoom işlemi için)
  const startDistanceRef = useRef(null);
  // Başlangıç zoom değeri (pinch-zoom işlemi için)
  const startZoomRef = useRef(null);
  // Yatay kaydırma başlangıç pozisyonu
  const swipeStartXRef = useRef(null);
  // Yatay kaydırma aktif mi
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  // Pinch zoom aktif mi
  const [isPinchActive, setIsPinchActive] = useState(false);
  
  // İki nokta arasındaki mesafeyi hesaplar
  const calculateDistance = (touch1, touch2) => {
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };
  
  // Dokunma başlangıcı olayı
  const handleTouchStart = (event) => {
    // Eğer çizim modu aktifse, hareketleri işleme
    if (tool !== 'hand') {
      return;
    }
    
    const touches = Array.from(event.touches);
    touchesRef.current = touches;
    
    // İki parmak varsa pinch-zoom için hazırlan
    if (touches.length === 2) {
      const distance = calculateDistance(touches[0], touches[1]);
      startDistanceRef.current = distance;
      startZoomRef.current = zoom;
      setIsPinchActive(true);
    }
    // Tek parmak varsa sayfa kaydırma için hazırlan
    else if (touches.length === 1) {
      swipeStartXRef.current = touches[0].clientX;
      setIsSwipeActive(true);
    }
  };
  
  // Dokunma hareketi (devam eden hareket)
  const handleTouchMove = (event) => {
    // Eğer çizim modu aktifse, hareketleri işleme
    if (tool !== 'hand') {
      return;
    }
    
    const touches = Array.from(event.touches);
    
    // İki parmak için pinch-zoom işlemi
    if (isPinchActive && touches.length === 2 && startDistanceRef.current) {
      // Mesafeyi hesapla
      const currentDistance = calculateDistance(touches[0], touches[1]);
      
      // Oranı bul ve zoom'u ayarla
      const ratio = currentDistance / startDistanceRef.current;
      
      // Daha hassas ve yumuşak zoom efekti için hareket filtresi
      const zoomFactor = 0.8; // Hareket hassasiyeti (0-1)
      const smoothedRatio = 1 + ((ratio - 1) * zoomFactor);
      
      // Zoom sınırlarını ayarla
      const minZoom = 0.5;
      const maxZoom = 5;
      const newZoom = Math.min(Math.max(startZoomRef.current * smoothedRatio, minZoom), maxZoom);
      
      // Zoom değerini güncelle
      setZoom(newZoom);
      
      // Varsayılan davranışı engelle
      event.preventDefault();
    }
    // Tek parmak için sayfa kaydırma (swipe)
    else if (isSwipeActive && touches.length === 1 && swipeStartXRef.current !== null) {
      const currentX = touches[0].clientX;
      const deltaX = currentX - swipeStartXRef.current;
      
      // Küçük hareketleri görmezden gel
      if (Math.abs(deltaX) < 10) {
        return;
      }
      
      // Sayfayı değiştirmek için gereken minimum kaydırma mesafesi
      const swipeThreshold = 100;
      
      // Yeterince kaydırıldığında sayfa değiştir
      if (Math.abs(deltaX) > swipeThreshold) {
        // Kaydırma yönüne göre UI görünümü
        const direction = deltaX > 0 ? 'prev' : 'next';
        
        // Sayfa değiştirme animasyonu için kısa bekle
        setTimeout(() => {
          if (direction === 'prev') {
            // Sağa kaydırma - önceki sayfa
            prevPage();
          } else {
            // Sola kaydırma - sonraki sayfa
            nextPage();
          }
        }, 100);
        
        // Kaydırma işlemini sıfırla
        swipeStartXRef.current = null;
        setIsSwipeActive(false);
        event.preventDefault();
      }
    }
  };
  
  // Dokunma sonu olayı
  const handleTouchEnd = (event) => {
    // Her tür dokunma hareketini sıfırla
    startDistanceRef.current = null;
    swipeStartXRef.current = null;
    setIsPinchActive(false);
    setIsSwipeActive(false);
  };
  
  // Çift tıklama ile zoom yapma
  const handleDoubleTap = (event) => {
    // Eğer çizim modu aktifse, çift tıklamayı işleme
    if (tool !== 'hand') {
      return;
    }
    
    // Çift tıklama görünümünü ekle
    const doubleTapIndicator = document.createElement('div');
    doubleTapIndicator.className = 'double-tap-indicator';
    doubleTapIndicator.style.left = `${event.changedTouches[0].clientX - 30}px`;
    doubleTapIndicator.style.top = `${event.changedTouches[0].clientY - 30}px`;
    document.body.appendChild(doubleTapIndicator);
    
    // Animasyon bittikten sonra elementi kaldır
    setTimeout(() => {
      if (doubleTapIndicator.parentNode) {
        doubleTapIndicator.parentNode.removeChild(doubleTapIndicator);
      }
    }, 400);
    
    // Çift tıklama ile yakınlaştırma/uzaklaştırma
    if (zoom === 1) {
      setZoom(2); // Yakınlaştır
    } else {
      setZoom(1); // Normal boyuta geri dön
    }
    
    event.preventDefault();
  };
  
  // Olay dinleyicilerini bağla
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    
    // Çift tıklamayı algılama
    let lastTap = 0;
    const handleTap = (event) => {
      // Eğer çizim modu aktifse, çift tıklamayı işleme
      if (tool !== 'hand') {
        return;
      }
      
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      
      if (tapLength < 300 && tapLength > 0) {
        handleDoubleTap(event);
      }
      
      lastTap = currentTime;
    };
    
    container.addEventListener('touchend', handleTap);
    
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchend', handleTap);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, zoom, setZoom, tool, currentPage, nextPage, prevPage, isPinchActive, isSwipeActive]);
  
  return {
    isPinchActive,
    isSwipeActive
  };
};

export default useGestures;