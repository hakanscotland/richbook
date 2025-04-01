// src/utils/browserEncrypt.js
// Tarayıcıda çalışan şifreleme ve şifre çözme fonksiyonları

/**
 * Şifreleme için kullanılacak anahtar
 */
const SECRET_KEY = "Sm464436!";

/**
 * Bir dizinin XOR ile şifrelenmesi
 * @param {Uint8Array} data - Şifrelenecek veri dizisi
 * @returns {Uint8Array} - Şifrelenmiş veri dizisi
 */
function xorEncrypt(data) {
  const result = new Uint8Array(data.length);
  const keyLen = SECRET_KEY.length;
  
  for (let i = 0; i < data.length; i++) {
    // Her baytı SECRET_KEY'in bir karakteri ile XOR işlemine tabi tut
    const keyChar = SECRET_KEY.charCodeAt(i % keyLen);
    result[i] = data[i] ^ keyChar;
  }
  
  return result;
}

/**
 * Şifrelenmiş bir görüntü URL'sini çözer
 * @param {string} encryptedUrl - Şifrelenmiş görüntü URL'si
 * @returns {Promise<string>} - Şifresi çözülmüş görüntü URL'si
 */
export async function decryptImageUrl(encryptedUrl) {
  try {
    // Görüntüyü fetch et
    const response = await fetch(encryptedUrl);
    
    if (!response.ok) {
      throw new Error(`Error fetching image: ${response.status} ${response.statusText}`);
    }
    
    // ArrayBuffer olarak oku
    const encryptedBuffer = await response.arrayBuffer();
    const encryptedData = new Uint8Array(encryptedBuffer);
    
    // Veriyi şifrele (XOR olduğu için şifreleme ve şifre çözme aynı işlem)
    const decryptedData = xorEncrypt(encryptedData);
    
    // Blob oluştur
    const blob = new Blob([decryptedData], { type: 'image/jpeg' });
    
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