const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');

// Güvenli bir şekilde ana işlemden oluşturulan API'leri açığa çıkarın
contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => {
    return fs.readFileSync(path.resolve(filePath));
  },
  writeFile: (filePath, data) => {
    fs.writeFileSync(path.resolve(filePath), data);
  },
  // Diğer API'ler...
});