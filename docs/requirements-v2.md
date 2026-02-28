# CNC Atolyesi MRP Sistemi - V2 Gereksinim Kapsami

Bu dokuman, guncel gereksinim setini 16 baslik altinda resmi kapsam olarak sabitler.

Durum etiketleri:
- `Mevcut`: Uygulamada calisan ekran/ozellik var
- `Kismi`: Temel var, kapsam dar
- `Eksik`: Uygulamada henuz yok
- `Sonraya`: Bilerek ertelendi

## 1) Satis Siparis Yonetimi
- Musteri karti: `Mevcut`
- Teklif -> onay -> siparis donusumu: `Eksik`
- Kismi teslim takibi: `Eksik`
- Siparisten otomatik is emri: `Mevcut`
- Musteri siparis gecmisi: `Kismi`
- Proforma/siparis onay PDF: `Eksik`
- Sevk/fatura dis entegrasyon: `Sonraya`

## 2) Is Emri Yonetimi
- Is emri CRUD: `Mevcut`
- Termin/onc elik/durum: `Kismi`
- Is emri bagimliliklari: `Eksik`
- Siparisten gelen vs manuel etiket: `Kismi`

## 3) Parca ve Urun Tanimlari
- Parca kutuphanesi: `Kismi`
- BOM: `Eksik`
- Rota/operasyon akisi: `Eksik`
- Standart cevrim + hazirlik suresi: `Kismi`
- NC versiyon + teknik resim: `Kismi`
- Birim maliyet: `Eksik`

## 4) Uretim Planlama ve Cizelgeleme
- Makine kapasite planlama: `Kismi`
- Vardiya planlama: `Kismi`
- Gantt drag-drop: `Mevcut`
- Otomatik siralama: `Kismi`
- Setup optimizasyonu: `Eksik`
- What-if simulasyon: `Kismi`
- Gecikme erken uyari: `Eksik`

## 5) Malzeme ve Stok Yonetimi
- Hammadde/yari mamul/sarf stok: `Kismi`
- Is emri bazli malzeme ihtiyaci: `Eksik`
- Stok karsilastirma + yetersizlik kontrolu: `Kismi`
- Otomatik satin alma talebi: `Eksik`
- Malzeme rezervasyon: `Eksik`
- Lead-time ile giris tahmini: `Eksik`
- ROP + safety stock: `Eksik`
- Barkod/QR depo hareketi: `Eksik`

## 6) Satin Alma Yonetimi
- Satin alma talebi (manuel/otomatik): `Eksik`
- Tedarikci kart/fiyat listesi: `Eksik`
- Teklif karsilastirma: `Eksik`
- PO olusturma/onay: `Eksik`
- Malzeme giris ve stoklama: `Kismi`
- Tedarikci performans KPI: `Eksik`

## 7) Tezgah Baglantisi ve Veri Toplama
- Marka/protokol hazirlik profili: `Mevcut`
- Canli baglanti: `Eksik`
- Telemetry toplama seti: `Kismi` (simulasyon var)
- Buffer + reconnect sync: `Eksik`
- UTC timestamp standardi: `Kismi`

## 8) Atolye Takip Ekrani
- Tum tezgahlar canli tek ekran: `Eksik`
- Durum/program/parca sayaci: `Kismi`
- OEE: `Kismi`
- Vardiya ozetleri: `Kismi`
- Operator durus nedeni girisi: `Eksik`
- Cevrim sapmasi uyarisi: `Eksik`

## 9) Takim Yonetimi
- Takim kutuphanesi: `Mevcut`
- Is emri/NC atamasi: `Kismi`
- Otomatik omur dusumu: `Eksik`
- Low-life uyari: `Eksik`
- Presetter entegrasyonu: `Eksik`
- Kirilma/erken degisim kaydi: `Eksik`

## 10) Kalite ve Izlenebilirlik
- Parca gecmisi zinciri: `Kismi`
- Kontrol sonucu/olcum: `Eksik`
- Iskarta neden/maliyet: `Kismi`
- FAI: `Eksik`
- Is emrine belge ekleme: `Mevcut`
- Musteri sikayeti geri baglantisi: `Eksik`

## 11) Durus Yonetimi
- Durus tipi tanimlari: `Eksik`
- Zorunlu neden girisi: `Eksik`
- Durus sure-neden otomatik kayit: `Eksik`
- Pareto kok neden analizi: `Eksik`
- Bakim bildirimi: `Eksik`

## 12) Raporlama ve KPI
- Gunluk/haftalik/aylik ozet: `Kismi`
- OTD musteri bazli: `Eksik`
- Makine heatmap: `Eksik`
- Top 10 durus Pareto: `Eksik`
- Iskarta trend: `Kismi`
- Parca maliyet KPI: `Eksik`
- Musteri ciro/siparis ozeti: `Eksik`
- Excel/PDF export: `Kismi`
- Zamanlanmis e-posta raporu: `Eksik`

## 13) Kullanici ve Yetkiler
- Rol bazli erisim: `Kismi`
- Aktivite logu: `Eksik`
- Sifre politikasi: `Eksik`
- Oturum timeout: `Kismi`

## 14) Bildirim ve Uyari
- Tezgah alarm bildirimleri: `Eksik`
- Is emri gecikme uyari: `Eksik`
- Kritik stok bildirimi: `Eksik`
- Takim omru uyarisi: `Eksik`
- Cevrim sapma bildirimi: `Eksik`
- Termin yaklasan siparis bildirimi: `Eksik`

## 15) Dis Entegrasyon
- ERP/muhasebe/CAM/API: `Sonraya`
- Altyapi hazirligi: `Kismi`

## 16) Teknik Altyapi
- On-prem web mimari: `Mevcut`
- Mobil uyum: `Mevcut`
- 50 makine hedefi: `Eksik`
- 5 yil saklama: `Eksik`
- Dashboard <2sn: `Kismi`
- Offline operasyon surekliligi: `Eksik`
- TR/EN: `Kismi`

