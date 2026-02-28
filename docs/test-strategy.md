# Test Stratejisi

Bu dokuman, projeye eklenecek test katmanlarini tanimlar.

## 1) Birim Testleri

Hedef:

- MRP hesap fonksiyonlari
- BOM patlatma
- Kapasite hesaplari
- Maliyet roll-up fonksiyonlari

Onerilen kapsama:

- Kritik hesaplama modullerinde en az %80 satir kapsami

## 2) Entegrasyon Testleri

Hedef:

- Siparis -> Is emri -> Planlama -> Veri girisi akisi
- MPS -> MRP run -> Satin alma onerisi akisi
- Stok hareketleri (lot/serial dahil)

Onerilen araclar:

- API icin Postman/Newman veya benzeri
- UI akislar icin Playwright

## 3) Performans Testleri

Hedef:

- 10k+ stok hareketi ile rapor ekranlari
- 1k+ is emri ile planlama/Gantt performansi
- MRP run suresi (urun agaci derinligi arttiginda)

Onerilen KPI:

- MRP run (1k item) <= 60s
- Ana dashboard acilis suresi <= 2s (p95, local cache)

## 4) Veri Seti

- Ornek seed: `docs/sample-data/demo-seed.json`
- Test verisi moduller arasi iliski icermeli (item-BOM-routing-stock-order)

## 5) CI Test Kapilari

- OpenAPI validasyon
- Lint/format kontrolleri
- Unit test suiti
- Smoke integration test

