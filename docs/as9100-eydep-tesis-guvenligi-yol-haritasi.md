# AS9100, EYDEP ve Tesis Güvenliği Uygulama Yol Haritası

## Amaç ve sınır

Bu yol haritası, CNC Atölye uygulamasının denetlenebilir kayıt ve iş akışı
altyapısını güçlendirmek içindir. Sertifikasyon veya mevzuata uygunluk
garantisi değildir; nihai uygunluk, yetkili danışman ve denetçi tarafından
değerlendirilmelidir. Standartların telifli tam metni uygulamaya eklenmez;
yalnız süreç başlığı, madde referansı ve şirket kaydı tutulur.

Canlı, test ve demo ortamlarında tasnifli veri, gerçek müşteri teknik resmi,
NC programı ya da savunma proje kodu kullanılmayacaktır.

## Referanslar

- `ABBA_Digital_Factory_Ana_Proje_Scripti.md`
- `ABBA_AS9100_EYDEP_Tesis_Guvenligi_Dokumantasyon_Paketi.zip`
- `ABBA_Digital_Factory_Faz1.zip` içindeki veri modeli, denetim izi ve kapı
  mantığı örnekleri
- Mevcut `docs/requirements-v2.md` ve `docs/data-models.md`

## Mevcut durum ve boşluklar

| Alan | Mevcut temel | Tamamlanacaklar |
| --- | --- | --- |
| Rol ve erişim | Rol, izin, oturum ve kullanıcı onayı var | Görev ayrılığı, tesis güvenliği rolü, denetçi salt-okunur kapsamı, güvenlik seviyesi bazlı erişim |
| Denetim izi | Birçok oluşturma/güncelleme işleminde audit kaydı var | Onay, kapatma, yazdırma/indirme, durum geçişi ve gerekçe için zorunlu, tutarlı append-only kayıt |
| Kalite | Muayene, FAI, balonlama, izlenebilirlik ve bildirim temeli var | Kontrol planı, ölçüm limitleri, NCR/MRB/CAPA, serbest bırakma kapıları, CoC paketi |
| Doküman | İş emri/parça dosya ilişkilendirmesi var | Kod/revizyon/yaşam döngüsü, hazırlayan-kontrol eden-onaylayan ayrılığı, kontrollü kopya |
| EYDEP yönetimi | KPI ve bazı rapor ekranları var | Risk/fırsat, hedef/KPI, iç denetim, YGG, yetkinlik/eğitim, aksiyon takibi |
| Tesis güvenliği | Ayrı kayıt modülü yok | Ziyaretçi, kontrollü alan, medya, kart/anahtar, varlık giriş-çıkışı, güvenlik olayı |
| Veri güvenliği | Firebase tabanlı kimlik ve veri erişimi var | Firestore kuralları, güçlü parola hash'i, başarısız giriş kaydı, indirme/yazdırma izleri, saklama-imha politikası |

## Ortak kayıt kuralları

Yeni kayıtlar aşağıdaki ortak alanları kullanır:

- `id`, `recordNo`, `status`, `securityLevel`, `revision`
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`
- `approvedAt`, `approvedBy`, `closedAt`, `closedBy` (uygunsa)
- `evidenceRefs`, `linkedActionIds`, `retentionUntil`, `archivedAt`

Fiziksel silme yerine `cancelled`, `obsolete` veya `archived` durumları
kullanılır. Kritik durum geçişleri kullanıcı, tarih-saat, önceki/yeni değer,
gerekçe ve kayıt kimliğiyle audit log'a yazılır.

## Uygulama fazları

### 1. Ortak yönetişim altyapısı

- Yeni roller: sistem yöneticisi, genel müdür, kalite yöneticisi, tesis
  güvenlik sorumlusu ve denetçi.
- Ayrık izinler: doküman yayınlama, kalite serbest bırakma, CAPA kapatma,
  güvenlik olayı kapatma, denetim/YGG onayı ve dışa aktarma.
- Ortak `action`, `approval` ve `evidence` ilişkileri; görev ayrılığı
  denetimi.

### 2. Doküman ve konfigürasyon yönetimi

- `controlledDocuments` ve `documentRevisions` kayıtları.
- Yaşam döngüsü: Taslak → İnceleme → Onay → Yayınlandı → Revizyon →
  İptal/Arşiv.
- Operatör ekranında yalnız yürürlükte/onaylı talimatın gösterilmesi.
- Yazdırılan kayıtta doküman kodu, revizyon, güvenlik seviyesi, sayfa bilgisi
  ve “Elektronik sistemdeki güncel kayıt esastır” notu.

### 3. AS9100 kalite akışları

- Kontrol planı/ölçüm karakteristiği, cihaz ve kalibrasyon geçerlilik
  doğrulaması.
- Limit dışı ölçümden NCR taslağı; karantina, MRB kararı ve izlenebilirlik
  ilişkisi.
- CAPA: geçici önlem, kök neden, aksiyon, kanıt, etkinlik doğrulama ve
  onaylı kapanış.
- İş emri serbest bırakma kapıları: yürürlükteki doküman, malzeme lotu,
  ilk parça, kalibrasyon, açık uygunsuzluk ve final kontrol.
- CoC/FAI/izlenebilirlik çıktılarında otomatik eksik kontrolü.

### 4. EYDEP yönetim kayıtları

- Risk ve fırsat kaydı, kalite hedefleri/KPI ve aksiyon planı.
- İç denetim programı, kontrol listesi, bulgu ve takip aksiyonu.
- Yönetimin Gözden Geçirmesi gündemi, katılımcıları, kararları ve aksiyonları.
- Eğitim/yetkinlik matrisi; makine, operasyon, ölçüm ve özel proses yetkisi.
- Acil durum, iş sürekliliği, ürün güvenliği ve sahte parça önleme kayıtları.

### 5. Tesis ve bilgi güvenliği

- Ziyaretçi giriş/çıkış, NDA/kimlik doğrulama ve refakatçi kaydı.
- Kontrollü alan erişimi, kart/anahtar teslimi ve varlık hareketi.
- Taşınabilir medya/USB ve teknik veri erişim talebi.
- Güvenlik olayı: etki, geçici önlem, inceleme, aksiyon, kanıt ve onaylı
  kapanış.
- Rol/güvenlik seviyesine göre görüntüleme, indirme, yazdırma ve dışa aktarma
  izleri.

## Sahada doğrulanacaklar

- Doküman onay yetkilileri, saklama süreleri ve güvenlik sınıflandırması
- EYDEP değerlendirme başlıkları ve kanıt beklentileri
- Tesis kontrollü alan listesi, ziyaretçi/kart prosedürü ve olay eskalasyonu
- Firestore güvenlik kuralları, yedekleme/geri yükleme ve gerçek ortamların
  ayrımı
- Müşteri/kurum özel kalite ve bilgi güvenliği şartları

## Teslim ilkesi

Her fazda masaüstü/tablet görünümü, zorunlu alanlar, rol kontrolü, audit
kaydı, filtre/detay ekranı ve yazdırma görünümü doğrulanır. Uygulama mevcut
menü, iş emri, üretim ve kalite ekranlarını kaldırmadan genişletilir.
