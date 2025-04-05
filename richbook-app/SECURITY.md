# Güvenlik Rehberi

Bu belge, Richbook uygulamasında şifreleme anahtarı yönetimi ve güvenliği ile ilgili bilgiler içerir.

## Şifreleme Anahtarı Yapılandırması

Richbook uygulaması, içerik şifreleme ve çözme için güvenli bir anahtar kullanır. Bu anahtarın doğru şekilde yapılandırılması gerekir.

### Güvenli Anahtar Oluşturma

Güvenli bir şifreleme anahtarı oluşturmak için, sağladığımız yardımcı scripti kullanabilirsiniz:

```bash
node scripts/generate-encryption-key.js
```

Bu script, güvenli bir rastgele anahtar oluşturacak ve isteğe bağlı olarak `.env` dosyasına veya `.secret-key` dosyasına kaydedecektir.

### Yapılandırma Seçenekleri

Richbook'ta şifreleme için iki farklı yapılandırma yöntemi bulunmaktadır:

1. **Ortam Değişkenleri Kullanımı**:
   ```
   # .env dosyası içeriği
   ENCRYPTION_SECRET_KEY=your_secure_key_here
   ENCRYPTION_METHOD=aes    # veya 'xor' (geriye dönük uyumluluk için)
   ```

2. **Ayrı Anahtar Dosyası Kullanımı**:
   - `.secret-key` adlı bir dosya oluşturun ve içine sadece anahtarınızı yazın
   - Bu dosyanın izinlerini sadece gerekli kullanıcılar okuyabilecek şekilde ayarlayın

### Şifreleme Yöntemleri

Richbook iki farklı şifreleme yöntemi sunar:

- **AES-256-CBC**: Daha güvenli, endüstri standardı şifreleme (önerilen)
- **XOR**: Basit şifreleme, geriye dönük uyumluluk için

Yöntemi `.env` dosyasında `ENCRYPTION_METHOD` değişkeni ile belirleyebilirsiniz.

## Uygulama Güvenlik Özellikleri

### Electron Uygulaması

- Anahtarlar kullanıcıya özel veri dizininde güvenli şekilde saklanır
- Contextual isolation ve diğer Electron güvenlik özellikleri etkinleştirilmiştir
- Her kullanıcı için benzersiz şifreleme anahtarları kullanılabilir

### Web Tarayıcı Uygulaması

- Web Crypto API ile güvenli rastgele anahtarlar üretilir
- Oturum tabanlı, tarayıcıya özgü anahtarlar kullanır
- Kullanıcıya özel şifreleme uygulanır

## İçerik Şifreleme Betiği Kullanımı

Kitap içeriğini şifrelemek için şu komutları kullanabilirsiniz:

```bash
# Resimleri şifrelemek için
node scripts/encrypt-images.js <resim-klasörü> <çıktı-klasörü>

# Sayfaları şifrelemek için
node scripts/encrypt-pages.js <sayfa-klasörü> <çıktı-klasörü>
```

## Güvenlik Önlemleri

1. **Anahtarları Asla Paylaşmayın**: Şifreleme anahtarlarınızı asla sürüm kontrol sistemine (Git gibi) dahil etmeyin
2. **Düzenli Yedekleme**: Şifreleme anahtarlarınızı güvenli bir şekilde yedekleyin, ancak anahtarı kaybetme durumunda şifreli içerikleriniz erişilemez hale gelebilir
3. **Minimum Yetki İlkesi**: Şifreleme anahtarlarına erişimi yalnızca ihtiyacı olan kişilerle sınırlayın
4. **Periyodik Anahtar Rotasyonu**: Üretim ortamlarında anahtarları periyodik olarak değiştirmeyi düşünün

## Güvenlikle İlgili Sorunlar

Güvenlikle ilgili sorunları bildirmek için lütfen iletişime geçin: [güvenlik iletişim e-posta]