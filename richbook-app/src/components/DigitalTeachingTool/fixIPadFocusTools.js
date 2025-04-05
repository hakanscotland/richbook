// Bu script, iPad'de Focus Tools içindeki araç ayarları panelini iyileştirir
// Özellikler penceresinin ekran dışına taşmasını önler

(function() {
  function fixFocusToolsPosition() {
    // Dokunmatik cihaz mı kontrol et
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (!isTouchDevice) return; // Sadece dokunmatik cihazlarda çalış
    
    console.log('[fixIPadFocusTools] Dokunmatik cihaz için Focus Tools düzeltmeleri başlatılıyor...');
    
    // 1. Özellikler panelini daha iyi yerleştirmek için MutationObserver kullan
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        // Yeni eklenen öğeleri kontrol et
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach(function(node) {
            if (node.classList && node.classList.contains('tool-options-wrapper')) {
              console.log('[fixIPadFocusTools] Araç ayarları paneli tespit edildi, pozisyon düzeltiliyor...');
              
              // Panel daha geniş olsun
              const panel = node.querySelector('.tool-options-panel');
              if (panel) {
                panel.style.width = '250px';
                panel.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.3)';
              }
              
              // Mevcut pozisyonu kontrol et
              const panelRect = node.getBoundingClientRect();
              const windowWidth = window.innerWidth;
              
              // Ekran dışına taşmasını önle
              if (panelRect.right > windowWidth - 20) {
                const newLeft = Math.max(80, windowWidth - panelRect.width - 30);
                node.style.left = `${newLeft}px`;
                console.log('[fixIPadFocusTools] Panel sağ kenara çok yakın, sola doğru hizalandı: ' + newLeft + 'px');
              }
              
              // Panelin içindeki butonları ve öğeleri büyüt
              const colorSwatches = node.querySelectorAll('.color-swatch');
              colorSwatches.forEach(swatch => {
                swatch.style.width = '32px';
                swatch.style.height = '32px';
              });
              
              // Kalınlık slider'ını büyüt
              const slider = node.querySelector('.thickness-slider');
              if (slider) {
                slider.style.height = '12px';
                slider.style.margin = '16px 0';
              }
            }
          });
        }
      });
    });
    
    // Focus modal'ı gözlemle
    setTimeout(() => {
      const focusModal = document.querySelector('.focus-modal');
      if (focusModal) {
        console.log('[fixIPadFocusTools] Focus modal tespit edildi, gözlemleniyor...');
        observer.observe(focusModal, { 
          childList: true, 
          subtree: true 
        });
      }
    }, 500);
    
    // 2. Ayarlar panelini göstermek için bir CSS öğesini dokümana ekle
    const style = document.createElement('style');
    style.textContent = `
      @media (pointer: coarse) {
        .tool-options-panel {
          width: 250px !important;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        .color-section,
        .thickness-section {
          padding: 16px !important;
        }
        
        .color-grid {
          gap: 12px !important;
        }
        
        .color-swatch {
          width: 32px !important;
          height: 32px !important;
        }
        
        .thickness-options {
          gap: 10px !important;
          margin-bottom: 16px !important;
        }
        
        .thickness-swatch {
          transform: scale(1.2) !important;
        }
        
        .thickness-slider {
          height: 12px !important;
          margin: 16px 0 !important;
        }
        
        .thickness-slider::-webkit-slider-thumb {
          width: 28px !important;
          height: 28px !important;
        }
        
        .thickness-value {
          font-size: 16px !important;
          margin-top: 5px !important;
        }
        
        .tool-options-header {
          padding: 12px 16px !important;
          font-size: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Sayfa yüklendiğinde çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fixFocusToolsPosition);
  } else {
    fixFocusToolsPosition();
  }
  
  // Sayfa tam yüklendiğinde tekrar çalıştır
  window.addEventListener('load', fixFocusToolsPosition);
})();