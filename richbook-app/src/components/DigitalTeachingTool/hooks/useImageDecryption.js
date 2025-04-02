// src/components/DigitalTeachingTool/hooks/useImageDecryption.js
import { useState, useEffect } from 'react';
import { decryptMultipleImages } from '../../../utils/browserEncrypt';

/**
 * Şifrelenmiş görüntülerin çözülmesini yönetir
 */
const useImageDecryption = () => {
  const [pages, setPages] = useState([]);
  const [decryptedImages, setDecryptedImages] = useState({});
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  
  useEffect(() => {
    // Şifrelenmiş kitap sayfaları
    // .ifp uzantılı dosyaları kullanacak şekilde güncellendi
    const encryptedBookPages = [
      { id: 1, src: 'encrypted/page1.ifp' },
      { id: 2, src: 'encrypted/page2.ifp' },
      { id: 3, src: 'encrypted/page3.ifp' },
      { id: 4, src: 'encrypted/page4.ifp' },
      { id: 5, src: 'encrypted/page5.ifp' },
      { id: 6, src: 'encrypted/page6.ifp' },
      // Diğer sayfaları burada ekleyin
    ];
    
    setPages(encryptedBookPages);
    
    // Görüntülerin şifresini çöz
    const decryptPages = async () => {
      setIsLoadingImages(true);
      
      try {
        // Tüm sayfaların şifresini paralel olarak çöz
        const decryptedUrls = await decryptMultipleImages(encryptedBookPages);
        setDecryptedImages(decryptedUrls);
      } catch (error) {
        console.error('Görüntü şifrelerini çözme hatası:', error);
      } finally {
        setIsLoadingImages(false);
      }
    };
    
    decryptPages();
  }, []);
  
  return {
    pages,
    decryptedImages,
    isLoadingImages
  };
};

export default useImageDecryption;