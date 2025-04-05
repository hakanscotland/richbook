// Bu dosya, Home ve Ayarlar butonlarının yan yana doğru şekilde görünmesini sağlar
// Build sürecinden ve cache'den etkilenmeyen şekilde doğrudan DOM'a müdahale eder

(function() {
  function forceHomeSettingsLayout() {
    // Home ve Ayarlar butonlarını içeren container'ı bul
    const homeSettingsPair = document.querySelector('.home-settings-pair');
    
    if (homeSettingsPair) {
      // HTML attribute olarak stil ver - CSS'in geçersiz kılınmasını önler
      homeSettingsPair.setAttribute('style', 'display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 10px !important; width: 90% !important; margin-bottom: 10px !important;');
      
      console.log('[ForceHomeSettings] Home ve Ayarlar butonları düzeltildi');
    } else {
      console.log('[ForceHomeSettings] Home-Settings container bulunamadı, tekrar denenecek...');
    }
  }
  
  // DOM hazır olduğunda ve yüklendikten sonra çalıştır
  function applyFixes() {
    forceHomeSettingsLayout();
    
    // Görünürlük sorunlarını çözmek için birkaç kez tekrar çalıştır (DOM güncellemeleri sonrası)
    setTimeout(forceHomeSettingsLayout, 100);
    setTimeout(forceHomeSettingsLayout, 500);
    setTimeout(forceHomeSettingsLayout, 1000); 
    setTimeout(forceHomeSettingsLayout, 2000);
  }
  
  // Sayfa yüklenirken çalıştır
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyFixes);
  } else {
    applyFixes();
  }
  
  // Sayfa tamamen yüklendiğinde tekrar çalıştır
  window.addEventListener('load', applyFixes);
  
  // MutationObserver kullanarak DOM değişikliklerini izle ve butonları düzelt
  const observer = new MutationObserver(function(mutations) {
    forceHomeSettingsLayout();
  });
  
  // Observer'ı başlat
  setTimeout(function() {
    const targetNode = document.body;
    if (targetNode) {
      observer.observe(targetNode, { 
        childList: true, 
        subtree: true 
      });
      console.log('[ForceHomeSettings] MutationObserver başlatıldı');
    }
  }, 1000);
  
})();