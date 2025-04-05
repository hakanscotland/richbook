// Toolbar genişliğini zorlamak için eklenen bir JavaScript dosyası

// Bu dosya, özellikle iPad'lerde Toolbar genişliğini zorlamak için kullanılır
(function() {
  // Dokunmatik cihaz ve iPad/Tablet algılama
  function detectTouchDevice() {
    const hasTouch = 'ontouchstart' in window || 
                    navigator.maxTouchPoints > 0 || 
                    navigator.msMaxTouchPoints > 0;
    
    console.log('[ForceToolbarWidth] Dokunmatik cihaz algılandı:', hasTouch);
    
    if (hasTouch) {
      document.documentElement.classList.add('touch-device');
      document.body.classList.add('touch-device');
      
      // CSS değişkenini ayarla
      document.documentElement.style.setProperty('--toolbar-width', '150px');
    }
    
    // iPad/Tablet tespiti
    const isIPadOS13 = navigator.platform === 'MacIntel' && 'ontouchend' in document;
    const isIPad = /iPad/.test(navigator.userAgent) || isIPadOS13;
    const isTablet = /Tablet|iPad|Playbook|Android(?!.*Mobile)|Silk(?!.*Mobile)/.test(navigator.userAgent);
    
    if (isIPad || isTablet) {
      console.log('[ForceToolbarWidth] iPad/Tablet algılandı:', isIPad ? 'iPad' : 'Tablet');
      document.documentElement.classList.add('ipad-device');
      document.body.classList.add('ipad-device');
      
      // CSS değişkenini ayarla
      document.documentElement.style.setProperty('--toolbar-width', '160px');
      
      // Toolbar öğelerini bul ve doğrudan stil uygula
      function applyToolbarStyles() {
        const toolbars = document.querySelectorAll('.toolbar');
        toolbars.forEach(toolbar => {
          toolbar.style.width = '160px';
          console.log('[ForceToolbarWidth] Toolbar genişliği zorlandı:', toolbar);
          
          // Home ve Ayarlar butonlarının yan yana görünmesini sağla
          const buttonPairs = toolbar.querySelectorAll('.toolbar-button-pair');
          buttonPairs.forEach(pair => {
            pair.style.display = 'grid';
            pair.style.gridTemplateColumns = '1fr 1fr';
            pair.style.width = '90%';
          });
        });
      }
      
      // Sayfa yüklendiğinde ve 1 saniye sonra uygula
      setTimeout(applyToolbarStyles, 100);
      setTimeout(applyToolbarStyles, 500);
      setTimeout(applyToolbarStyles, 1000);
      
      // DrawingTools paneli için iyileştirmeler
      function enhanceDrawingTools() {
        const drawingPanels = document.querySelectorAll('.drawing-tools-panel');
        drawingPanels.forEach(panel => {
          panel.style.width = '60px';
          
          // Clear butonunu büyüt
          const clearButton = panel.querySelector('.drawing-tool-button--clear');
          if (clearButton) {
            clearButton.style.width = '44px';
            clearButton.style.height = '44px';
            clearButton.style.padding = '10px';
            clearButton.style.marginTop = '8px';
            clearButton.style.marginBottom = '4px';
          }
        });
      }
      
      // Drawing Tools paneli için iyileştirmeleri uygula
      setTimeout(enhanceDrawingTools, 500);
      setTimeout(enhanceDrawingTools, 1500);
    }
  }
  
  // Sayfa yüklenirken algılamayı çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', detectTouchDevice);
  } else {
    detectTouchDevice();
  }
  
  // Sayfa tamamen yüklendiğinde tekrar kontrol et
  window.addEventListener('load', () => {
    setTimeout(detectTouchDevice, 500);
  });
})();