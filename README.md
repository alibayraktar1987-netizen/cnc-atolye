# CNC Atolye Takip

Bu repo, CNC atolyeleri icin React + Firebase tabanli bir operasyon takip uygulamasidir.
Mevcut uygulama su anda agirlikla is emri, siparis, stok, planlama ve raporlama ekranlarini icerir.

## Teknoloji

- Frontend: `index.html` icinde React 18 (UMD) + Babel
- Veri: Firebase Firestore
- Ek sayfa: `orders.html` + `js/orders.js`

## Yerel Calistirma

1. Statik dosya olarak dogrudan acabilirsiniz:
   `index.html`
2. Alternatif olarak bir lokal web server ile:
   `python -m http.server 8080`

## Kapsam Dokumanlari

- Gereksinim matrisi: `docs/requirements.md`
- Guncel gereksinim kapsami (V2): `docs/requirements-v2.md`
- Uygulama yol haritasi: `docs/roadmap.md`
- Guncel yol haritasi (V2): `docs/roadmap-v2.md`
- Veri modeli: `docs/data-models.md`
- MRP master blueprint: `docs/mrp-master-blueprint.md`
- Kullanici kilavuzu: `docs/user-guide.md`
- Test stratejisi: `docs/test-strategy.md`
- OpenAPI: `openapi.yaml`

## Kisa Durum Ozeti

- Mevcut: Satis + teklif akisi, is emri yonetimi, parca/BOM/rota tanimlari, planlama/Gantt, MPS ve MRP run ekranlari
- Mevcut: Satin alma (tedarikci, talep, teklif, PO, malzeme girisi), durus yonetimi, kalite-izlenebilirlik, bildirim merkezi, maliyetleme
- Mevcut: Rol tabanli erisim, audit log yardimci fonksiyonlari, makina baglanti hazirlik modulu (canli baglanti oncesi)
- Yeni UI: Planlama/Operasyon/Yonetim olmak uzere 3 calisma modu ve detayli MRP menu yapisi
- Sonraya: Dis ERP/muhasebe/CAM entegrasyonlari (hazirlik modulu mevcut, canli baglanti kapali)

## Deployment

- Docker image: `Dockerfile`
- Docker Compose: `docker-compose.yml`
- CI pipeline: `.github/workflows/ci.yml`
