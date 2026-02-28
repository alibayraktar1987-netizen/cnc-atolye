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
- Uygulama yol haritasi: `docs/roadmap.md`
- Veri modeli: `docs/data-models.md`
- MRP master blueprint: `docs/mrp-master-blueprint.md`
- Kullanici kilavuzu: `docs/user-guide.md`
- Test stratejisi: `docs/test-strategy.md`
- OpenAPI: `openapi.yaml`

## Kisa Durum Ozeti

- Mevcut: Satis siparisleri, is emirleri, temel stok, planlama/Gantt, KPI raporlari, rol tabanli temel yetki, makina baglanti hazirlik modulu
- Kismi: Kapasite/planlama, stok politikasi, guvenlik
- Eksik: BOM/MPS/MRP, satin alma planlama, maliyetleme, audit log, entegrasyon katmani, otomatik test paketi

## Deployment

- Docker image: `Dockerfile`
- Docker Compose: `docker-compose.yml`
- CI pipeline: `.github/workflows/ci.yml`
