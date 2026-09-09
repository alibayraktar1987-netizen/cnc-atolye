# FAI otomatik ölçü tespiti

Balonlar ölçü merkezinden ayrı saklanır; ölçüye bağlantı çizgisiyle bağlanır. Yerleştirme yazı kutularını, görüntüdeki koyu alanları ve diğer balonları dikkate alır. Eski çalışmalarda **Balonları boş alanlara yerleştir** düğmesini kullanıp sonucu **Ölçüleri Kaydet** ile saklayın. Çok yoğun çizimlerde elle konum düzeltmesi gerekebilir.

Düz sayısal ölçüler yeniden otomatik aday listesine alınır; düşük güvenli okumalar ayrıca incelenir. `4 x Ø10 ±0.1` tek çağrıdır. Yakın ve hizalı nominal ölçünün yanındaki bir üst ve bir alt işaretli tolerans birleştirilir. Bu kurallar tam bir geometrik tolerans veya ölçü çizgisi çözümleyicisi değildir.

Ölçü tespiti yalnızca tarayıcıda OCR ile yapılır. **OCR Çalışmasını Aç** ve **OCR ile yeniden tara** aynı motoru kullanır. AI düğmesi, AI sunucu uç noktası ve PDF metin katmanından tespit akışı kaldırılmıştır. İlk OCR kullanımında motor ve dil dosyaları internetten indirilir. Kayıtlı çalışmalar korunur.

`8 ±0,1` için nominal 8, üst sapma +0,1, alt sapma −0,1, alt sınır 7,9 ve üst sınır 8,1 ayrı alanlarda gösterilir ve kaydedilir. Asimetrik yazılı toleranslar da hesaplanır. Çizim birimi ve genel tolerans sınıfı çalışma üzerinde seçilebilir. Desteklenen ISO 286 geçmeleri ve ISO 2768-1 genel tabloları otomatik hesaplanır; [kapsam ve kullanım ayrıntıları](fai-iso-tolerances.md) geçerlidir. Yazılı özel tolerans her zaman önceliklidir.

Algoritma düz sayıları, çapları, yarıçapları, vida ölçülerini, açıları ve aynı satırdaki toleransları aday olarak çıkarır. Farklı konumlardaki aynı değerleri korur. PDF dönüş ve kırpma bilgileri konum hesabına katılır. OCR yatay ve iki dikey yönde çalışır. Boş sonuç önceki çalışmayı değiştirmez; kayıtlı çalışmanın önizlemesi yeniden OCR gerektirmez.

Sonuçlar kontrol gerektiren taslaktır. Sayfa üzerindeki tek başına sayılar, poz numaraları veya tablo değerleri de aday olabilir. Düşük çözünürlük, üst üste yazılmış toleranslar ve geometrik tolerans çerçeveleri otomatik olarak eksiksiz yorumlanmaz. Listeyi teknik resimle karşılaştırın; yanlış satırları silin, eksikleri manuel ekleyin. Algoritmanın güven puanı ölçü doğruluğunun olasılığı değildir.

Doğrulama: `node --test scripts/check-fai.cjs`; backend `python -m unittest discover -s cost-estimator/backend/tests -v`. Tarayıcıda gerçek PDF.js ve Tesseract ile yapay örnek çizimler ayrıca kontrol edildi: tekrarlanan 20, 12.5, M8 x 1.25 ve çizim numarası ayrımı. Müşteri çizimiyle karşılaştırmalı kabul testi henüz yapılmadı.

OCR yapılandırması: [Tesseract.js API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md); kelime konumları için `blocks: true` çıktısı kullanılır.
