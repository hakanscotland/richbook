// encrypt-pages.js - Kitap sayfalarını şifreleme betiği
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// Şifreleme için kullanılacak anahtar - browserEncrypt.js ile aynı anahtar kullanılmalı
const SECRET_KEY = "Sm464436!"; // This key must match the one in browserEncrypt.js

/**
 * Base64 formatında bir görüntüyü şifreler
 * @param {string} base64Image - Şifrelenecek base64 formatındaki görüntü
 * @returns {string} - Şifrelenmiş görüntü
 */
function encryptImage(base64Image) {
  if (!base64Image) return null;
  
  // Base64 başlığını ayrıştır (örn: "data:image/jpeg;base64,")
  const [header, base64Data] = base64Image.split(",");
  
  // Şifreleme işlemi
  let encryptedData = "";
  for (let i = 0; i < base64Data.length; i++) {
    // Her karakteri SECRET_KEY'in bir karakteri ile XOR işlemine tabi tut
    const keyChar = SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    const dataChar = base64Data.charCodeAt(i);
    const encryptedChar = String.fromCharCode(dataChar ^ keyChar);
    encryptedData += encryptedChar;
  }
  
  // Şifrelenmiş veriyi Base64'e dönüştür
  const encryptedBase64 = Buffer.from(encryptedData).toString('base64');
  
  // Header ile birleştir, ancak "encrypted" ifadesini ekle
  return `${header.replace("base64", "encrypted")},${encryptedBase64}`;
}

/**
 * Bir dosyadaki görüntüyü şifreler ve kaydeder
 * @param {string} inputPath - Şifrelenecek görüntünün dosya yolu
 * @param {string} outputPath - Şifrelenmiş görüntünün kaydedileceği dosya yolu
 */
async function encryptImageFile(inputPath, outputPath) {
  try {
    // Görüntüyü yükle
    const image = await loadImage(inputPath);
    
    // Canvas'a çiz
    const canvas = createCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0);
    
    // Base64'e dönüştür
    const base64Image = canvas.toDataURL('image/jpeg');
    
    // Şifrele
    const encryptedImage = encryptImage(base64Image);
    
    // Şifrelenmiş veriyi dosyaya kaydet
    fs.writeFileSync(outputPath, encryptedImage);
    
    console.log(`Şifrelendi: ${outputPath}`);
  } catch (error) {
    console.error(`Hata: ${inputPath} şifrelenirken hata oluştu:`, error);
  }
}

/**
 * Bir klasördeki tüm görüntüleri toplu olarak şifreler
 * @param {string} inputDir - Şifrelenecek görüntülerin bulunduğu klasör
 * @param {string} outputDir - Şifrelenmiş görüntülerin kaydedileceği klasör
 * @param {string} fileExtension - Şifrelenecek dosya uzantısı (varsayılan: jpg)
 */
async function bulkEncryptImages(inputDir, outputDir, fileExtension = 'jpg') {
  // Çıktı klasörünün varlığını kontrol et, yoksa oluştur
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Girdi klasöründeki dosyaları oku
  const files = fs.readdirSync(inputDir);
  
  // Belirtilen uzantıya sahip dosyaları filtrele
  const imageFiles = files.filter(file => path.extname(file).toLowerCase() === `.${fileExtension}`);
  
  console.log(`${imageFiles.length} adet ${fileExtension} dosyası şifrelenecek...`);
  
  // Her dosyayı şifrele
  for (const file of imageFiles) {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    await encryptImageFile(inputPath, outputPath);
  }
  
  console.log('Şifreleme işlemi tamamlandı!');
}

// Ana program
// Komut satırı parametrelerini kontrol et
if (process.argv.length < 4) {
  console.log('Kullanım: node encrypt-pages.js <inputDir> <outputDir> [fileExtension]');
  process.exit(1);
}

const inputDir = process.argv[2];
const outputDir = process.argv[3];
const fileExtension = process.argv[4] || 'jpg';

// Dosyaları şifrele
bulkEncryptImages(inputDir, outputDir, fileExtension)
  .then(() => {
    console.log('İşlem başarıyla tamamlandı.');
  })
  .catch(error => {
    console.error('Hata:', error);
  });