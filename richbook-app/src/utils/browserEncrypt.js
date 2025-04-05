// src/utils/browserEncrypt.js
// Tarayıcıda ve Electron'da çalışan şifreleme ve şifre çözme fonksiyonları
const isElectron = window && window.electronAPI !== undefined;
const path = isElectron ? window.electronAPI.path : null;

/**
 * Şifreleme için kullanılacak anahtar
 * Electron modünde preload scriptinden gelir, tarayıcı modunda .env değişkenlerinden alınır
 */
let encryptionMethod = 'simple';

/**
 * Bir dizinin şifrelenmesi
 * @param {Uint8Array} data - Şifrelenecek veri dizisi
 * @returns {Uint8Array} - Şifrelenmiş veri dizisi
 */
function encryptData(data) {
  if (isElectron && window.electronAPI.encryption) {
    // Electron modünde daha güvenli şifreleme kullan
    encryptionMethod = 'secure';
    return window.electronAPI.encryption.xorEncryptData(data);
  }
  
  // Tarayıcı modünde veya Electron modünde güvenli API mevcut değilse
  return simpleCryptoEncrypt(data);
}

/**
 * Bir dizinin şifresini çözer
 * @param {Uint8Array} data - Şifresi çözülecek veri dizisi
 * @returns {Uint8Array} - Şifresi çözülmüş veri dizisi
 */
function decryptData(data) {
  if (isElectron && window.electronAPI.encryption) {
    // Electron modünde daha güvenli şifre çözme kullan
    encryptionMethod = 'secure';
    return window.electronAPI.encryption.xorDecryptData(data);
  }
  
  // Tarayıcı modünde veya Electron modünde güvenli API mevcut değilse
  return simpleCryptoEncrypt(data); // XOR için şifreleme ve şifre çözme aynı işlem
}

/**
 * Basit XOR tabanlı şifreleme (eski sistemle uyumluluk için)
 * @param {Uint8Array} data - Şifrelenecek/çözülecek veri dizisi
 * @returns {Uint8Array} - Şifrelenmiş/Çözülmüş veri dizisi
 */
function simpleCryptoEncrypt(data) {
  // Tarayıcıda güvenli bir anahtar elde et
  const key = getSecureKey();
  const result = new Uint8Array(data.length);
  const keyLen = key.length;
  
  for (let i = 0; i < data.length; i++) {
    // Her baytı anahtarın bir karakteri ile XOR işlemine tabi tut
    const keyChar = key.charCodeAt(i % keyLen);
    result[i] = data[i] ^ keyChar;
  }
  
  return result;
}

/**
 * Tarayıcı için güvenli bir anahtar elde et
 * @returns {string} - Güvenli anahtar
 */
function getSecureKey() {
  // Local storage'da kaydedilmiş bir anahtar var mı?
  const storedKey = localStorage.getItem('encryptionKey');
  
  if (storedKey) {
    return storedKey;
  }
  
  // Oturum başına benzersiz bir anahtar oluştur ve sakla
  let newKey;
  
  try {
    // Web Crypto API ile güvenli rastgele değerler oluştur
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      window.crypto.getRandomValues(array);
      newKey = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
    } else {
      // Fallback - ideal değil
      newKey = 'BrowserKey_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    }
    
    // Anahtarı oturum için sakla
    sessionStorage.setItem('encryptionKey', newKey);
    
    return newKey;
  } catch (e) {
    console.error('Secure key generation failed:', e);
    // Acil durum için varsayılan anahtar (mevcut kodla uyumluluk için)
    return "Sm464436!";
  }
}

/**
 * Dosya yolunu platform tipine göre çözümler
 * @param {string} filePath - Dosya yolu
 * @returns {string} - Çözümlenmiş dosya yolu
 */
function resolveFilePath(filePath) {
  if (!isElectron) return filePath;
  
  // Geliştirme veya paketlenmiş mod için dosya yolunu belirle
  const resourcesPath = window.electronAPI.getResourcePath();
  
  // URL formatındaki dosya yolunu normal dosya yoluna dönüştür
  let normalizedPath = filePath;
  
  // URL'deki "encrypted/" kısmını çıkar (eğer varsa)
  if (normalizedPath.startsWith('encrypted/')) {
    normalizedPath = normalizedPath.substring('encrypted/'.length);
  }
  
  // Tam dosya yolunu oluştur
  return path.join(resourcesPath, 'encrypted', normalizedPath);
}

/**
 * Şifrelenmiş bir görüntü URL'sini çözer
 * @param {string} encryptedUrl - Şifrelenmiş görüntü URL'si
 * @returns {Promise<string>} - Şifresi çözülmüş görüntü URL'si
 */
export async function decryptImageUrl(encryptedUrl) {
  try {
    let encryptedData;
    
    if (isElectron) {
      // Electron ortamında dosya yolunu çözümle ve dosyayı oku
      const filePath = resolveFilePath(encryptedUrl);
      try {
        encryptedData = new Uint8Array(window.electronAPI.readFile(filePath));
      } catch (fileError) {
        console.error(`Error reading file: ${filePath}`, fileError);
        throw new Error(`Failed to read file: ${fileError.message}`);
      }
    } else {
      // Tarayıcı ortamında fetch et
      const response = await fetch(encryptedUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching image: ${response.status} ${response.statusText}`);
      }
      
      // ArrayBuffer olarak oku
      const encryptedBuffer = await response.arrayBuffer();
      encryptedData = new Uint8Array(encryptedBuffer);
    }
    
    // Veriyi şifresini çöz
    const decryptedData = decryptData(encryptedData);
    
    // Dosya tipini belirleme - IFP uzantısını işleme
    let mimeType = 'image/jpeg'; // Varsayılan MIME türü
    
    // Dosya uzantısına göre MIME türünü belirleme
    if (encryptedUrl.toLowerCase().endsWith('.png')) {
      mimeType = 'image/png';
    } else if (encryptedUrl.toLowerCase().endsWith('.gif')) {
      mimeType = 'image/gif';
    } else if (encryptedUrl.toLowerCase().endsWith('.ifp')) {
      // .ifp uzantılı dosyalar için JPEG formatı kullan
      mimeType = 'image/jpeg';
    }
    
    // Blob oluştur
    const blob = new Blob([decryptedData], { type: mimeType });
    
    // Blob'dan URL oluştur
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Image decryption error:', error);
    return encryptedUrl; // Hata durumunda orijinal URL'yi dön
  }
}

/**
 * Çoklu görüntüleri paralel olarak şifresini çöz
 * @param {Array<Object>} pages - Şifrelenmiş görüntü URL'lerini içeren sayfa nesneleri dizisi
 * @returns {Promise<Object>} - Şifresi çözülmüş URL'leri içeren nesne (id -> URL)
 */
export async function decryptMultipleImages(pages) {
  try {
    // Tüm görüntüleri paralel olarak şifresini çöz
    const decryptPromises = pages.map(async page => {
      try {
        const decryptedUrl = await decryptImageUrl(page.src);
        return { id: page.id, url: decryptedUrl };
      } catch (error) {
        console.error(`Error decrypting page ${page.id}:`, error);
        return { id: page.id, url: page.src }; // Hata durumunda orijinal URL'yi dön
      }
    });
    
    const results = await Promise.all(decryptPromises);
    
    // Sonuçları bir nesnede topla (id -> URL)
    const decryptedUrls = {};
    results.forEach(item => {
      decryptedUrls[item.id] = item.url;
    });
    
    return decryptedUrls;
  } catch (error) {
    console.error('Error decrypting multiple images:', error);
    return {};
  }
}