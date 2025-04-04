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
      document.documentElement.style.setProperty('--toolbar-width', '192px');
      
      // Toolbar öğelerini bul ve doğrudan stil uygula
      setTimeout(() => {
        const toolbars = document.querySelectorAll('.toolbar');
        toolbars.forEach(toolbar => {
          toolbar.style.width = '192px';
          console.log('[ForceToolbarWidth] Toolbar genişliği zorlandı:', toolbar);
        });
      }, 1000); // Sayfanın tamamen yüklenmesi için biraz bekle
    }
  }
  
  // Sayfa yüklendiğinde algılamayı çalıştır
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
