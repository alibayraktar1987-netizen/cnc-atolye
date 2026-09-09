# Kalite evraklarının proje kayıtlarıyla ilişkisi

09.09.2026 — 15 kaynak dosyadan 63 form ve kayıt çizelgesi sisteme bağlandı. Önceden eklenen GT-01–GT-10 personel görevlendirmesi ayrıca kullanılmaya devam eder.

## Kullanım

İlgili modüldeki **Kalite Evrakları → Yeni Evrak** bölümünde evrak türünü ve bağlanacak mevcut kaydı seçin. **Kaydı Bağla ve Formu Doldur** ile bilinen bilgiler aktarılır. Eksik alanlar ve tablo satırları tamamlandıktan sonra evrak kaydedilir. **Formu Yazdır** veya **Baskı Önizleme** ile A4 çıktı/PDF alınır.

Kayıtlar, formların kullanıldığı diğer modüllerde de görünür. Aynı iş emri veya ortak kaynak kayıt üzerinden ilişkili evraklar **Bağlı evraklar / sertifika kayıtları** alanından seçilebilir. Bağlı evrakın kimliği ve revizyonu çıktı üzerinde yer alır. Örneğin CoC hazırlanırken aynı iş emrine bağlı ölçüm raporu seçilebilir.

**Yeni Revizyon**, önceki evrakın alanlarını ve kaynak şablonunu koruyarak yeni kayıt oluşturur. Önceki sürüm silinmez ve yeniden yazdırılabilir. Kaydetmek, elektronik onay veya imzalı tebliğ işlemi değildir; çıktı kaynak belgedeki imza alanlarını taşır. Orijinal malzeme/proses sertifikasının kendisi yerine inceleme kaydı üretilir.

## Ekranlara dağılım

| Ekran | Bağlanan evraklar |
| --- | --- |
| İş emirleri / planlama | Rota kartı, operasyonel risk, konfigürasyon, setup, kontrol planı, FAI kontrol listesi; iş emrinde ölçüm ve CoC |
| Kalite / izlenebilirlik | Malzeme sertifikası inceleme, ilk parça, proses içi ölçüm, son kontrol, özel proses, FAI ve ölçüm raporu |
| Satış / müşteri / teklif | Sözleşme gözden geçirme, karşılıklı NDA; satışta CoC |
| Satın alma / tedarikçi | İlk değerlendirme, performans, giriş kontrol, malzeme ve özel proses sertifikası kayıtları; tedarikçide NDA |
| Depo / malzeme | Malzeme sertifikası inceleme; depoda tedarik/giriş kontrol formları |
| Ölçüm / takım | Ölçüm raporu, kalibrasyon ve MSA; takım/cihaz kaydı bağlantısı |
| Tezgâh / üretim kayıtları | Vardiya üretim, makine günlük kontrol, devir teslim, günlük saha özeti, 5S/FOD/güvenlik |
| Bakım / tezgâh ayarları | Günlük kontrol ve bakım/arıza kayıtları |
| Personel / görevlendirme | Yetkinlik, eğitim, erişim formları; personel yönetim yetkisiyle gizlilik taahhütnamesi ve iş sözleşmesi |
| QMS / EYDEP | Doküman değişikliği, risk, değişiklik yönetimi, YGG, tetkik, DÖF, yetkinlik; kaynak Excel'deki kayıt matrisleri |
| NCR / MRB / CAPA | DÖF/8D ve uygunsuz ürün/MRB formları |
| Tesis güvenliği | Ziyaretçi, zimmet, erişim, medya, ihlal, imha, süreklilik ve 5S/FOD |

63 şablonun dağılımı: Form Şablonları Kitabı'ndan 36 form; 07–09'dan 3 sözleşme/taahhütname; 10/12/13'ten 3 sertifika/kontrol şablonu; 06'dan 15 kayıt matrisi; 11'den ölçüm raporu; 14/15'ten 5 ortak saha formu.

**Kaynak Dokümanlar** bölümünde ilk beş kitabın metin ve tabloları okunabilir. Diğer kaynakların kullanılabilir şablonları ve bağlı ekranları listelenir. Doldurulmuş örnekler canlı kayda aktarılmaz. Word/Excel/PDF orijinalleri değiştirilmedi; ham klasörün tamamı herkese açık dosya yolu olarak yayınlanmadı.

## Ölçüm ve veri eşleştirme

- FAI veya OCR çalışması seçilince kaydedilmiş balon numarası, nominal, alt/üst sapma, birim ve tolerans dayanağı aktarılır. OCR tekrar çalıştırılmaz.
- Nominale işaretli sapmalar eklenir. `8 ±0,1` → alt limit `7,9`, üst limit `8,1`.
- Boş nominal/tolerans/birim, geçersiz sayısal ölçüm, eksik veya belirtilen sayıdan farklı numune varsa sonuç **EKSİK** olur. Sıfır tolerans boş hücreden ayrıdır.
- Nitel/görsel/mastar kontrolü ayrı sonuç alanı kullanır; sayısal ölçüm formülü elle ezilmez.
- Muayene → iz kaydı → iş emri → satış siparişi → müşteri bağlantıları mevcut kimliklerden çözülür. Eksik bağlı kayıt hata verir.
- Üretim kayıtlarının mevcut `jobCode` alanı iş emri koduyla eşlenir; mükerrer kodda tahmin yapılmaz. `correct`/`wrong` değerleri uygun/hurda alanlarına gider.
- Depo lotu ile ısı/şarj numarası aynı kabul edilmez. Kaynak kayıtta ısı numarası yoksa alan boş kalır; kullanıcı tamamlar.
- Satış/üretim hedefi teslim edilmiş miktar olarak varsayılmaz. Onay, kabul, sevkiyat miktarı ve sertifika kararları kullanıcı doğrulaması gerektiren alanlardır.

## Uygulama ve sınırlar

Şablon üretimi: `scripts/build-quality-catalog.py`. DOCX/XLSX kaynakları Python standart kütüphanesiyle okunur; tarayıcıda dönüşüm bağımlılığı yoktur. Kaynak güncellendiğinde katalog bilinçli olarak yeniden üretilmelidir. 14/15 saha formları ve 11 ölçüm tablosu `js/quality-documents.js` içinde modellenmiştir.

`qualityFormRecords` koleksiyonu şablon ve alanların anlık kopyasını, kaynak kimliklerini, bağlantıları, oluşturucuyu ve revizyon zincirini tutar. Kayıt sonrasında şablon değişmesi eski çıktıyı değiştirmez. Bu entegrasyon mevcut üretim/depo kayıtlarını veya kullanıcı erişim rollerini dönüştürmez; yeni evraklar onlarla ilişkilidir.

Bu çalışma belge üretme/kaydetme/basım akışını kapsar. Elektronik imza, imzalı dosya yükleme, sunucuda yeni yetkilendirme politikaları, otomatik saklama/imha süreleri veya tam AS9102 onay süreci eklenmedi. Canlı Firestore'da işlem ve GitHub/Render yayını yapılmadı. Sunucu kuralları bu incelemede doğrulanmadı; testler sahte veritabanıyla yapıldı.

## Doğrulama ve örnekler

- `node --test scripts/check-quality-documents.cjs`: kaynak kapsamı, örnek veri temizliği, alan aktarımı, ölçüm sınırları, eksik/yanlış numune, bağlantı hataları, revizyon ve güvenli HTML.
- `node scripts/check-main.cjs`: uygulama ortak kontrolleri.
- `node scripts/check-quality-documents-ui.cjs`: React/Babel ve Playwright bağımlılıkları ile Edge üzerinde kayıt, hata, revizyon, OCR, malzeme, CoC, taahhütname, kaynak görüntüleme ve PDF. Çıktılar geçici klasöre yazılır; istenirse `CNC_AUDIT_OUTPUT` ile yer belirtilir.
- Mevcut FAI, kalite, personel, tezgâh geçişi ve depo testleriyle birlikte 44 test geçti. Tezgâh ekranı altı ekran boyutunda yatay taşma ve dokunmatik kontroller açısından doğrulandı.

Örnek verilerle oluşturulmuş çıktılar: [Ölçüm raporu](samples/olcum-raporu-ornek.pdf), [CoC](samples/coc-ornek.pdf), [Malzeme kabul](samples/malzeme-kabul-ornek.pdf). Bunlar imzalı gerçek kalite kayıtları değildir; ölçüm örneği uygunsuz sonuç senaryosunu da gösterir.
