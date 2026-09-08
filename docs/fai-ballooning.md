# FAI otomatik ölçü tespiti

Oto Balon önce PDF metnini konumlarıyla okur. Ölçü adayı bulunamazsa tarayıcıda OCR çalıştırır. Metin ve görüntü karışımı PDF'lerde eksik ölçüler için **OCR ile yeniden tara** kullanılabilir. İlk OCR kullanımında motor ve dil dosyaları internetten indirilir; bu seçenek çizimi AI servisine göndermez. **AI ile Ölçü Tespit Et** ayrı bir sunucu hizmetidir.

Algoritma düz sayıları, çapları, yarıçapları, vida ölçülerini, açıları ve aynı satırdaki toleransları aday olarak çıkarır. Farklı konumlardaki aynı değerleri korur. PDF dönüş ve kırpma bilgileri konum hesabına katılır. OCR yatay ve iki dikey yönde çalışır. Boş sonuç önceki çalışmayı değiştirmez; kayıtlı çalışmanın önizlemesi yeniden OCR gerektirmez.

Sonuçlar kontrol gerektiren taslaktır. Sayfa üzerindeki tek başına sayılar, poz numaraları veya tablo değerleri de aday olabilir. Düşük çözünürlük, üst üste yazılmış toleranslar ve geometrik tolerans çerçeveleri otomatik olarak eksiksiz yorumlanmaz. Listeyi teknik resimle karşılaştırın; yanlış satırları silin, eksikleri manuel ekleyin. Algoritmanın güven puanı ölçü doğruluğunun olasılığı değildir.

Doğrulama: `node --test scripts/check-fai.cjs`; backend `python -m unittest discover -s cost-estimator/backend/tests -v`. Tarayıcıda gerçek PDF.js ve Tesseract ile yapay örnek çizimler ayrıca kontrol edildi: tekrarlanan 20, 12.5, M8 x 1.25 ve çizim numarası ayrımı. Müşteri çizimiyle karşılaştırmalı kabul testi henüz yapılmadı.

OCR yapılandırması: [Tesseract.js API](https://github.com/naptha/tesseract.js/blob/master/docs/api.md); kelime konumları için `blocks: true` çıktısı kullanılır.
