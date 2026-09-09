# FAI ISO tolerans hesapları

Çalışmada çizim birimini ve çizimde yazan ISO 2768-1:1989 sınıfını seçin. Seçili sınıf olmadan genel tolerans uygulanmaz. Özel yazılı tolerans önce gelir; geçme işareti varsa genel toleransa geçilmez. Kaydetme, nominal değer, sapmalar, sınırlar, hesap dayanağı ve çalışma ayarlarını birlikte saklar. Eski kayıtlar açılıp ayarlar seçilerek yeniden kaydedilebilir.

Desteklenen geçmeler: H5–H9 ve h5–h9 için 1 mm üzeri–500 mm dahil; g6, k6, m6 ve n6 için 3 mm üzeri–315 mm dahil. Büyük/küçük harf korunur. Diğer sınıflar ve boyutlar açıkça kapsam dışı gösterilir, değer uydurulmaz. ISO tablolarındaki mikrometre değerleri mm'ye çevrilir. Çizim birimi mm olarak doğrulanmalıdır.

ISO 2768-1:1989 f/m/c/v doğrusal tabloları 0,5–4000 mm aralığında uygulanır; tablodaki boş hücreler desteklenmez. Kırılmış kenarlar ve pah yüksekliği satırda ayrıca seçilir. Radyüsün kenar mı normal yarıçap mı olduğu kullanıcı tarafından belirtilir. Açısal tolerans için kısa kenar uzunluğu mm olarak girilir. Referans / teorik kesin ölçüler genel toleranstan hariç tutulabilir. OCR bir çerçevenin semantik anlamını otomatik belirlemez.

Örnekler: Ø8 H7 → +0,015/0 → 8–8,015 mm; 8 h6 → 0/−0,009 → 7,991–8 mm; 8 ve ISO 2768-m → ±0,2 → 7,8–8,2 mm; 8 ±0,1 her genel sınıfta 7,9–8,1 olarak kalır. Bu modül ISO geometrik tolerans çerçevelerini veya tüm geçme sınıflarını çözümleyen bir uygunluk değerlendirmesi değildir.

## Doğrulama kaynakları

- [ISO 286-2:2010 kapsamı](https://www.iso.org/standard/54915.html): delik/mil sınıfları ve limit sapmaları.
- [SKF ISO tolerans dereceleri, Tablo 3](https://cdn.skfmediahub.skf.com/api/public/09468794f5d8f85a/pdf_preview_medium/09468794f5d8f85a_pdf_preview_medium.pdf): IT5–IT9 bant genişlikleri.
- [SKF küresel kaymalı yatak kataloğu, mil toleransları Tablo 3](https://www.skf.com/binaries/pub12/Images/0901d19680154a05-06116_1-EN_tcm_12-122020.pdf): g6/k6/m6/n6 limit sapmaları.
- [ISO 2768-1:1989, tablolar 1–3](https://www.eurotools.eu/sub/eurotools.eu/images/downloads/General_Tolerance_Standard_ISO-2768-1pdf.pdf): doğrusal, kırılmış kenar ve açı değerleri. Çizimin başvurduğu 1989 baskısı kullanılır; farklı bir standardın yerine otomatik uygulanmaz.

Regresyon: `node --test scripts/check-fai.cjs scripts/check-fai-iso.cjs`.
