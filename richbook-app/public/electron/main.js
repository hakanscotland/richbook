const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const fs = require('fs');

// Ortam değişkenlerini yükle
require('dotenv').config();

// Güvenlik: Şifreleme anahtarının çalışma zamanında oluşturulması veya yüklenmesi
const SECURE_STORAGE_PATH = path.join(app.getPath('userData'), '.secure');
let encryptionKey;

// Uygulama başlangıcında anahtarı yükle veya oluştur
function loadOrGenerateEncryptionKey() {
  try {
    // userData klasöründe gizli bir dosya olarak saklama
    if (!fs.existsSync(SECURE_STORAGE_PATH)) {
      fs.mkdirSync(SECURE_STORAGE_PATH, { recursive: true });
    }
    
    const keyPath = path.join(SECURE_STORAGE_PATH, '.key');
    
    if (fs.existsSync(keyPath)) {
      // Var olan anahtarı oku
      encryptionKey = fs.readFileSync(keyPath, 'utf8');
    } else {
      // Ortam değişkeninden al veya yeni anahtar oluştur
      encryptionKey = process.env.ENCRYPTION_SECRET_KEY || generateSecureKey();
      // Anahtarı kaydet
      fs.writeFileSync(keyPath, encryptionKey, { mode: 0o600 }); // Sadece sahibi okuyabilir
    }
    
    // Anahtarı global olarak erişilebilir yap
    global.encryptionKey = encryptionKey;
    return encryptionKey;
  } catch (error) {
    console.error('Encryption key handling error:', error);
    // Acil durum için varsayılan anahtar
    return process.env.ENCRYPTION_SECRET_KEY || 'Fallback_' + Date.now();
  }
}

// Güvenli anahtar üretimi
function generateSecureKey() {
  const crypto = require('crypto');
  // 32 byte (256-bit) rastgele bir anahtar oluştur
  return crypto.randomBytes(32).toString('hex');
}

// Geliştirme mi yoksa paketlenmiş mod mu kontrol et
const resourcesPath = process.env.NODE_ENV === 'development'
  ? 'resources' // Geliştirme modunda
  : path.join(process.resourcesPath, 'encrypted'); // Paketlenmiş modda
  
let mainWindow;

function createWindow() {
  // Şifreleme anahtarını yükle veya oluştur
  const key = loadOrGenerateEncryptionKey();
  
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true, // Güvenlik için true olmalı
      enableRemoteModule: false, // Güvenlik için false olmalı
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  
  // Şifreleme anahtarını preload scriptine aktar (güvenli bir şekilde)

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '../build/index.html')}`
  );

  // Geliştirme aracını açmak için (opsiyonel)
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

