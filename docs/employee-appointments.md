# Personel görev tanımı ve görevlendirme çıktısı

## Kullanım

Çalışan Görevlendirme → Personel Görev Tanımları → Yeni Personel Görevlendirmesi.

Çalışanı ve görev tanımını seçin. Bölüm/çalışan sınıfını, bağlı olduğu kişiyi, çalışma yerini ve başlangıç tarihini doldurun. Görev seçimi sorumluluk, yetki, yetkinlik ve performans metinlerini kaynak kitaptan getirir. Makine/sistem, vekâlet, özel şartlar ve kişiye özgü metinler ayrıca düzenlenebilir.

Kaydettiğiniz kaydın **Formu Yazdır** düğmesi A4 çıktı açar. Tarayıcıdan yazdırılabilir veya PDF olarak kaydedilebilir. İşveren/amir ve işçi için tarih ve imza alanları bulunur. Kaydetmek veya yazdırmak imzalı tebliğ anlamına gelmez.

**Yeni Revizyon**, önceki kaydı değiştirmeden yeni bir kayıt oluşturur. Önceki sürüm listede ve çıktıda korunur. Günlük görev atama ve takvim işlemleri mevcut şekilde kullanılmaya devam eder. Buradaki mesleki görev tanımı seçimi uygulamanın kullanıcı yetkilerini değiştirmez.

## Kaynaklar ve kapsam

- `03_ABBA_Is_Talimatlari_ve_Gorev_Tanimlari.docx`: GT-01–GT-10; EYS-TG-01, Rev.00, 29.07.2026.
- `09_Belirsiz_Sureli_Is_Sozlesmesi_ve_Ekleri.docx`: İK-SZ-01, EK-1 Görev Tanımı ve Yetki Formu alanları.

Çıktı bu kaynakların görev metinlerini ve EK-1 alanlarını kurumsal HTML/A4 düzeninde birleştirir; DOCX dosyasının birebir sayfa kopyası değildir. Mesleki görevler, yazılım erişim rolleriyle otomatik eşlenmez. Tüm kalite belgelerinin entegrasyonu tamamlanmış değildir; bu değişiklik personel görevlendirme akışını kapsar.

## Kayıt ve doğrulama

Veriler `employeeAppointments` koleksiyonunda saklanır. Çalışan adı, görev metinleri ve kaynak sürümü kayıt anında kopyalanır. `supersedesId` önceki sürümü bağlar; kayıt revizyonu ve doküman revizyonu ayrı alanlardır. İmzalı dosya yükleme ve elektronik onay bu aşamada yoktur.

Ekran mevcut görev atama yetkisini kullanır; diğer çalışanlar kendi görevlendirmelerini görür ve yazdırır. Bu, istemci ekranı davranışıdır; sunucu erişim kurallarının bağımsız doğrulandığı anlamına gelmez. Canlı Firestore üzerinde okuma/yazma yapılmadı.

Doğrulamalar: `node --test scripts/check-employee-appointments.cjs`, `node scripts/check-main.cjs`; ayrıca sahte veritabanıyla Edge tarayıcısında tablet formu, başarısız kayıt, başarılı kayıt, revizyon geçmişi, çalışan görünümü ve A4 çıktı kontrolü. Örnek görevlendirme tek A4 sayfaya sığdı; uzun metinler gerektiğinde devam sayfasına geçer.
