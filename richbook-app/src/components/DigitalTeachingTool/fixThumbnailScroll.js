// Bu script, dokunmatik cihazlarda Thumbnails kenar çubuğunun kaydırma işlevini iyileştirir

(function() {
  function fixThumbnailScroll() {
    // Dokunmatik cihaz mı kontrol et
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return; // Sadece dokunmatik cihazlarda çalış
    
    console.log('[fixThumbnailScroll] Dokunmatik cihaz için thumbnail kaydırma düzeltmeleri başlatılıyor...');
    
    function enhanceThumbnailScroll() {
      // Thumbnail container'ı bul
      const thumbnailSidebar = document.querySelector('.thumbnails-sidebar');
      if (!thumbnailSidebar) {
        console.log('[fixThumbnailScroll] Thumbnail kenar çubuğu bulunamadı, tekrar denenecek...');
        return false;
      }
      
      const thumbnailsContainer = thumbnailSidebar.querySelector('.thumbnails-container');
      if (!thumbnailsContainer) {
        console.log('[fixThumbnailScroll] Thumbnails container bulunamadı, tekrar denenecek...');
        return false;
      }
      
      console.log('[fixThumbnailScroll] Thumbnails container bulundu, kaydırma düzeltmeleri uygulanıyor...');
      
      // Dokunmatik cihazlar için kaydırma özelliklerini iyileştir
      thumbnailsContainer.style.overscrollBehavior = 'contain';
      thumbnailsContainer.style.webkitOverflowScrolling = 'touch';
      thumbnailsContainer.style.scrollSnapType = 'y proximity';
      thumbnailsContainer.style.touchAction = 'pan-y';
      thumbnailsContainer.style.position = 'relative';
      thumbnailsContainer.style.flexGrow = '1';
      thumbnailsContainer.style.overflowY = 'auto';
      thumbnailsContainer.style.scrollbarWidth = 'thin';
      
      // Diğer kenar çubuğu stillerini düzelt
      thumbnailSidebar.style.display = 'flex';
      thumbnailSidebar.style.flexDirection = 'column';
      thumbnailSidebar.style.overflowY = 'hidden'; // Kenar çubuğunun kendisi kaydırılmasın
      
      const thumbnailHeader = thumbnailSidebar.querySelector('.thumbnails-header');
      if (thumbnailHeader) {
        thumbnailHeader.style.flexShrink = '0';
        thumbnailHeader.style.padding = '0.25rem 0';
      }
      
      // Listelenmiş her thumbnail öğesine scroll-snap ekle
      const thumbnailItems = thumbnailsContainer.querySelectorAll('.thumbnail-item');
      thumbnailItems.forEach(item => {
        item.style.scrollSnapAlign = 'start';
        item.style.minHeight = '80px';
        item.style.flexShrink = '0';
      });
      
      // Dokunmatik kaydırma için event listener'ları ekle
      let startY = 0;
      let scrollTop = 0;
      let isTouching = false;
      
      // Touch başladığında
      const handleTouchStart = (e) => {
        // İç kaydırma alanında dokunma tespit edildi
        isTouching = true;
        startY = e.touches[0].clientY;
        scrollTop = thumbnailsContainer.scrollTop;
        
        // Dokunma noktasındaki üstteki bir parent elementi kullanan bir olay olmasını engelle
        e.stopPropagation();
      };
      
      // Touch hareket ederken
      const handleTouchMove = (e) => {
        if (!isTouching) return;
        
        const touchY = e.touches[0].clientY;
        const deltaY = startY - touchY;
        
        // Kaydırma işlemini uygula
        thumbnailsContainer.scrollTop = scrollTop + deltaY;
        
        // Doğal kaydırma davranışını engelle
        e.preventDefault();
        e.stopPropagation();
      };
      
      // Touch sona erdiğinde
      const handleTouchEnd = (e) => {
        isTouching = false;
        e.stopPropagation();
      };
      
      // Olay dinleyicilerini ekle
      thumbnailsContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
      thumbnailsContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
      thumbnailsContainer.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      console.log('[fixThumbnailScroll] Thumbnails kaydırma düzeltmeleri tamamlandı');
      return true;
    }
    
    // Farklı zamanlarda deneyerek kenar çubuğunun oluşmasını bekle
    let attempts = 0;
    const maxAttempts = 10;
    
    function retryEnhancement() {
      if (attempts >= maxAttempts) {
        console.log('[fixThumbnailScroll] Maksimum deneme sayısına ulaşıldı');
        return;
      }
      
      const success = enhanceThumbnailScroll();
      if (!success) {
        attempts++;
        setTimeout(retryEnhancement, 300 * attempts); // Gecikmeli tekrar deneme
      }
    }
    
    // Kenar çubuğu görünürlüğünde değişiklikleri izle ve gerektiğinde yeniden uygula
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          // Yeni eklenen DOM elemanlarını işle
          mutation.addedNodes.forEach(function(node) {
            if (node.nodeType === 1 && (
              node.classList?.contains('thumbnails-sidebar') ||
              node.querySelector?.('.thumbnails-sidebar')
            )) {
              console.log('[fixThumbnailScroll] Yeni bir thumbnail kenar çubuğu tespit edildi');
              retryEnhancement();
            }
          });
        }
      });
    });
    
    // DOM yüklendiğinde başlat
    document.addEventListener('DOMContentLoaded', retryEnhancement);
    
    // Document body'yi gözlemle
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
    
    // Sayfa tam yüklendiğinde tekrar dene
    window.addEventListener('load', retryEnhancement);
    
    // İlk çalıştırma
    retryEnhancement();
  }
  
  fixThumbnailScroll();
})();