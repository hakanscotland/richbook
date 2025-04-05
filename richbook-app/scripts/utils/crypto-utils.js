// crypto-utils.js - Şifreleme yardımcı fonksiyonları
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config(); // .env dosyasını yükle

// Şifreleme anahtarı yönetimi
let encryptionKey = null;

/**
 * Şifreleme anahtarını al, ortam değişkeninden veya dosyadan
 * @returns {string} - Şifreleme anahtarı
 */
function getEncryptionKey() {
  if (encryptionKey !== null) {
    return encryptionKey;
  }

  // 1. Önce ortam değişkeninden kontrol et
  if (process.env.ENCRYPTION_SECRET_KEY) {
    encryptionKey = process.env.ENCRYPTION_SECRET_KEY;
    console.log('Using encryption key from environment variable');
    return encryptionKey;
  }

  // 2. Özel anahtar dosyasını kontrol et
  const keyFilePath = path.join(__dirname, '..', '..', '.secret-key');
  if (fs.existsSync(keyFilePath)) {
    try {
      encryptionKey = fs.readFileSync(keyFilePath, 'utf8').trim();
      console.log('Using encryption key from key file');
      return encryptionKey;
    } catch (error) {
      console.warn('Error reading key file:', error.message);
    }
  }

  // 3. Varsayılan anahtarı kontrol et (geriye dönük uyumluluk için)
  const defaultKey = "Sm464436!"; // Mevcut sabit anahtar
  console.warn('⚠️ WARNING: Using default encryption key! This is not secure for production.');
  console.warn('Create a .env file with ENCRYPTION_SECRET_KEY or a .secret-key file with your key.');
  encryptionKey = defaultKey;
  return encryptionKey;
}

/**
 * Modern AES şifreleme (üretim için)
 * @param {Buffer} data - Şifrelenecek veri
 * @returns {Buffer} - Şifrelenmiş veri
 */
function aesEncrypt(data) {
  const key = getEncryptionKey();
  
  // AES için anahtarı düzgün formata getir (32 byte - 256 bit)
  const hash = crypto.createHash('sha256').update(key).digest();
  
  // 16 byte IV (Initialization Vector) oluştur
  const iv = crypto.randomBytes(16);
  
  // AES-256-CBC şifreleme
  const cipher = crypto.createCipheriv('aes-256-cbc', hash, iv);
  
  // Veriyi şifrele
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  
  // IV'yi ve şifrelenmiş veriyi birleştir
  return Buffer.concat([iv, encrypted]);
}

/**
 * Modern AES şifre çözme (üretim için)
 * @param {Buffer} data - Şifreli veri (IV + şifreli içerik)
 * @returns {Buffer} - Çözülmüş veri
 */
function aesDecrypt(data) {
  const key = getEncryptionKey();
  
  // AES için anahtarı düzgün formata getir (32 byte - 256 bit)
  const hash = crypto.createHash('sha256').update(key).digest();
  
  // İlk 16 byte IV (Initialization Vector)
  const iv = data.slice(0, 16);
  
  // Geri kalanı şifrelenmiş veri
  const encrypted = data.slice(16);
  
  // AES-256-CBC şifre çözme
  const decipher = crypto.createDecipheriv('aes-256-cbc', hash, iv);
  
  // Veriyi çöz
  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Basit XOR şifreleme (geriye dönük uyumluluk için)
 * @param {Buffer} data - Şifrelenecek veri
 * @returns {Buffer} - Şifrelenmiş veri
 */
function xorEncrypt(data) {
  const key = getEncryptionKey();
  const result = Buffer.alloc(data.length);
  const keyLen = key.length;
  
  for (let i = 0; i < data.length; i++) {
    // Her baytı anahtarın bir karakteri ile XOR işlemine tabi tut
    const keyChar = key.charCodeAt(i % keyLen);
    result[i] = data[i] ^ keyChar;
  }
  
  return result;
}

/**
 * Bir dosyayı seçilen şifreleme yöntemi ile şifrele
 * @param {string} inputPath - Giriş dosyası
 * @param {string} outputPath - Çıkış dosyası
 * @param {string} method - Şifreleme yöntemi ('aes' veya 'xor')
 */
function encryptFile(inputPath, outputPath, method = 'xor') {
  try {
    // Dosyayı oku
    const data = fs.readFileSync(inputPath);
    
    // Veriyi şifrele
    let encryptedData;
    
    if (method === 'aes') {
      encryptedData = aesEncrypt(data);
    } else {
      encryptedData = xorEncrypt(data);
    }
    
    // Şifrelenmiş veriyi dosyaya kaydet
    fs.writeFileSync(outputPath, encryptedData);
    
    return true;
  } catch (error) {
    console.error(`Error encrypting file ${inputPath}:`, error);
    return false;
  }
}

module.exports = {
  getEncryptionKey,
  aesEncrypt,
  aesDecrypt,
  xorEncrypt,
  encryptFile
};