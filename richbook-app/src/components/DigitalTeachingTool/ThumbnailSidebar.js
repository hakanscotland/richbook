// src/components/DigitalTeachingTool/ThumbnailSidebar.js
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const ThumbnailSidebar = ({ 
  pages, 
  currentPage, 
  decryptedImages, 
  isLoadingImages, 
  goToPage, 
  setShowThumbnails, 
  isDarkMode 
}) => {
  // Sidebar container referansı
  const containerRef = useRef(null);
  
  // Dokunmatik kaydırma için eğer dokunmatik cihazsa event listener'ları ekle
  useEffect(() => {
    // Dokunmatik cihaz mı tespit et
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice && containerRef.current) {
      console.log('Thumbnails için dokunmatik kaydırma iyileştirmeleri yükleniyor...');
      
      const container = containerRef.current;
      const thumbnailsContainer = container.querySelector('.thumbnails-container');
      
      if (thumbnailsContainer) {
        // Dokunmatik kaydırma için değişkenler
        let startY = 0;
        let scrollTop = 0;
        let isTouching = false;
        
        // Touch başladığında
        const handleTouchStart = (e) => {
          // İç kaydırma alanında dokunma tespit edildi
          isTouching = true;
          startY = e.touches[0].clientY;
          scrollTop = thumbnailsContainer.scrollTop;
          e.stopPropagation();
        };
        
        // Touch hareket ederken
        const handleTouchMove = (e) => {
          if (!isTouching) return;
          
          const touchY = e.touches[0].clientY;
          const deltaY = startY - touchY;
          
          // Kaydırma işlemini uygula
          thumbnailsContainer.scrollTop = scrollTop + deltaY;
          e.preventDefault();
          e.stopPropagation();
        };
        
        // Touch sona erdiğinde
        const handleTouchEnd = (e) => {
          isTouching = false;
          e.stopPropagation();
        };
        
        // Style iyileştirmeleri
        thumbnailsContainer.style.overscrollBehavior = 'contain';
        thumbnailsContainer.style.webkitOverflowScrolling = 'touch';
        thumbnailsContainer.style.scrollSnapType = 'y proximity';
        thumbnailsContainer.style.touchAction = 'pan-y';
        
        // Listelenmiş her thumbnail öğesine scroll-snap ekle
        const thumbnailItems = thumbnailsContainer.querySelectorAll('.thumbnail-item');
        thumbnailItems.forEach(item => {
          item.style.scrollSnapAlign = 'start';
        });
        
        // Olay dinleyicilerini ekle
        thumbnailsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
        thumbnailsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        thumbnailsContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
        
        // Temizleme fonksiyonu
        return () => {
          thumbnailsContainer.removeEventListener('touchstart', handleTouchStart);
          thumbnailsContainer.removeEventListener('touchmove', handleTouchMove);
          thumbnailsContainer.removeEventListener('touchend', handleTouchEnd);
        };
      }
    }
  }, []);
  
  return (
    <div 
      ref={containerRef}
      className={`thumbnails-sidebar thumbnails-sidebar--${isDarkMode ? 'dark' : 'light'}`}
    >
      <div className="thumbnails-header">
        <span>Pages</span>
        <X 
          size={16} 
          onClick={() => setShowThumbnails(false)} 
          style={{ cursor: 'pointer' }} 
        />
      </div>
      <div className="thumbnails-container">
        {pages.map((page, index) => (
          <div 
            key={page.id} 
            className={`thumbnail-item 
              ${currentPage === index + 1 ? 'thumbnail-item--current' : ''} 
              thumbnail-item--${isDarkMode ? 'dark' : 'light'}`}
            onClick={() => {
              goToPage(index + 1);
              setShowThumbnails(false);
            }}
          >
            {isLoadingImages ? (
              <div className="thumbnail-loading">
                <div className="spinner-small"></div>
              </div>
            ) : (
              <img 
                src={decryptedImages[index + 1] || page.src} 
                alt={`Page ${index + 1}`} 
                className="thumbnail-image"
              />
            )}
            <div className="thumbnail-label">
              Page {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThumbnailSidebar;