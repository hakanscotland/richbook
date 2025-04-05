const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ana işlemden şifreleme anahtarını al
const encryptionKey = global.encryptionKey;

// Güvenli bir şekilde ana işlemden oluşturulan API'leri açığa çıkarın
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => {
    return fs.readFileSync(path.resolve(filePath));
  },
  writeFile: (filePath, data) => {
    fs.writeFileSync(path.resolve(filePath), data);
  },
  // Güvenli şifreleme API'leri
  encryption: {
    // Güvenli XOR yöntemi ile veri şifreleme/çözme
    xorEncryptData: (data) => {
      if (!encryptionKey) {
        throw new Error('Encryption key not available');
      }
      // Anahtarı crypto modulu ile kullanarak daha güvenli şifreleme yap
      const cipher = crypto.createCipheriv('aes-256-cbc', 
                     Buffer.from(encryptionKey.slice(0, 32)), 
                     Buffer.from(encryptionKey.slice(0, 16)));
      let encrypted = cipher.update(data);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return encrypted;
    },
    // Güvenli XOR yöntemi ile veri çözme
    xorDecryptData: (data) => {
      if (!encryptionKey) {
        throw new Error('Encryption key not available');
      }
      
      // Basit XOR şifresini çözmek için - geriye dönük uyumluluk
      if (typeof data === 'object' && data.length > 0) {
        try {
          const simpleKey = "Sm464436!";
          const result = Buffer.alloc(data.length);
          const keyLen = simpleKey.length;
          
          for (let i = 0; i < data.length; i++) {
            // Her baytı anahtarın bir karakteri ile XOR işlemine tabi tut
            const keyChar = simpleKey.charCodeAt(i % keyLen);
            result[i] = data[i] ^ keyChar;
          }
          
          return result;
        } catch (xorError) {
          console.error('XOR decryption failed:', xorError);
        }
      }
      
      // AES şifresini çözmek için
      try {
        const decipher = crypto.createDecipheriv('aes-256-cbc', 
                        Buffer.from(encryptionKey.slice(0, 32)), 
                        Buffer.from(encryptionKey.slice(0, 16)));
        let decrypted = decipher.update(Buffer.from(data));
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted;
      } catch (aesError) {
        console.error('AES decryption failed:', aesError);
        throw new Error('Decryption failed');
      }
    },
    // Şifreleme anahtarını al
    getEncryptionKey: () => {
      return encryptionKey || "Sm464436!";
    }
  },
  path: path,
  getResourcePath: () => resourcesPath
});