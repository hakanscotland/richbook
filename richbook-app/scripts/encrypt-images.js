// encrypt-images.js - Kitap sayfalarını şifreleme betiği
const fs = require('fs');
const path = require('path');

// Şifreleme için kullanılacak anahtar - browserEncrypt.js ile aynı olmalı
const SECRET_KEY = "Sm464436!";

/**
 * Bir dizinin XOR ile şifrelenmesi
 * @param {Buffer} data - Şifrelenecek veri dizisi
 * @returns {Buffer} - Şifrelenmiş veri dizisi
 */
function xorEncrypt(data) {
  const result = Buffer.alloc(data.length);
  const keyLen = SECRET_KEY.length;
  
  for (let i = 0; i < data.length; i++) {
    // Her baytı SECRET_KEY'in bir karakteri ile XOR işlemine tabi tut
    const keyChar = SECRET_KEY.charCodeAt(i % keyLen);
    result[i] = data[i] ^ keyChar;
  }
  
  return result;
}

/**
 * Bir görüntü dosyasını şifrele
 * @param {string} inputPath - Şifrelenecek dosyanın yolu
 * @param {string} outputPath - Şifrelenmiş dosyanın kaydedileceği yol
 */
function encryptFile(inputPath, outputPath) {
  try {
    // Dosyayı oku
    const data = fs.readFileSync(inputPath);
    
    // Veriyi şifrele
    const encryptedData = xorEncrypt(data);
    
    // Şifrelenmiş veriyi dosyaya kaydet
    fs.writeFileSync(outputPath, encryptedData);
    
    console.log(`Encrypted: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Error encrypting ${inputPath}:`, error);
  }
}

/**
 * Bir klasördeki tüm görüntüleri şifrele
 * @param {string} inputDir - Şifrelenecek dosyaların klasörü
 * @param {string} outputDir - Şifrelenmiş dosyaların kaydedileceği klasör
 * @param {Array<string>} extensions - Şifrelenecek dosya uzantıları
 */
function encryptDirectory(inputDir, outputDir, extensions = ['.jpg', '.jpeg', '.png']) {
  // Çıktı klasörünün varlığını kontrol et, yoksa oluştur
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Girdi klasöründeki dosyaları oku
  const files = fs.readdirSync(inputDir);
  
  // İlerleme raporlaması için sayaçlar
  let totalFiles = 0;
  let encryptedFiles = 0;
  
  // Şifrelenecek dosyaları bulma
  files.forEach(file => {
    const filePath = path.join(inputDir, file);
    
    // Dosya durumunu kontrol et
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Alt klasör varsa, rekursif olarak işle
      encryptDirectory(filePath, path.join(outputDir, file), extensions);
    } else if (stat.isFile()) {
      // Dosya uzantısını kontrol et
      const ext = path.extname(file).toLowerCase();
      if (extensions.includes(ext)) {
        totalFiles++;
        
        // Dosya adını ve uzantısını ayır
        const baseName = path.basename(file, ext);
        
        // Şifrelenmiş dosyanın uzantısını .ifp olarak değiştir
        const outputFileName = `${baseName}.ifp`;
        const outputPath = path.join(outputDir, outputFileName);
        
        // Dosyayı şifrele
        encryptFile(filePath, outputPath);
        encryptedFiles++;
      }
    }
  });
  
  console.log(`Directory processed: ${inputDir}`);
  console.log(`Files encrypted: ${encryptedFiles}/${totalFiles}`);
}

// Komut satırı argümanlarını kontrol et
if (process.argv.length < 4) {
  console.log('Usage: node encrypt-images.js <input-directory> <output-directory>');
  process.exit(1);
}

// Komut satırı argümanlarını al
const inputDir = process.argv[2];
const outputDir = process.argv[3];

// Klasörün varlığını kontrol et
if (!fs.existsSync(inputDir)) {
  console.error(`Error: Input directory "${inputDir}" does not exist`);
  process.exit(1);
}

// Şifreleme işlemini başlat
console.log(`Starting encryption from "${inputDir}" to "${outputDir}"...`);
encryptDirectory(inputDir, outputDir);
console.log('Encryption completed!');