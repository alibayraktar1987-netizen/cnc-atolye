# Proje Gereksinim Matrisi

Bu dokuman, hedef kapsam ile mevcut uygulama arasindaki farki kapatmak icin referans gereksinim listesidir.

Durum etiketleri:

- `Mevcut`: Uygulamada calisan ozellik var
- `Kismi`: Temel destek var ama kapsam eksik
- `Eksik`: Uygulamada yok

## 1) Temel Moduller

| Gereksinim | Durum | Not |
|---|---|---|
| BOM (Bill of Materials) | Eksik | BOM hiyerarsisi ekrani ve veri modeli yok |
| MPS (Master Production Schedule) | Eksik | Aylik ana uretim plani ayrik bir modul degil |
| MRP run | Eksik | Malzeme patlatma ve ihtiyac hesaplama yok |
| Stok yonetimi | Kismi | Malzeme/takim stok var, gelismis politika yok |
| Satis siparisleri | Mevcut | `SalesOrders` ekrani var |
| Satin alma planlama | Eksik | Tedarik odakli oneriler ve PO akisi yok |
| Is emirleri | Mevcut | `WorkOrders` ekrani var |

## 2) Zamanlama ve Kapasiteler

| Gereksinim | Durum | Not |
|---|---|---|
| Tedarikci lead-time | Eksik | Tedarikci master verisi yok |
| Uretim lead-time | Kismi | Parca suresi var, net lead-time modeli yok |
| Kapasite planlama | Kismi | Tezgah bazli plan/Gantt var, yuk dengeleme yok |
| Is merkezleri | Eksik | Work center tanimlari yok |
| Vardiya yonetimi | Kismi | Vardiya secimi var, kapasiteye etkisi sinirli |

## 3) Stok Politikalari

| Gereksinim | Durum | Not |
|---|---|---|
| Guvenlik stogu | Eksik | Malzeme seviyesinde safety stock yok |
| Parti/lot izleme | Eksik | Lot tabanli hareket ve izlenebilirlik yok |
| Seri numarasi takibi | Eksik | Serial-level izleme yok |
| FIFO/LIFO opsiyonlari | Eksik | Cikis algoritmasi secimi yok |

## 4) Maliyetleme

| Gereksinim | Durum | Not |
|---|---|---|
| Malzeme maliyeti | Eksik | Birim maliyet alanlari yok |
| Urun maliyeti | Eksik | BOM + routing cost roll-up yok |
| Siparis maliyeti | Eksik | Is emri bazli maliyet karsilastirmasi yok |
| Maliyet raporlama | Eksik | Maliyet dashboard/rapor yok |

## 5) Veri ve Modeller

| Gereksinim | Durum | Not |
|---|---|---|
| Parca katalogu | Eksik | Standart parca ana verisi yok |
| Tedarikciler | Eksik | Supplier kartlari yok |
| Stok lokasyonlari | Kismi | Basit lokasyon alanlari var |
| BOM hiyerarsisi | Eksik | Parent-child urun agaci yok |
| Routing/makine suresi | Kismi | `partSec` var, operasyon routing yok |

## 6) Arayuz

| Gereksinim | Durum | Not |
|---|---|---|
| Uretim planlama panosu | Kismi | Plan ekrani var, MPS/MRP paneli yok |
| Gantt/cizelgeleme gorunumu | Mevcut | Planning modulunde var |
| Siparis/urun formlari | Mevcut | Sales + Work Orders formlari var |
| Stok durumu dashboard | Kismi | Stok listeleri var, merkezi dashboard yok |

## 7) Entegrasyonlar

| Gereksinim | Durum | Not |
|---|---|---|
| ERP/accounting | Eksik | Harici sistem baglantisi yok |
| E-ticaret | Eksik | Siparis entegrasyonu yok |
| CSV/XLSX import-export | Eksik | Toplu import/export yok |
| SMTP (e-posta) | Eksik | Bildirim altyapisi yok |
| Webhooks/REST API | Eksik | Sunucu API katmani yok |

## 8) Raporlar ve Analiz

| Gereksinim | Durum | Not |
|---|---|---|
| Malzeme ihtiyac raporu | Eksik | MRP tabanli rapor yok |
| Satin alma onerileri | Eksik | Oneri motoru yok |
| Stok yaslandirma | Eksik | Yaslandirma metrikleri yok |
| Uretim performansi KPI | Mevcut | `Report` ekraninda mevcut |

## 9) Kullanici ve Guvenlik

| Gereksinim | Durum | Not |
|---|---|---|
| Rol tabanli erisim | Kismi | Temel rol/yetki var |
| Audit log | Eksik | Islem gunlugu yok |
| Oturum guvenligi | Kismi | Local session var, token policy yok |

## 10) Test ve Kalite

| Gereksinim | Durum | Not |
|---|---|---|
| Birim testleri | Eksik | Test altyapisi yok |
| Entegrasyon testleri | Eksik | E2E/integration yok |
| Ornek veri seti | Kismi | `docs/sample-data/demo-seed.json` eklenecek |
| Performans testleri | Eksik | Planli ama yok |

## 11) Dagitim

| Gereksinim | Durum | Not |
|---|---|---|
| Dockerfile | Mevcut | Bu iterasyonda eklendi |
| Docker Compose / Kubernetes | Mevcut | Compose eklendi, K8s sonraki adim |
| CI/CD pipeline | Mevcut | Baslangic CI eklendi |

## 12) Dokumantasyon

| Gereksinim | Durum | Not |
|---|---|---|
| README | Mevcut | Bu iterasyonda eklendi |
| API dokumani (OpenAPI/Swagger) | Mevcut | `openapi.yaml` eklendi |
| Kullanici kilavuzu | Mevcut | `docs/user-guide.md` eklendi |

