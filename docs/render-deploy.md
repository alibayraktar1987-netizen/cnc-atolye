# Render Deployment

Bu repo Render uzerinde ayni domain mantigiyla calisacak sekilde hazirlandi.

## Mimari

Kurulum su servisleri olusturur:

- `cnc-atolye-web`: ana arayuz + nginx reverse proxy
- `cnc-atolye-api`: Cost Estimator FastAPI servisi
- `cnc-atolye-worker`: Celery worker
- `cnc-atolye-db`: PostgreSQL
- `cnc-atolye-redis`: Render Key Value
- `cnc-atolye-minio`: private MinIO object storage

## 1. Repo'yu Render'a bagla

- Render dashboard'da `New +` -> `Blueprint` sec
- Bu repo'yu sec
- Blueprint dosyasi olarak kokteki `render.yaml` kullan

## 2. Blueprint'i olustur

Render asagidaki kaynaklari otomatik olusturacak:

- 1 web service
- 2 private/background service
- 1 PostgreSQL
- 1 Key Value
- 1 private MinIO service

Not:

- `worker`, `private service` ve persistent disk kullanan yapi nedeniyle ucretsiz plan yeterli olmayabilir
- Gerekirse servis planlarini Render panelinden sonra yukseltebilirsin

## 3. Ilk deploy sonrasi kontrol

Deploy tamamlaninca su kontrolleri yap:

- Ana site aciliyor mu
- `https://alan-adin/?tab=materialquote` aciliyor mu
- `https://alan-adin/openapi.json` donuyor mu
- `https://alan-adin/docs` aciliyor mu

## 4. Custom domain

- `cnc-atolye-web` servisine gir
- `Settings` -> `Custom Domains`
- Domain'i ekle
- DNS kaydini Render'in verdigi hedefe yonlendir

## 5. CORS

Bu kurulumda ana hedef same-origin yapidir:

- kullanici siteyi tek domain'den acar
- web servisi `/api/v1` isteklerini ic agdaki API'ye proxy eder

Bu nedenle normal akista ek CORS gerekmez.

Farkli bir domain'den API cagiracaksan `cnc-atolye-api` servisinde `CORS_ORIGINS` env degiskenini JSON dizi olarak gir:

```json
["https://app.ornek.com","https://admin.ornek.com"]
```

## 6. MinIO guvenligi

Blueprint icinde baslangic kolayligi icin MinIO credential degerleri sabit verildi.

Yayin sonrasi bunlari degistir:

- `cnc-atolye-minio` servisindeki `MINIO_ROOT_USER`
- `cnc-atolye-minio` servisindeki `MINIO_ROOT_PASSWORD`
- ayni degerleri `cnc-atolye-api` ve `cnc-atolye-worker` icindeki `MINIO_ACCESS_KEY` ve `MINIO_SECRET_KEY` alanlarina da yaz

## 7. Sorun giderme

`materialquote` ekrani aciliyor ama `Not Found` gorunuyorsa:

- `cnc-atolye-web` deploy loglarini kontrol et
- `cnc-atolye-api` servisi ayakta mi bak
- `openapi.json` ve `/docs` 404 ise nginx proxy veya API servisi ayakta degildir
- `cost-estimator` yukleniyor ama veri gelmiyorsa Redis, Postgres veya MinIO env'lerini kontrol et
