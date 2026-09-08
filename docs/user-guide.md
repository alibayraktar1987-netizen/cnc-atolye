# Kullanici Kilavuzu

Bu kilavuz, mevcut ekranlari ve hedeflenen yeni modullerin temel kullanimini ozetler.

## 1) Giris ve Roller

- `admin`: Tum ekranlar + kullanici/onay ayarlari
- `operator`: Veri girisi odakli
- Planlanan roller: `planner`, `warehouse`, `purchasing`

## 2) Mevcut Ekranlar

- `MRP Panel`: Genel MRP ozet paneli (roadmap gorunumu)
- `Giris`: Vardiya bazli uretim verisi girisi
- `Planlama`: Aylik Gantt, plan ekleme/duzenleme
- `Makina Hazirlik`: Baglanti oncesi marka/protokol profili, IPC ayari ve simulasyon
- `Musteriler`: Musteri kartlari
- `Malzemeler`: Malzeme kutuphanesi ve stok adetleri
- `Siparisler`: Satis siparisi olusturma, is emrine donusturme
- `Takim Stogu`: Takim giris/cikis hareketleri
- `Is Emirleri`: Is emri olusturma, durum yonetimi
- `Rapor Merkezi`: Hazır sorular, anlaşılır özetler, grafikler ve kayıt ayrıntıları
- `Ölçüm`: Ölçüm kayıtları, tolerans sonuçları ve offset önerileri
- `Depo`: Malzeme giriş/çıkışları, lot ve konum bilgileri
- `Ayarlar`: Kullanici ve tezgah ayarlari

**Yeni makine eklemek için:** Ayarlar ve Güvenlik → **Makineler** → **Yeni makine**. Ayarlar Merkezi'nin üstündeki **Yeni makine ekle** düğmesi de doğrudan giriş penceresini açar. Makine adını girin, marka/protokolü seçin ve **Makineyi kaydet** düğmesine basın. IP ve bağlantı bilgileri isteğe bağlıdır; sonradan tamamlanabilir. Kayıtlı makine üretim, planlama ve diğer makine seçimlerine eklenir. Makine Hazırlık ekranı da aynı kayıtları kullanır. Aynı makine için ikinci profil açmak yerine mevcut kaydı düzenleyin.

## 3) Uc Calisma Modu

- `Planlama Modu`: Planlama + MPS/MRP + satin alma odakli menu
- `Operasyon Modu`: Uretim, is emri, kalite, stok hareket odakli menu
- `Yonetim Modu`: Tum moduller + sistem + guvenlik odakli menu

Arayuz desktop/tablet/mobile icin farkli menu yerlesimleri ile calisir.

## 4) Hedeflenen Yeni Ekranlar

- `BOM`: Urun agaci ve revizyon yonetimi
- `MPS`: Ana uretim plani (haftalik/aylik)
- `MRP`: Calistir/izle ekranlari, net ihtiyac sonucu
- `Satin Alma`: Oneriler, siparise donusturme
- `Maliyet`: Urun/is emri maliyet kartlari
- `Audit`: Islem gunlugu inceleme

## 5) Onerilen Is Akisi

1. Master data (item, supplier, BOM, routing) olustur
2. MPS planini gir
3. MRP run baslat
4. Satin alma onerilerini degerlendir
5. Is emirlerini serbest birak
6. Uretim veri girisi yap
7. KPI + maliyet + audit raporlarini kontrol et

## 6) Rapor Merkezi

1. **Sorunuzu seçin.** Üretim, teslimat, kalite, duruş, stok veya satış kartına dokunun. Hazır rapor otomatik açılır.
2. **Kapsamı belirleyin.** Tarih aralığını seçin. “Filtreler” ile tezgah, para birimi, arama veya uyarı durumunu kullanın. Seçimler birlikte uygulanır; raporun üstünde kapsamı görünür.
3. **Sonucu inceleyin.** Özet kartlarda “Nasıl hesaplanır?” açıklamaları bulunur. Grafikte bir gruba dokununca alt tablodaki kayıtlar daralır. Grup seçimini kaldırarak tüm sonuçlara dönün.

“Yeni rapor”, üç adımda konu, ölçüm/görünüm ve ad seçtirir. “Bu görünümü kaydet” mevcut filtreleri saklar. Kayıtlı raporu açıp değiştirebilir, güncelleyebilir veya gösterge panelinize ekleyebilirsiniz. Rapor tanımları, raporlar bölümüne erişen kullanıcılarla ortaktır. Kayıtlı rapor bir veri kopyası değildir; her açılışta güncel kayıtlarla hesaplanır. Önceki sürümde kaydedilen raporlar da açılır.

**CSV indir** seçime uyan bütün kayıtları dışa aktarır; yalnızca görünen sayfayı indirmez. CSV, Excel ile açılabilir. **Yazdır / PDF** aynı kayıtları firma logosu, rapor kapsamı ve özetleriyle yazdırır. PDF almak için tarayıcının yazdırma penceresinden PDF olarak kaydetmeyi seçin. Grafikte grup seçiliyse dışa aktarım da o grupla sınırlıdır.

Hesaplamaların kapsamı:

- Üretim, duruş, kalite ve satış tarih aralığını kullanır. İki uç tarih dahildir. Tarihsiz kayıtlar yalnızca “Tüm tarihler” seçiminde görünür.
- Stok ve teslimat raporları **güncel durumu** gösterir. Geçmiş tarihteki stok veya açık sipariş durumu yeniden oluşturulmaz.
- Farklı para birimleri ve stok ölçü birimleri ayrı hesaplanır. Gösterge panelinde böyle bir rapor karşılaştırma tablosuyla açılır.
- Üretimde sağlam oranı, toplam sağlam adet / toplam üretilen adet üzerinden hesaplanır. Kalitedeki olumsuz sonuç oranı muayene sonuçlarını ölçer.
- Satış tutarı, sipariş kayıtlarının tutarıdır. Tahsilat için Finans ekranını kullanın.
- Veri okunamazsa sonuç yerine hata ve yeniden deneme seçeneği görünür.

## 7) Finans tahsilat takvimi

Finans ekranının üstündeki grafikte **Beklenen tahsilatlar** açık kayıtları vade tarihine, **Gerçekleşen tahsilatlar** tahsil edilmiş kayıtları gerçek tahsilat tarihine göre gösterir. Ödeme ve iptal kayıtları tahsilat grafiğine dahil edilmez.

Bu ay, son 30 gün, tüm tarihler veya özel tarih aralığı seçilebilir. “Bu ay”, ayın sonuna kadarki beklenen vadeleri de içerir. Günlük/aylık gruplama ve para birimi seçimi yapılabilir. Farklı para birimleri ayrı grafiklerde gösterilir. Bir sütuna dokunarak o tarihteki kayıtları açın. Grafik kendi filtrelerini kullanır; alt finans listesinin vade/akış filtreleri ayrıdır.

Bir tahsilatı kapatırken satırdaki **Tahsilat tarihi** alanını kontrol edip **Tahsil** düğmesine basın. Eski tahsil edilmiş kayıtlarda tarihi girerek **Tarihi kaydet** düğmesini kullanabilirsiniz. Gerçek tahsilat tarihi gelecekte olamaz. Tarihi eksik eski kayıtlar grafikte tahmini tarihe yerleştirilmez; eksik kayıt sayısı belirtilir. Satır plan veya iptal durumuna alınırsa aktif tahsilat tarihi temizlenir.

## 8) Ölçüm ve Depo ekranları

Ölçüm, **Analiz ve Raporlar**; Depo, **Kaynak ve Tedarik** menüsünden ayrı açılır. Eski birleşik ekran bağlantısı Ölçüm ekranına yönlenir. Eski birleşik modül için atanmış menü erişimi veya gizleme ayarı iki yeni ekran için korunur; yeni ayarlarda ekranlar ayrı seçilebilir.

İki ekranda da kayıt listesi, arama, durum/hareket ve tarih filtreleri, sütun düzenleme ve sayfalama bulunur. **Yeni ölçüm** veya **Yeni depo hareketi** düğmesi giriş penceresini açar. Bir satırdaki **Düzenle** aynı şablondaki pencereyi mevcut bilgilerle açar. Vazgeç, Kapat veya Escape değişiklikleri kaydetmeden pencereyi kapatır. Başarısız kayıt işleminde pencere ve girilen bilgiler korunur.

Ölçümde hedef, gerçek ölçü ve tolerans aynı birimde girilir. Sapma ve sonuç anlık gösterilir. Aşınma düzeltmesi boş bırakılırsa sapmanın tersi önerilir; otomatik öneri, ölçüm düzenlendiğinde yeniden hesaplanır. Önceki sürümün açıkça kaydedilmiş düzeltme değerleri korunur. **Offset kaydı oluştur** yazılımdaki Takım ve Çevrim bölümüne kayıt ekler; fiziksel tezgaha komut göndermez. Offset oluşturulan ölçümler görüntülenebilir; yeni bir sonuç için yeni ölçüm açılır.

Depoda giriş veya çıkış, malzeme, miktar, lot ve konum seçilir. Kayıt düzenlenirse eski hareketin stok etkisi geri alınır ve yeni hareketin farkı uygulanır. Malzeme değişiminde iki malzemenin stoku birlikte güncellenir. Stok yetersizse işlem kaydedilmez. Tablo, son kaydetme işlemi öncesi ve sonrası malzeme stoklarını gösterir; stok toplamı malzeme kartına aittir, lot/raf bilgileri hareket üzerinde tutulur.
