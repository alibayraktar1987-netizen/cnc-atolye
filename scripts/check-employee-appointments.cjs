const {test}=require('node:test');
const assert=require('node:assert/strict');
const api=require('../js/employee-appointments.js');
const employee={id:'u1',fullName:'Ayşe Yılmaz',status:'active'},actor={id:'a1',fullName:'Hazırlayan'};
const form=()=>({...api.template('GT-08'),employeeId:'u1',department:'Üretim',manager:'Üretim Sorumlusu',workplace:'Atölye',startDate:'2026-09-09',endDate:''});
test('document roles populate exact operator responsibilities and authority',()=>{
 assert.equal(api.roles.length,10);
 const f=form();assert.equal(f.title,'CNC Operatörü');
 assert.equal(f.responsibilities,'Onaylı dokümana göre üretim, proses içi kontrol, kayıt, FOD ve uygunsuzluk bildirimi.');
 assert.equal(f.authority,'Şüpheli durumda makineyi durdurmak; kontrolsüz değişikliği reddetmek.');
});
test('saved record snapshots employee and document text independently of later edits',()=>{
 const f=form(),r=api.buildRecord(f,employee,actor,'2026-09-09T12:00:00Z');
 f.responsibilities='changed';assert.notEqual(r.responsibilities,f.responsibilities);
 assert.equal(r.source.form,'İK-SZ-01 / EK-1');assert.equal(r.source.revision,'00');
 const revision=api.buildRecord({...form(),supersedesId:'old',revision:1},employee,actor);
 assert.equal(revision.supersedesId,'old');assert.equal(revision.revision,1);
 assert.equal(r.revision,0);
});
test('invalid employee, missing required fields and invalid date ranges cannot be saved',()=>{
 for(const change of [{employeeId:'other'},{manager:''},{department:' '},{workplace:''},{startDate:'2026-02-30'},{endDate:'2026-09-08'},{roleCode:'GT-99'}])assert.throws(()=>api.buildRecord({...form(),...change},employee,actor));
 assert.throws(()=>api.buildRecord(form(),{...employee,status:'inactive'},actor));
});
test('print preserves source, signatures and safe user text without an automatic approval',()=>{
 const r={...api.buildRecord({...form(),conditions:'<script>alert(1)</script>\nİkinci satır'},employee,actor),id:'record-1'};
 const html=api.printHtml(r,{logo:'javascript:alert(1)',companyName:'Şirket & Ortakları'});
 assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 assert.ok(html.includes('Şirket &amp; Ortakları'));assert.ok(!html.includes('src="javascript:'));
 for(const str of ['İşveren / Amir','İşçi','GT-08','EYS-TG-01','record-1','@page{size:A4'])assert.ok(html.includes(str));
});
