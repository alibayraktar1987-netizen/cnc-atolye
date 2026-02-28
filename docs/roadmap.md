# Uygulama Yol Haritasi

Bu plan, mevcut uygulamayi BOM/MPS/MRP odakli tam bir uretim planlama sistemine donusturmek icin fazlara ayrilmis is listesidir.

## Faz 0 - Temel Hiza (1-2 hafta)

- Gereksinim onayi ve kapsam dondurma
- Veri modeli standardizasyonu (`docs/data-models.md`)
- Kod tabanini modulerlestirme planinin netlestirilmesi
- Entegrasyon yaklasimi (ERP, e-ticaret, e-posta) kararlarinin alinmasi

Teslimatlar:

- Onayli backlog
- OpenAPI iskeleti
- CI + Docker baseline

## Faz 1 - Master Data ve BOM (2-3 hafta)

- Parca katalogu (item master)
- Tedarikci kartlari ve lead-time alanlari
- Stok lokasyonu modeli
- BOM hiyerarsisi (multi-level) CRUD
- Routing/operasyon adimlari ve is merkezi tanimlari

Kabul kriterleri:

- Bir urun icin en az 3 seviyeli BOM olusturulabilmeli
- Routing adimlari sure ve is merkezi ile iliskilenebilmeli

## Faz 2 - MPS + Kapasite + Is Emri (2-3 hafta)

- MPS ekrani ve haftalik/aylik plan
- Vardiya takvimi ve efektif kapasite hesabı
- Is merkezleri bazinda yuk gorunumu
- Is emri olusturma ve planla senkronu

Kabul kriterleri:

- Planlanan adet kapasiteyi astiginda uyarı uretilmeli
- MPS degisince ilgili is emirleri tekrar planlanabilmeli

## Faz 3 - MRP + Satin Alma Planlama (3-4 hafta)

- MRP run motoru (gross/net requirement)
- Guvenlik stogu + lot sizing kurallari
- Satin alma onerileri (PO recommendation)
- Tedarikci lead-time etkisi ile termin hesaplama

Kabul kriterleri:

- Seçili donem icin malzeme ihtiyac raporu cikmali
- Satin alma onerileri onaylanip siparise donusebilmeli

## Faz 4 - Maliyetleme + Analitik + Guvenlik (2-3 hafta)

- Malzeme/urun/is emri maliyet modelleri
- Stok yaslandirma ve maliyet KPI ekranlari
- Audit log ve kritik islem izleme
- Oturum guvenligi, role hardening

Kabul kriterleri:

- Bir is emri icin planlanan vs gerceklesen maliyet raporu alinabilmeli
- Audit log ile kim-ne-zaman degisiklik yapti izlenebilmeli

## Faz 5 - Entegrasyon + Test + Release (2-3 hafta)

- ERP/accounting baglantilari
- CSV/XLSX import-export
- SMTP bildirimleri ve webhook cikislari
- Unit/integration/performance test suite
- CI/CD release akisi

Kabul kriterleri:

- Kritik akislar testlerde otomatik dogrulanmali
- Container uzerinden tek komutla deploy edilebilmeli

