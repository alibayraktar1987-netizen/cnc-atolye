# Roadmap V2 (Guncel Gereksinim Uyumlu)

Bu plan, V2 gereksinim setine gore sprint/faz bazli teslim onceligini tanimlar.

## Faz 0 - Temel Stabilizasyon (1-2 hafta)
- Rol modeli genisletme (Admin, Satis, Planlama, Satin Alma, Vardiya Sefi, Operator, Kalite, Izleyici)
- 3 calisma modu ve detayli menunun kalicilastirilmasi
- Modul placeholder -> backlog baglantisi
- Ortak API sozlesmesi ve event modeli

## Faz 1 - Satis + Is Emri + Master Data (2-4 hafta)
- Teklif yonetimi ve siparise donusum
- Siparis durum ve kismi teslim takip modeli
- Is emri bagimlilik ve kaynak etiketi (otomatik/manuel)
- Parca kutuphanesi + BOM + routing temel CRUD

## Faz 2 - MPS/MRP + Satin Alma (3-5 hafta)
- MPS zaman kovasi ekrani
- MRP run motoru (gross/net)
- Safety stock, reorder point, lot policy
- Satin alma talebi ve PO akisi
- Tedarikci karti, teklif karsilastirma, performans KPI

## Faz 3 - Planlama + Shopfloor + Durus (3-5 hafta)
- Kapasite ve vardiya yuk dengeleme
- Otomatik siralama + setup optimizasyonu
- Canli atolye dashboard ve OEE
- Durus nedeni zorunlu giris + Pareto
- Cevrim sapmasi ve gecikme erken uyarilari

## Faz 4 - Kalite + Izlenebilirlik + Takim (3-4 hafta)
- Seri bazli uretilen parca gecmisi
- Muayene kaydi, FAI, scrap cost
- Takim omur otomatik dusum ve low-life bildirim
- Presetter entegrasyon adaptor arayuzu

## Faz 5 - Raporlama + Bildirim + Performans (2-4 hafta)
- KPI raporlari (OTD, heatmap, scrap trend, musteri ciro)
- Excel/PDF export ve zamanlanmis e-posta
- Bildirim merkezi (alarm, stok, termin, takim)
- Dashboard 2sn hedefi icin performans iyilestirme

## Faz 6 - Tezgah Canli Baglanti ve Edge (3-6 hafta)
- IPC edge agent ilk surum
- Protokol baglayicilar (FOCAS/OPC-UA/MTConnect/MQTT)
- Buffer + reconnect + UTC timestamp pipeline
- Pilot 5 makina canliya gecis

## Faz 7 - Dis Entegrasyon (Sonraya)
- ERP / muhasebe / CAM / public API
- Asenkron senkronizasyon ve hata yonetimi

