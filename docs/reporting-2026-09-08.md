# Rapor Merkezi ve tahsilat takvimi

Rapor ekranı altı hazır soru ve üç adımlı rapor oluşturma akışıyla yenilendi. Hesaplamalar, `js/reporting.js` içinde DOM ve veritabanından bağımsız tutuluyor; ekran stilleri `css/reports.css` içinde sınırlı kapsamda uygulanıyor.

Mevcut `customReports` belgeleri okunmaya devam eder. Yeni veya güncellenen raporlar mevcut yapıdaki alanlara ek olarak `reportViewV2` içinde filtrelerini saklar. Gösterge paneli bu filtreleri aynı hesaplama motoruyla uygular. Farklı para/birim içeren panel raporlarında tek ölçekli grafik yerine karşılaştırma tablosu kullanılır. Veri göçü gerekmez.

Finans grafiği mevcut `financeLedger` koleksiyonunu okur. `collectionDate` alanı yalnız kullanıcı tahsilat veya tarih düzeltme işlemi yaptığında yazılır. Eski kayıtların `dueDate`, `eventDate` veya `updatedAt` alanları gerçek tahsilat tarihi varsayılmaz. Plan ve iptal işlemleri aktif `collectionDate` alanını temizler.

`DB.getAll` ve `DB.getDoc` yardımcıları isteğe bağlı `{throwOnError:true}` destekler. Yeni ekranlar böylece okuma hatalarını boş sonuçlardan ayırır. Diğer çağrıların mevcut dönüş davranışı korunur.

## Doğrulama

- `node scripts/check-main.cjs`: uygulama sınırları ve belge yardımcıları geçti.
- `node --test scripts/check-reporting.cjs`: 15 test geçti; tarih sınırları, ağırlıklı oranlar, birleşik filtreler, para/birim ayrımı, tüm kayıtların toplamları, CSV kaçışları ve gerçek/beklenen tahsilat ayrımı dahil. CI işine eklendi.
- Edge/Playwright ile 33 mevcut bileşenin boş test verisiyle açılışı geçti.
- Gerçek tarayıcıda örnek kayıtlarla Türkçe arama + tezgah filtresi, gruptan ayrıntı açma, sayfalama, hatalı tarihler, yükleme hatası, başarısız kayıtta formun korunması, başarılı kayıt ve panele ekleme kontrol edildi.
- Yazdırma önizlemesinde 42 üretim kaydı ve firma logosu doğrulandı; A4 PDF üretildi. CSV'de filtrelenmiş 30 kaydın tamamı doğrulandı.
- Finans grafiğinde vade/gerçek tahsilat ayrımı, eksik tarih bildirimi, sütundan kayıt açma, eski tarihin düzeltilmesi ve yeni tahsilatın grafiğe yansıması kontrol edildi.
- 1440 px masaüstü ve 390 px telefon genişliğinde görüntüler incelendi. Koyu tema, eski raporun açılması ve pencerenin Escape ile kapanması kontrol edildi. Tablolar kendi alanlarında yatay kayar; sayfa genişliği taşmaz.

Tarayıcı kontrolleri sahte DB ile yapıldı; canlı Firebase kaydı değiştirilmedi. Gerçek verinin eksik tarih veya para birimi bilgileri kaynak ekranlardan tamamlanmalıdır. Bu raporlar mevcut koleksiyonları topluca okur; çok büyük veri hacimleri için sunucuda dönemsel özetleme ayrı bir çalışma gerektirir.
