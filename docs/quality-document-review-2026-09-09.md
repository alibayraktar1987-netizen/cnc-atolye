# Kalite dokümanları — ilk inceleme

Tarih: 09.09.2026. Kaynak: `qualityDocument/` içindeki 15 dosya (11 DOCX, 3 XLSX, 1 PDF).

## Sonuç ve kapsam

Belgeler uygulamadaki kalite, üretim, bakım ve uyum süreçlerine bağlanabilecek bir temel oluşturuyor. Önce ölçüm hesaplarının veri doğrulaması, doküman/revizyon envanteri ve kayıt yaşam döngüsü ele alınmalı. Dosyaları yalnızca menülere indirme bağlantısı olarak eklemek bu ihtiyaçları karşılamaz.

Bu aşama kullanıcının “önce incele” talebidir. Orijinal dosyalar, uygulama davranışı ve canlı kayıtlar değiştirilmedi. DOCX metinleri/tablo içerikleri, XLSX hücreleri/formülleri ve PDF'nin beş sayfasının metni incelendi. PDF'nin 1. ve 5. sayfaları ayrıca görsel olarak kontrol edildi. Word/Excel baskı önizlemesi ve Excel motoruyla yeniden hesaplama yapılmadı. Bu rapor standart uygunluk belgesi veya hukuki değerlendirme değildir.

## Dosyaların önerilen yerleri

Numaralar kaynak dosya adlarının başlangıcıdır. Aşağıdaki yerleşimler öneridir; henüz sisteme aktarılmadı.

| Dosya | Uygulamada önerilen yer | Yapılacak düzenleme / bağlantı |
| --- | --- | --- |
| 01 Entegre Yönetim Sistemi El Kitabı | QMS ve Doküman Yönetimi | EYS-EK-01 ana dokümanı; onaylı sürüm ve revizyon geçmişi |
| 02 Prosedürler Kitabı | QMS ve Doküman Yönetimi | Kitap ve içindeki prosedürler arasında kodla erişim; her sürece ilgili prosedür bağlantısı |
| 03 İş Talimatları ve Görev Tanımları | QMS; tezgâh, kalite, depo, bakım ekranları | İlgili iş talimatına bağlamdan erişim; görev tanımlarını rol bazında eşleme |
| 04 Form Şablonları Kitabı | QMS şablon kütüphanesi ve ilgili kayıt ekranları | Form kodlarını ayrı envanterleme; daha yeni 10–15 numaralı belgelerle ilişki kurma |
| 05 EYDEP ve Tesis Güvenliği Rehberi | EYDEP / Tesis Güvenliği | Rehberi kanıt ve aksiyon kayıtlarıyla ilişkilendirme |
| 06 Yönetim Sistemi Kayıtları ve Matrisler | QMS, kalibrasyon, eğitim, tedarikçi, DÖF, güvenlik ve raporlar | 15 sayfayı ilgili kayıt türlerine eşleme; örnek verileri gerçek kayıt olarak aktarmama |
| 07 Çalışan Gizlilik Taahhütnamesi | Yetkili personel/İK alanı | Boş şablon ile imzalı personel nüshalarını ayırma; personel bazında erişim |
| 08 Karşılıklı NDA | Müşteri / tedarikçi sözleşme kayıtları | Taraf, kapsam, tarih ve imzalı sürümle ilişkilendirme |
| 09 İş Sözleşmesi ve Ekleri | Yetkili personel/İK alanı | Yer tutucuları tamamlama; eklerin ayrı belge bağlantılarını kurma |
| 10 Uygunluk Sertifikası (CoC) | Nihai kalite onayı ve sevkiyat / sipariş | FR-QUA-18; örnek ve üretimde kullanılacak boş şablonu ayırma; iş emri, lot ve kontrol raporu bağlantısı |
| 11 Ölçüm ve Nihai Kontrol Raporu | Kalite kontrol ve FAI karakteristikleri | FR-QUA-21; balon, nominal, işaretli tolerans, limit, numune ölçümleri ve cihaz bağlantısı; hesap doğrulamasını düzeltme |
| 12 Malzeme Sertifikası İnceleme Kaydı | Malzeme kabul, depo ve izlenebilirlik | FR-QUA-19; orijinal sertifika, malzeme ve ısı/lot numarası bağlantısı |
| 13 Özel Proses Sertifikası ve Doğrulama Kaydı | Dış proses / tedarikçi ve kalite kabul | FR-QUA-20; proses sağlayıcısı, orijinal sertifika, iş emri ve lot bağlantısı |
| 14 Günlük ve Vardiya Çizelgeleri | Tezgâh, bakım, vardiya devir teslim ve üretim raporları | Makine ve vardiyaları uygulama ayarlarından alma; Excel özetlerinin kapsamını düzeltme |
| 15 Tezgâh Yanı Basılı Form Seti | Tezgâh ekranındaki yazdırılabilir formlar | Üretim, günlük bakım, devir teslim, günlük özet ve 5S/FOD formları; dijital kayıtla ortak alanlar |

## Öncelikli bulgular

### 1. Ölçüm Excel'inde yanlış uygunluk kararı riski

Kaynak: 11 numaralı dosya, `Boş Şablon`, G9:H9 ve O9:Q9; aynı yapı sonraki satırlarda da var.

- Limitler `D9+E9` ve `D9+F9` ile hesaplanıyor; nominal ve toleransların sayısal ve eksiksiz girildiği doğrulanmıyor. Boş tolerans sıfır gibi işlenebiliyor.
- Ölçüm varlığı `COUNTA(J9:N9)` ile kontrol ediliyor, fakat `MIN`/`MAX` hücrelerdeki metni yok sayıyor. D/E/F boşken J hücresine metin girilmesi, sıfır limit ve sıfır min/maks üzerinden “UYGUN” üretebilen bir karşı örnek. Sayısal ölçümlere karışan metinler de karar dışında kalabiliyor.
- Beklenen numune sayısının tamamlanması sonuç için zorunlu tutulmuyor.
- Kullanım kılavuzu diş/görsel özelliklerde sonuç hücresine elle yazılmasını istiyor. Sayısal sonuç formülü ile nitel kontrol sonucu ayrı alanlarda tutulmalı; elle giriş formülü ezmemeli.

Önerilen davranış: Tamamen boş satır sonuç üretmemeli. Eksik nominal/tolerans, geçersiz ölçüm veya tamamlanmamış zorunlu numune “EKSİK / KONTROL GEREKLİ” olmalı. Sayısal karakteristik ve nitel karakteristik ayrı değerlendirilmelidir. Sıfır tolerans geçerli bir girdidir; boş toleransla aynı kabul edilmemelidir.

İşaretli tolerans hesabı doğru yöndedir: `8 ±0,1` için alt sapma `-0,1`, üst sapma `+0,1`, alt limit `7,9`, üst limit `8,1`. Entegrasyonda bu alanlar ayrı korunmalıdır. Bu örnek standart kapsamının doğrulandığı anlamına gelmez. Belgenin kendi açıklaması da bu raporun tek başına tam bir müşteri FAI/AS9102 form seti olmadığını belirtir.

### 2. Ana doküman listesi ve revizyonlar tamamlanmalı

06 numaralı dosyanın `Ana Dokuman` sayfası ilk beş kitabı ve prosedürleri listeliyor. 07–15 belgeleri, FR-QUA-18/19/20/21 formları ve kitapların içindeki bağımsız talimat/formlar tam envanterlenmemiş. Prosedür adları çoğunlukla “Bkz. Prosedürler Kitabı”, sahipleri “İlgili süreç sahibi” şeklinde genel bırakılmış.

KLT-FR ve FR-QUA kodları birlikte kullanılıyor. Bunlar doğrudan aynı belge varsayılıp yeniden adlandırılmamalı; hangi formun hangi kaydı karşıladığı belirlenmeli. 14/15 belgelerinde Rev.01 varken ana envanterdeki Rev.00 kayıtlarıyla sürüm ilişkisi kurulmalı. PDF, OPS-FR-07/A–D ve BAK-FR-01/A alt kodlarını kullanıyor.

Mevcut QMS ekranı genel kayıt, durum, açıklama, referans ve kanıt alanları sağlıyor; dosya sürümleri, gerçek doküman kodu, yürürlük tarihi, onaylayan kişi ve dağıtım ilişkisini eksiksiz karşılamıyor. Uygulamadaki her düzenlemede artan kayıt revizyonu, belgedeki “Rev.00” ile aynı kavram olarak kullanılmamalı. Excel'deki “Yürürlükte” etiketi tek başına onay kanıtı sayılıp otomatik yayın yapılmamalı.

### 3. Hatalı kayıt silme ile saklama kuralları arasında uyumsuzluk var

02 EYS-PR02 kayıt geçmişinin ve onay izinin korunmasını istiyor. 06 `Kayit Saklama` sayfasında üretim/ölçüm/FAI ve sertifika kayıtları için teslimattan sonra 15 yıl; uygunsuzluk/DÖF için kapanıştan sonra 15 yıl gibi süreler tanımlanmış.

`js/quality-records.js` içindeki mevcut işlem, bağımlılık kontrolünden sonra asıl kaydı veritabanından siliyor. Ayrı işlem günlüğü tutmak, asıl kaydın saklanmasıyla aynı değildir.

Öneri: Hatalı girişleri kullanıcı açısından kaldırılabilir tutarken gerekçeli iptal/arşiv ve düzeltme sürümleri eklemek; varsayılan listelerde iptal kayıtlarını gizlemek, yetkili geçmiş görünümünde korumak. Kullanıcının daha önce istediği silme davranışı bu incelemede değiştirilmedi. Belgelerde yazan sürelerin sisteme uygulanması ayrıca kayıt türü ve müşteri şartıyla eşlenmeli.

### 4. Vardiya ve makine kaynakları birleştirilmeli

14 `Tanımlar`: 07:00–15:00, 15:00–23:15, 23:00–07:00. 23:00–23:15 çakışması belgede devir teslim için özellikle açıklanmış; yazım hatası olarak düzeltilmemeli.

Uygulamanın varsayılanları 06:00–14:00, 14:00–22:00, 22:00–06:00 (`index.html`, SHIFTS). Canlı sistemde kullanıcı ayarları farklı olabilir; bu incelemede canlı ayarlar okunmadı. Belgedeki STAR-SR32-01 gibi makine kodları da uygulamadaki tezgâh kimlikleriyle eşlenmeli, yeni mükerrer makineler oluşturulmamalı.

14 `Günlük Özet` formülleri üretim sayfasının 5–124 satırlarına bağlı. Bu aralığın dışına yazılan kayıtlar özete girmeyebilir. Plan sıfırken “KAYIT YOK” sonucu üretim girilmiş olsa da görünebiliyor. Aynı iş emrinin toplam planı her vardiya satırına tekrar yazılırsa plan toplamı şişebilir. Dijital rapor, vardiya planı ile iş emri toplam hedefini ayrı tutmalı; yeni makineleri ayarlardan almalı.

### 5. Örnekler, şablonlar ve gerçek kayıtlar ayrılmalı

10–13 dosyaları doldurulmuş örnekleri ve boş şablonları birlikte içeriyor. Örnekler açıkça etiketlenmiş; hata değildir. Ancak otomatik doldurma/aktarımda örnek müşteri, lot, rapor numarası veya “UYGUN” kararının yeni kayda taşınması önlenmeli.

12 numaralı belge orijinal malzeme sertifikasının yerine geçmiyor. 13 numaralı doğrulama kaydı da dış proses sağlayıcısının sertifikasıyla birlikte saklanmalı. CoC, ölçüm raporu, malzeme ve proses sertifikaları aynı iş emri/lot üzerinden ilişkilendirilmeli.

07–09 içinde taraf, personel, adres vb. yer tutucular bulunuyor. İmzalı nüshalar ayrı tutulmalı. 09'un ek listesinde yer alan belgelerin bir kısmı ayrı dosyaya veya ayrıca düzenlenecek kayda referans veriyor; ek bağlantıları tamamlanmadan eksiksiz sözleşme paketi olarak sunulmamalı.

### 6. Yayınlama ve basılı görünüm

Dockerfile uygulamanın HTML, CSS ve JS dosyalarını kopyalıyor; `qualityDocument/` klasörünü yayınlanan imaja eklemiyor. Dosyaların klasöre konması mevcut ekranda erişim sağlamaz. Belge erişimi, sürüm bilgisi ve yetkili dosya saklama tasarlanmalı; personel, sözleşme ve güvenlik belgeleri topluca herkese açık statik bağlantılara dönüştürülmemeli.

PDF'nin incelenen 1. ve 5. sayfalarında başlık, renk ve tablo dili tutarlı. Ancak 1. sayfanın “Vardiya Toplamları” kutusunda “Duruş” giriş çizgisi sağ sınırı aşıyor; metinler kutuya sığacak şekilde yeniden düzenlenmeli. A4 baskıda küçük tablo yazıları ve elle doldurma alanları da fiziksel çıktı ile kontrol edilmeli. DOCX ve XLSX için ayrıca baskı önizlemesi gerekiyor; tüm dosyaların görsel düzeni onaylanmış değildir.

## Önerilen uygulama sırası

1. Ölçüm şablonunun doğrulamalarını düzeltmek; boş, metin, eksik numune, sınırda ve sınır dışı ölçüm senaryolarını doğrulamak.
2. Tek doküman envanteri oluşturmak: kod, başlık, revizyon, sahip, onay, yürürlük tarihi, ilgili modül ve dosya sürümü. Örnekleri üretim şablonlarından ayırmak.
3. Kalite kayıtlarında iptal/düzeltme geçmişi ile saklama kurallarını uygulamak.
4. Ölçüm–FAI–malzeme/proses sertifikası–CoC bağlantısını iş emri/lot üzerinden kurmak.
5. Tezgâh, bakım, vardiya devir teslim ve basılı formları ortak makine/vardiya ayarlarına bağlamak; basılı çıktıları doğrulamak.

Bu sırayla belgeler yalnızca indirilen dosyalar olmaktan çıkar; kayıt oluşturma, kontrol, onay ve çıktı süreçlerinin parçası olur.
