(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.EmployeeAppointments=api;})(typeof window!=="undefined"?window:globalThis,function(){
"use strict";
const roles=[
  {
    "code": "GT-01",
    "title": "Genel Müdür",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Yönetim sistemi etkinliği, politika, kaynak, risk kabulü, müşteri ve mevzuat sorumluluğu.",
    "authority": "Sistemi onaylamak; kalite ve güvenlik sorumlularına bağımsız erişim sağlamak; kritik sevkiyat/güvenlik kararlarını almak.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-02",
    "title": "Kalite Yönetim Temsilcisi ve Kalite Sorumlusu",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "AS9100 sistem koordinasyonu, kontrol, kalibrasyon, tetkik, uygunsuzluk ve serbest bırakma.",
    "authority": "Sevkiyatı durdurmak; uygunsuz ürünü karantinaya almak; üst yönetime doğrudan raporlamak.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-03",
    "title": "Üretim Sorumlusu/Ustabaşı",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Planın uygulanması, setup, proses kontrolü, takım, vardiya ve bakım koordinasyonu.",
    "authority": "Uygun olmayan prosesi durdurmak; yetkin operatör görevlendirmek.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-04",
    "title": "Planlama/Satış Sorumlusu",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Teklif/sözleşme gözden geçirme, iş emri, kapasite ve müşteri iletişimi.",
    "authority": "Belirsiz şartta taahhüdü durdurmak ve yazılı açıklama istemek.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-05",
    "title": "Satın Alma Sorumlusu",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Onaylı tedarikçi, satın alma şartları, dış proses ve performans.",
    "authority": "Onaysız kaynaktan alımı durdurmak; tedarikçi DÖF açmak.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-06",
    "title": "Tesis Güvenlik Koordinatörü",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Tesis, personel, ziyaretçi, proje ve gizlilik dereceli varlık güvenliği.",
    "authority": "Yetkisiz erişimi durdurmak; güvenlik olayını eskale etmek; kontrollü alan erişimini askıya almak.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-07",
    "title": "Bilgi Güvenliği Sorumlusu",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Hesaplar, erişim, yedekleme, olay, teknik veri ve CNC aktarım güvenliği.",
    "authority": "Hesabı/sistemi geçici izole etmek; olay kanıtını korumak.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-08",
    "title": "CNC Operatörü",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Onaylı dokümana göre üretim, proses içi kontrol, kayıt, FOD ve uygunsuzluk bildirimi.",
    "authority": "Şüpheli durumda makineyi durdurmak; kontrolsüz değişikliği reddetmek.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-09",
    "title": "CNC Programcı/Proses Mühendisi",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "CAM, rota, takım, fikstür, proses riskleri ve program doğrulama.",
    "authority": "Programı yayınlamak/geri çekmek; yeniden doğrulama istemek.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  },
  {
    "code": "GT-10",
    "title": "Kalite Kontrol Personeli",
    "reporting": "Organizasyon şeması ve vekâlet matrisine göre.",
    "responsibilities": "Giriş, ilk parça, proses, son kontrol ve ölçüm kayıtları.",
    "authority": "Uygunsuz ürünü reddetmek; cihazı kullanımdan çekmek; serbest bırakma yetkisi verilmişse onaylamak.",
    "competency": "Göreve uygun eğitim/deneyim; AS9100, ürün güvenliği, etik, FOD ve bilgi güvenliği farkındalığı; rol bazlı uygulamalı yetkinlik.",
    "performance": "İlgili süreç KPI’ları, kayıt doğruluğu, zamanında aksiyon ve uygunsuzluk tekrar oranı.",
    "deputy": "Yetkinlik matrisiyle önceden atanmış ve yetkilendirilmiş kişi."
  }
];
const source={code:'EYS-TG-01',revision:'00',date:'2026-07-29',form:'İK-SZ-01 / EK-1',title:'Görev Tanımı ve Yetki Formu'};
const fields=[['title','Görev / Unvan'],['department','Bölüm / Çalışan sınıfı'],['manager','Bağlı olduğu kişi'],['workplace','Asıl çalışma yeri'],['responsibilities','Temel görevler'],['equipment','Kullanacağı makine / sistem'],['authority','Kalite ve güvenlik yetkileri'],['competency','Asgari yetkinlik'],['performance','Performans'],['deputy','Vekâlet / yedek'],['conditions','Özel şartlar']];
function template(code){const role=roles.find(r=>r.code===code);if(!role)throw Error('Görev tanımı seçin.');return {...role,roleCode:role.code,manager:'',department:'',workplace:'',equipment:'',deputy:'',conditions:''};}
function buildRecord(form,employee,actor,now=new Date().toISOString()){
 if(!actor||!actor.id)throw Error('Kullanıcı bilgisi eksik.');
 if(!employee||employee.status!=='active'||employee.id!==form.employeeId)throw Error('Aktif çalışan seçin.');
 if(!roles.some(r=>r.code===form.roleCode))throw Error('Görev tanımı seçin.');
 const out={};for(const [key] of fields)out[key]=String(form[key]||'').trim();
 for(const key of ['title','department','manager','workplace','responsibilities','authority'])if(!out[key])throw Error(fields.find(f=>f[0]===key)[1]+' zorunludur.');
 const validDate=v=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
 if(!validDate(form.startDate||''))throw Error('Geçerli başlangıç tarihi girin.');
 if(form.endDate&&(!validDate(form.endDate)||form.endDate<form.startDate))throw Error('Bitiş tarihi başlangıçtan önce olamaz ve geçerli olmalıdır.');
 return {...out,employeeId:employee.id,employeeName:employee.fullName||employee.username||employee.id,roleCode:form.roleCode,startDate:form.startDate,endDate:form.endDate||'',source:{...source},createdBy:actor.id,createdByName:actor.fullName||actor.id,createdAt:now,status:'issued',supersedesId:String(form.supersedesId||''),revision:Math.max(0,Number(form.revision)||0)};
}
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function printHtml(record,{logo='',companyName='ABBA TEKNOLOJİ'}={}){
 const e=escape,s=record.source||{},safeLogo=/^(https?:\/\/|data:image\/(png|jpeg|webp|gif|svg\+xml)[;,])/i.test(logo)?logo:'';
 const row=(label,value)=>`<tr><th>${e(label)}</th><td>${e(value||'—')}</td></tr>`;
 return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${e(record.employeeName)} — Görev Tanımı</title><style>
 @page{size:A4;margin:13mm}*{box-sizing:border-box}body{font:11px/1.45 Arial,sans-serif;color:#182e43;margin:0}header{display:flex;align-items:center;gap:16px;border-bottom:3px solid #18364d;padding-bottom:12px;margin-bottom:12px}header img{width:90px;max-height:55px;object-fit:contain}h1{font-size:18px;margin:5px 0}h2{font-size:13px}table{border-collapse:collapse;width:100%;table-layout:fixed;margin:10px 0}th,td{border:1px solid #b9c6d0;padding:7px 9px;vertical-align:top;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere}th{width:29%;background:#edf2f6}tr{break-inside:avoid}.meta{font-size:10px;color:#42576b}.signatures{display:flex;gap:18px;break-inside:avoid;margin-top:18px}.signature{flex:1;border:1px solid #b9c6d0;padding:12px;min-height:115px}footer{margin-top:14px;font-size:9px;color:#53677a}.toolbar{padding:12px;background:#edf2f6;margin-bottom:15px}.toolbar button{padding:10px 18px;cursor:pointer}@media print{.toolbar{display:none}thead{display:table-header-group}}</style></head><body>
 <div class="toolbar"><button onclick="window.print()">Yazdır / PDF kaydet</button> İmzalı nüshayı personel dosyasında saklayın.</div>
 <header>${safeLogo?`<img src="${e(safeLogo)}" alt="Şirket logosu">`:''}<div><strong>${e(companyName)}</strong><h1>GÖREV TANIMI VE YETKİ FORMU</h1><div class="meta">${e(s.form)} · ${e(record.roleCode)} · Kaynak revizyon: ${e(s.revision)}</div></div></header>
 <div class="meta">Kayıt no: ${e(record.id)} · Kayıt revizyonu: ${e(record.revision)}${record.supersedesId?` · Önceki kayıt: ${e(record.supersedesId)}`:''}<br>Kaynak: ${e(s.code)} / ${e(s.date)} · Düzenleme: ${e(String(record.createdAt||'').slice(0,10))}</div>
 <table><tbody>${row('Çalışan',record.employeeName)}${row('Başlangıç / Bitiş',record.startDate+' / '+(record.endDate||'Süresiz'))}${fields.map(([k,label])=>row(label,record[k])).join('')}</tbody></table>
 <div class="signatures"><div class="signature"><strong>İşveren / Amir</strong><p>Ad Soyad / Unvan: ${e(record.manager)}</p><p>Tarih:</p>İmza / Kaşe:</div><div class="signature"><strong>İşçi</strong><p>Ad Soyad: ${e(record.employeeName)}</p><p>Tarih:</p>İmza:</div></div>
 <footer>Hazırlayan: ${e(record.createdByName)}. Bu çıktı elektronik imza veya imzalı tebliğ kaydı değildir. İmza alanları ilgili kişiler tarafından doldurulur.</footer></body></html>`;
}
return {roles,source,fields,template,buildRecord,printHtml};
});
