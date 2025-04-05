#!/usr/bin/env node
/**
 * generate-encryption-key.js - Güvenli bir şifreleme anahtarı oluştur
 * 
 * Bu script, RichBook uygulaması için güvenli bir şifreleme anahtarı oluşturur.
 * Anahtarı .env dosyasına veya ayrı bir anahtar dosyasına kaydetmek için kullanılabilir.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const readline = require('readline');

// Terminal arayüzü oluştur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Rastgele güvenli bir anahtar oluştur
function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Ana fonksiyon
async function main() {
  console.log('RichBook Güvenli Anahtar Üretici');
  console.log('=================================');
  
  const key = generateSecureKey();
  
  console.log(`\nÜretilen güvenli anahtar: ${key}`);
  console.log('\nBu anahtarı güvenli bir şekilde saklamanız gerekir.');
  
  const question = (query) => new Promise(resolve => rl.question(query, resolve));
  
  const saveOption = await question('\nAnahtarı kaydetmek istiyor musunuz? (E/h): ');
  
  if (saveOption.toLowerCase() !== 'h') {
    const saveMethod = await question('\nNereye kaydetmek istersiniz?\n1) .env dosyası\n2) Ayrı şifreleme anahtarı dosyası (.secret-key)\nSeçiminiz (1/2): ');
    
    if (saveMethod === '1') {
      // .env dosyasına kaydet
      const envPath = path.join(__dirname, '..', '.env');
      
      let envContent = '';
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
        
        // Varolan ENCRYPTION_SECRET_KEY'i güncelle
        if (envContent.includes('ENCRYPTION_SECRET_KEY=')) {
          envContent = envContent.replace(/ENCRYPTION_SECRET_KEY=.*/g, `ENCRYPTION_SECRET_KEY=${key}`);
        } else {
          // Yoksa ekle
          envContent += `\nENCRYPTION_SECRET_KEY=${key}\n`;
        }
      } else {
        // Yeni .env dosyası oluştur
        envContent = `# RichBook ortam değişkenleri\nENCRYPTION_SECRET_KEY=${key}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log(`\nAnahtar .env dosyasına kaydedildi: ${envPath}`);
      
    } else if (saveMethod === '2') {
      // Özel anahtar dosyasına kaydet
      const keyPath = path.join(__dirname, '..', '.secret-key');
      fs.writeFileSync(keyPath, key, { mode: 0o600 }); // Sadece sahibi okuyabilir/yazabilir
      console.log(`\nAnahtar dosyaya kaydedildi: ${keyPath}`);
      console.log('Dosya izinleri sadece sahibinin okumasına izin verecek şekilde ayarlandı.');
      
    } else {
      console.log('\nGeçersiz seçim. Anahtar kaydedilmedi.');
    }
  }
  
  console.log('\nBu anahtarı browserEncrypt.js modülünde ve şifreleme script\'lerinde kullanabilirsiniz.');
  console.log('❗ UYARI: Bu anahtarı herhangi bir versiyon kontrol sistemine (örn. Git) dahil etmeyin!');
  
  rl.close();
}

// Programı başlat
main().catch(error => {
  console.error('Hata:', error.message);
  process.exit(1);
});
