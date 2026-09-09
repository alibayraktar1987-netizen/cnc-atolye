(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./quality-document-catalog.js'):root.QualityDocumentCatalog);if(typeof module==='object'&&module.exports)module.exports=api;else root.QualityDocuments=api;})(typeof window!=='undefined'?window:globalThis,function(catalog){
'use strict';
const fields=labels=>labels.map((label,i)=>({key:'f'+i,label}));
const table=(title,columns,rows=[])=>({title,columns,rows:rows.length?rows:[columns.map(()=>'')]});
const stationTabs=['giris','entryrecords','orders','planning'];
const shared=['Tarih','Vardiya','Makine','Operatör','İş Emri','Parça No / Rev.'];
const extra=[
 {id:'FR-QUA-21',code:'FR-QUA-21',source:'11',revision:'00',title:'Ölçüm ve Nihai Kontrol Raporu',kind:'measurement',tabs:['quality_fai','quality_inspect','measurement','orders'],fields:fields(['Rapor No','Tarih','Müşteri','Sipariş No','İş Emri / Lot','Parça Adı','Parça No','Revizyon','Malzeme / Isı No','Teknik Resim','Kontrol Planı','Operasyon','Kontrol Eden','Ortam Sıcaklığı','Üretilen / Kontrol']),tables:[]},
 {id:'OPS-FR-07/A',code:'OPS-FR-07/A',source:'15',relatedSources:['14'],revision:'01',title:'Tezgâh Yanı Vardiya Üretim Takip',tabs:stationTabs,fields:fields([...shared,'Plan Adet','Çevrim sn','Malzeme / Isı No','Program / Rev.','İlk Parça Onayı','Başlangıç Sayaç','Uygun','Hurda','Rework','Duruş dk','NCR / Sapma No','Sonraki Vardiyaya Devir Notu']),tables:[table('Saatlik üretim',['Saat','Sayaç Baş.','Sayaç Son','Üretim','Uygun','Hurda','Duruş dk','Kontrol','Duruş Nedeni','Not / Ölçüm / Takım Değişimi'])]},
 {id:'BAK-FR-01/A',code:'BAK-FR-01/A',source:'15',relatedSources:['14'],revision:'01',title:'Makine Günlük Kontrol Formu',tabs:[...stationTabs,'downtime','machineprep'],fields:fields(['Tarih','Makine','Vardiya','Kontrol Eden','Genel Sonuç','Bulgu / Bakım Kayıt No']),tables:[table('Günlük kontrol',['Kontrol Noktası','OK / Aksiyon / N/A','Bulgu / Aksiyon No'],['Kesme yağı / soğutma sıvısı seviyesi uygun','Merkezi / otomatik yağlama seviyesi uygun','Hava basıncı normal, kaçak yok','Hidrolik / yağ kaçağı yok','Kapı, switch ve koruyucular çalışıyor','Ayna / pens / kovan temiz ve güvenli','Çubuk sürücü normal çalışıyor','Talaş konveyörü ve talaş çıkışı açık','Mist collector / emiş sistemi çalışıyor','Alarm / uyarı mevcut değil','Takım ve tutucular güvenli','Ölçüm cihazları yerinde ve korumalı','Zemin temiz, kayma / FOD riski yok','Yangın / pano önü kapalı değil','Müşteri resmi ve teknik veri açıkta değil'].map(v=>[v,'','']))]},
 {id:'OPS-FR-07/B',code:'OPS-FR-07/B',source:'15',relatedSources:['14'],revision:'01',title:'Vardiya Devir Teslim Formu',tabs:stationTabs,fields:fields(['Tarih','Devreden Vardiya','Devralan Vardiya','Devreden Sorumlu','Devralan Sorumlu','Ortak Devir Notları / Plan Değişikliği / Kritik Risk']),tables:[table('Devir kayıtları',['Makine','İş Emri','Parça No / Rev.','Üretilen','Kalan','Program / Rev.','Takım / Ofset','Malzeme / Çubuk','Kalite / NCR','Devir Notu / Öncelik / Arıza'])]},
 {id:'OPS-FR-07/C',code:'OPS-FR-07/C',source:'15',relatedSources:['14'],revision:'01',title:'Günlük Üretim ve Kalite Saha Özeti',tabs:[...stationTabs,'rapor'],fields:fields(['Tarih','Hazırlayan','Günlük Öncelik / Müşteri','Kalite Sorumlusu','Günün Açık Aksiyonları / Teslimat Riski']),tables:[table('Makine özeti',['Makine','Plan','Uygun','Hurda','Rework','Duruş dk','İş Emri','İlk Parça','Kalite Durumu','Açıklama / Aksiyon'])]},
 {id:'OPS-FR-07/D',code:'OPS-FR-07/D',source:'15',relatedSources:['14'],revision:'01',title:'Günlük 5S / FOD / Tesis Güvenlik Formu',tabs:[...stationTabs,'compliance_security'],fields:fields(['Tarih','Vardiya','Kontrol Eden','Tesis / Alan','Olay / Aksiyon No','Bildirilen Kişi','Kapanış Hedefi','Açıklama']),tables:[table('Alan kontrolü',['Alan','Kontrol Noktası','Uygun / Aksiyon / N/A','Bulgu / Aksiyon / Sorumlu'],[['Genel İmalat','Yaya yolları ve acil çıkışlar açık','',''],['Genel İmalat','Zeminde yağ / talaş kaynaklı kayma riski yok','',''],['Genel İmalat','FOD / yabancı madde / sahipsiz parça yok','',''],['Makine Alanı','Takım, ölçüm cihazı ve aparat güvenli yerde','',''],['Kalite','Uygunsuz ürün tanımlı karantina alanında','',''],['Teknik Veri','Müşteri resmi / programı açıkta veya yetkisiz cihazda değil','',''],['Teknik Veri','Bilgisayar ve terminaller kilitli / oturum kapalı','',''],['Mamul / Depo','Savunma ve müşteri malı kontrollü alanda','',''],['Hurda','Kontrollü hurda / uygunsuz parça erişime kapalı','',''],['Kimyasal','Yağ / kimyasal kapları kapalı, etiketli, sızıntısız','',''],['Yangın','Yangın ekipmanı ve elektrik panosu önleri açık','',''],['Tesis Güvenliği','Kontrollü kapı ve alanlar kapalı / kilitli','',''],['Tesis Güvenliği','Ziyaretçi / emanet / geçiş kaydında açık husus yok','','']])]}
];
const templates=[...catalog.templates,...extra].map(t=>({...t,kind:t.kind||'form'}));
for(const t of templates){
 if(['EYS-FR-06','OPS-FR-08'].includes(t.id))t.tabs=[...t.tabs,'compliance_as9100','quality_inspect'];
 if(['KLT-FR-04','KLT-FR-05'].includes(t.id))t.tabs=[...t.tabs,'tools'];
 if(t.id==='OPS-FR-07/B')t.signatures=['Devreden','Devralan','Vardiya sorumlusu'];
 if(t.id==='OPS-FR-07/A')t.signatures=['Operatör','Vardiya sorumlusu','Kalite (gerekiyorsa)'];
}
const aliases={quality:'quality_trace',compliance:'compliance_qms',closedloop:'measurement',purchase_requests:'purchase'};
const normalizeTab=t=>aliases[t]||t;
function forTab(tab){tab=normalizeTab(tab);return templates.filter(t=>t.tabs.includes(tab));}
const sources={
 orders:[['orders','İş emri']],planning:[['orders','İş emri']],sales:[['salesOrders','Satış siparişi'],['orders','İş emri']],quotes:[['salesQuotes','Teklif']],customers:[['customers','Müşteri']],
 purchase:[['purchaseOrders','Satın alma siparişi'],['purchaseRequests','Satın alma talebi']],purchase_suppliers:[['suppliers','Tedarikçi']],
 warehouse:[['warehouseMoves','Depo hareketi'],['materials','Malzeme']],materials:[['materials','Malzeme']],
 quality_trace:[['partTraceability','İz kaydı'],['orders','İş emri']],quality_inspect:[['qualityInspections','Muayene'],['orders','İş emri']],quality_fai:[['faiRecords','FAI kaydı'],['faiBalloonRuns','OCR balonlama'],['orders','İş emri']],
 measurement:[['measurementFeedback','Ölçüm geri bildirimi'],['orders','İş emri']],tools:[['toolStock','Takım / cihaz']],
 giris:[['entries','Üretim kaydı'],['orders','İş emri']],entryrecords:[['entries','Üretim kaydı']],rapor:[['entries','Üretim kaydı']],
 downtime:[['downtimeEvents','Duruş / bakım']],machineprep:[['machineConnectors','Tezgâh']],users:[['users','Çalışan']],assignments:[['users','Çalışan'],['employeeTasks','Görev']],progenergy:[['orders','İş emri']],
 compliance_qms:[['complianceRecords','Uyum kaydı']],compliance_as9100:[['complianceRecords','DÖF kaydı']],compliance_eydep:[['complianceRecords','Yetkinlik / risk / tetkik']],compliance_security:[['complianceRecords','Güvenlik kaydı']]
};
function sourceOptions(tab){return sources[normalizeTab(tab)]||[];}
function label(row){return [row.code||row.recordNo||row.orderCode||row.fullName||row.name||row.materialCode||row.id,row.title||row.partNo||row.machine||row.lotNo].filter(Boolean).join(' · ');}
const fold=s=>String(s||'').toLocaleLowerCase('tr').replace(/ı/g,'i').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const copy=v=>JSON.parse(JSON.stringify(v));
const join=(...vs)=>vs.filter(v=>v!==undefined&&v!==null&&v!=='').join(' / ');
function seed(t,context,user,today){
 const r=context.record||{},o=context.order||{},tr=context.trace||{},customer=context.customer||{},material=context.material||{},sale=context.sale||{};
 const orderCode=o.code||r.orderCode||r.jobCode||'',partNo=o.partNo||r.partNo||'',rev=o.revision||tr.revision||r.revision||'';
 const lot=r.lotNo||tr.serialNo||r.serialNo||'',person=context.collection==='users'?(r.fullName||r.username||''):'';
 const heat=r.heatNo||r.heatNumber||tr.heatNo||'';
 const map={
  tarih:r.date||String(r.timestamp||r.createdAt||today).slice(0,10),duzenlemetarihi:today,kabultarihi:r.date||today,
  isemri:orderCode,isemriproje:orderCode,isemrilot:join(orderCode,lot),abbaisemrilot:join(orderCode,lot),musteriisemri:join(customer.name||sale.customerName,orderCode),
  musteri:customer.name||customer.companyName||sale.customerName||o.customerName||r.customerName||'',musterisiparisno:sale.code||'',siparisno:sale.code||'',
  parcano:partNo,parcaadi:o.partName||r.partName||'',revizyon:rev,parcanorev:join(partNo,rev),parcarevizyon:join(partNo,rev),
  makine:r.machine||tr.machine||'',operator:r.operatorName||context.operator?.fullName||'',vardiya:r.shiftLabel||r.shift||'',
  malzeme:material.name||o.material||r.materialName||'',malzemetanimi:material.name||r.materialName||'',malzemekalitesi:material.grade||'',
  malzemeisino:join(material.name||r.materialName,heat),isisarjno:heat,hammaddeisisarjno:heat,depolotno:lot,miktar:r.qty??'',planadet:o.qty??o.targetQty??'',
  uygun:r.correct??r.goodQty??r.produced??'',hurda:r.wrong??r.scrapQty??r.scrap??'',rework:r.reworkQty??'',durusdk:r.durationMin??r.downtimeMinutes??'',cevrimsn:r.partSec??o.partSec??'',
  programrev:tr.programVersion||r.programCode||'',tedarikci:context.supplier?.name||r.supplierName||'',
  sorumlu:r.owner||user.fullName||'',hazirlayan:user.fullName||'',kontroleden:r.inspectorName||user.fullName||'',
  calisanadisoyadi:person,isciadisoyadi:person,adisoyad:person,personel:person,gorevunvan:r.jobTitle||'',
  sirketadresi:context.company?.companyAddress||'',musteriisortagiunvani:customer.name||r.name||'',
  aciklama:r.note||r.details||r.detail||'',personelrol:join(person,r.jobTitle),
  urunrevizyon:join(partNo,rev),urun:partNo,resimrevizyon:join(partNo,rev),
  lotmiktar:join(lot,r.qty),urunlotmiktar:join(partNo,lot,r.qty),malzemelot:join(material.name||r.materialName,lot),malzemelotu:lot,
  tarihvardiya:join(r.date||today,r.shift),programrevizyonu:tr.programVersion||r.programCode||'',cncprogram:tr.programVersion||r.programCode||'',
  olcumsonucu:r.measurements||'',olcum:r.measurements||'',gercekdeger:r.actual??'',
  baslangicbitis:join(r.startAt,r.endAt),arizabakim:r.reason||r.note||'',
  musterisiparis:join(customer.name||sale.customerName,sale.code),tedarikcikapsam:context.supplier?.name||r.name||'',
  problemvekapsam:r.details||'',uygunsuzluk:r.details||'',etkinlik:r.effectiveness||'',kanit:r.evidence||'',
  olay:r.title||'',olaytarih:join(r.title,r.date),olcumcihazi:r.deviceNo||'',malzemekodu:material.code||r.materialCode||''
 };
 const values={};for(const f of t.fields){const norm=fold(f.label),parts=f.label.split(' — ');values[f.key]=String(map[norm]??map[fold(parts[parts.length-1])]??'');}
 let measurementRows=[];
 if(t.kind==='measurement'){
  measurementRows=(context.balloon?.dimensions||[]).map((d,i)=>({balloon:String(d.no||d.number||i+1),characteristic:d.text||d.label||'',kind:'numeric',nominal:d.nominal??'',lower:d.lowerDeviation??'',upper:d.upperDeviation??'',unit:d.unit||context.balloon?.toleranceSettings?.unit||'',expected:'',samples:['','','','',''],device:'',attribute:'',note:d.toleranceBasis||''}));
  if(!measurementRows.length&&context.collection==='measurementFeedback')measurementRows=[{...emptyMeasurement(),nominal:r.target??'',lower:r.tolerance!==undefined?-Math.abs(Number(r.tolerance)):'',upper:r.tolerance??'',samples:[r.actual??'','','','',''],characteristic:r.toolCode||'Ölçüm'}];
  if(!measurementRows.length)measurementRows=[emptyMeasurement()];
 }
 const tables=copy(t.tables||[]);
 if(t.id.startsWith('MATRIX-')&&tables[0]?.rows[0])tables[0].rows[0]=tables[0].columns.map((col,i)=>tables[0].rows[0][i]||String(map[fold(col)]??''));
 return {values,tables,measurementRows};
}
function emptyMeasurement(){return {balloon:'',characteristic:'',kind:'numeric',nominal:'',lower:'',upper:'',unit:'mm',expected:'',samples:['','','','',''],device:'',attribute:'',note:''};}
function number(v){if(typeof v==='number')return Number.isFinite(v)?v:null;const s=String(v??'').trim().replace(',','.');return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)&&Number.isFinite(Number(s))?Number(s):null;}
function evaluate(row){
 if(row.kind==='attribute')return {status:row.attribute==='pass'?'UYGUN':row.attribute==='fail'?'UYGUN DEĞİL':'EKSİK',lower:'',upper:'',min:'',max:''};
 const nominal=number(row.nominal),lower=number(row.lower),upper=number(row.upper),expected=number(row.expected),samples=(row.samples||[]).filter(s=>String(s??'').trim()!=='').map(number);
 const bounds=nominal!==null&&lower!==null&&upper!==null&&lower<=upper;
 const round=v=>Number(v.toFixed(9));
 const out={lower:bounds?round(nominal+lower):'',upper:bounds?round(nominal+upper):'',min:samples.length&&!samples.includes(null)?Math.min(...samples):'',max:samples.length&&!samples.includes(null)?Math.max(...samples):'',status:'EKSİK'};
 if(!bounds||!row.unit||expected===null||!Number.isInteger(expected)||expected<1||samples.length!==expected||samples.includes(null))return out;
 out.status=out.min>=out.lower-1e-9&&out.max<=out.upper+1e-9?'UYGUN':'UYGUN DEĞİL';return out;
}
async function resolve(db,collection,id){
 const record=await db.getDoc(collection,id,{throwOnError:true});if(!record)throw Error('İlişkili kayıt bulunamadı.');
 const c={collection,record:{...record,id},links:[{collection,id}]};
 async function read(key,col,keyId){if(!keyId)return;const value=await db.getDoc(col,keyId,{throwOnError:true});if(!value)throw Error('Bağlı kayıt bulunamadı: '+col);c[key]={...value,id:keyId};c.links.push({collection:col,id:keyId});}
 if(collection==='partTraceability')c.trace=c.record;else await read('trace','partTraceability',record.traceId);
 if(collection==='orders')c.order=c.record;else await read('order','orders',record.orderId||c.trace?.orderId);
 if(!c.order&&record.jobCode){
  const matches=(await db.getAll('orders',{throwOnError:true})).filter(o=>o.code===record.jobCode);
  if(matches.length>1)throw Error('İş emri kodu birden fazla kayıtla eşleşiyor.');
  if(matches.length===1){c.order=matches[0];c.links.push({collection:'orders',id:matches[0].id});}
 }
 if(collection==='salesOrders')c.sale=c.record;else await read('sale','salesOrders',c.order?.sourceSalesOrderId||record.sourceSalesOrderId);
 if(collection==='customers')c.customer=c.record;else await read('customer','customers',c.sale?.customerId||c.order?.customerId||record.customerId);
 if(collection==='materials')c.material=c.record;else await read('material','materials',record.materialId);
 if(collection==='suppliers')c.supplier=c.record;else await read('supplier','suppliers',record.supplierId);
 if(collection==='faiBalloonRuns')c.balloon=c.record;else await read('balloon','faiBalloonRuns',record.balloonRunId);
 return c;
}
function snapshot(t,draft,context,user,{previous=null,date=new Date().toISOString()}={}){
 if(!context?.record?.id||!context.collection)throw Error('Önce ilişkili kayıt seçin.');
 if(!user?.id)throw Error('Kullanıcı bilgisi eksik.');
 const sourceDoc=catalog.documents.find(d=>d.id===t.source);
 return {templateId:t.id,template:copy(t),source:{id:sourceDoc.id,file:sourceDoc.file,title:sourceDoc.title},sourceCollection:context.collection,sourceId:context.record.id,sourceLabel:label({...context.record,orderCode:context.record.orderCode||context.order?.code}),links:copy(context.links||[{collection:context.collection,id:context.record.id}]),values:copy(draft.values),tables:copy(draft.tables||[]),measurementRows:copy(draft.measurementRows||[]),relatedDocuments:copy(draft.relatedDocuments||[]),createdAt:date,createdBy:user.id,createdByName:user.fullName||user.id,revision:previous?(previous.revision||0)+1:0,supersedesId:previous?.id||'',status:'draft'};
}
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderBlocks(blocks,values={}){
 const fill=text=>escape(String(text).replace(/\{\{([^}]+)\}\}/g,(_,key)=>values[key]||'________________'));
 return blocks.map(b=>b.text?`<p>${fill(b.text)}</p>`:`<table><tbody>${b.rows.map(row=>`<tr>${row.map(c=>`<td>${fill(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`).join('');
}
function printHtml(record,{companyName='ABBA TEKNOLOJİ',logo=''}={}){
 const t=record.template,e=escape,wide=t.kind==='measurement'||(record.tables||[]).some(tb=>tb.columns.length>6);
 const asset=/^(https?:\/\/|data:image\/(?:png|jpeg|webp|gif|svg\+xml)[;,])/i.test(logo)?logo:'';
 const pairs=t.kind==='measurement'?3:2,fieldRows=[];
 for(let i=0;i<t.fields.length;){
  const first=t.fields[i],value=String(record.values[first.key]||'');
  if(value.length>100){fieldRows.push(`<tr><th style="width:${40/pairs}%">${e(first.label)}</th><td colspan="${pairs*2-1}">${e(value)}</td></tr>`);i++;continue;}
  const cells=[];
  for(let j=0;j<pairs&&i<t.fields.length;j++,i++){const f=t.fields[i];cells.push(`<th style="width:${40/pairs}%">${e(f.label)}</th><td style="width:${60/pairs}%">${e(record.values[f.key]||'________________')}</td>`);}
  fieldRows.push('<tr>'+cells.join('')+'</tr>');
 }
 let content=t.kind==='contract'?renderBlocks(t.blocks,record.values):`<table class="fields"><tbody>${fieldRows.join('')}</tbody></table>`;
 for(const tb of record.tables||[]){const widths=tb.columns[0]==='Kontrol Noktası'&&tb.columns.length===4?[50,8,8,34]:null;content+=`<h2>${e(tb.title)}</h2><table>${widths?'<colgroup>'+widths.map(w=>`<col style="width:${w}%">`).join('')+'</colgroup>':''}<thead><tr>${tb.columns.map(c=>`<th>${e(c)}</th>`).join('')}</tr></thead><tbody>${tb.rows.map(r=>`<tr>${r.map(v=>`<td>${e(v)||'&nbsp;'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
 if(t.kind==='measurement'){
  const rows=record.measurementRows||[],results=rows.map(evaluate),status=!rows.length||results.some(r=>r.status==='EKSİK')?'EKSİK — KARAR VERİLEMEZ':results.some(r=>r.status==='UYGUN DEĞİL')?'UYGUN DEĞİL':'UYGUN';
  content+='<h2>Karakteristik ve numune ölçümleri</h2><table><colgroup>'+[4,12,4,6,6,6,6,6,5,12,6,6,9,12].map(w=>'<col style="width:'+w+'%">').join('')+'</colgroup><thead><tr>'+['Balon','Karakteristik','Birim','Nominal','Alt sapma','Üst sapma','Alt limit','Üst limit','Numune','Ölçümler','Min.','Maks.','Sonuç','Cihaz / Not'].map(c=>'<th>'+c+'</th>').join('')+'</tr></thead><tbody>'+rows.map((r,i)=>{const a=results[i];return '<tr>'+[r.balloon,r.characteristic,r.unit,r.kind==='attribute'?'Nitel':r.nominal,r.lower,r.upper,a.lower,a.upper,r.expected,(r.samples||[]).filter(v=>String(v??'').trim()!=='').join(' / '),a.min,a.max,a.status,join(r.device,r.note)].map(v=>'<td>'+e(v)+'</td>').join('')+'</tr>';}).join('')+'</tbody></table><h2>Hesaplanan sonuç: '+e(status)+'</h2><p>Nihai serbest bırakma, yetkili kontrol ve imzasına tabidir.</p>';
 }
 if(record.relatedDocuments?.length)content+='<h2>Bağlı evraklar ve sertifika kayıtları</h2><ul>'+record.relatedDocuments.map(d=>'<li>'+e(d.label)+' · '+e(d.id)+' · Rev.'+e(d.revision)+'</li>').join('')+'</ul>';
 content+=(t.notes||[]).map(n=>'<p>'+e(n)+'</p>').join('');
 return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${e(t.code)} — ${e(t.title)}</title><style>@page{size:A4 ${wide?'landscape':'portrait'};margin:12mm}*{box-sizing:border-box}body{font:11px/1.45 Arial,sans-serif;color:#183248;margin:0}header{display:flex;gap:15px;align-items:center;border-bottom:3px solid #183248;padding-bottom:10px}header img{width:85px;max-height:55px;object-fit:contain}h1{font-size:19px;margin:5px 0}h2{font-size:13px;break-after:avoid}p{white-space:pre-wrap;overflow-wrap:anywhere}table{width:100%;border-collapse:collapse;table-layout:fixed;margin:10px 0}th,td{border:1px solid #b9c6d0;padding:6px;vertical-align:top;text-align:left;white-space:pre-wrap;overflow-wrap:anywhere}th{background:#edf2f6}.fields th{width:30%}tr{break-inside:avoid}thead{display:table-header-group}.meta{font-size:10px;margin:9px 0}.signatures{display:flex;gap:12px;break-inside:avoid;margin-top:16px}.signatures div{flex:1;border:1px solid #b9c6d0;padding:10px;min-height:100px}.toolbar{padding:10px;background:#eef3f6;margin-bottom:10px}.toolbar button{padding:10px 15px}footer{font-size:9px;margin-top:12px}@media print{.toolbar{display:none}}</style></head><body><div class="toolbar"><button onclick="window.print()">Yazdır / PDF Kaydet</button></div><header>${asset?`<img src="${e(asset)}" alt="Şirket logosu">`:''}<div><strong>${e(companyName)}</strong><h1>${e(t.title)}</h1><div>${e(t.code)} · Kaynak revizyon: ${e(t.revision)}</div></div></header><div class="meta">Kayıt: ${e(record.id||'Önizleme')} · Rev.${e(record.revision||0)} · Tarih: ${e(String(record.createdAt||'').slice(0,10))}<br>İlişkili kayıt: ${e(record.sourceLabel)} · Önceki sürüm: ${e(record.supersedesId||'—')}<br>İmza / onay bekleyen kayıt · Kaynak: ${e(record.source?.file||'')}</div>${content}${t.kind==='contract'?'':'<div class="signatures">'+(t.signatures||['Hazırlayan','Kontrol Eden','Onaylayan / Yetkili']).map(title=>'<div>'+e(title)+'<p>Ad Soyad:</p>Tarih / İmza:</div>').join('')+'</div>'}<footer>Bu çıktı tek başına elektronik onay veya imzalı sertifika değildir. Orijinal sertifikalar ve ilgili kanıtlar kayıtla birlikte muhafaza edilir.</footer></body></html>`;
}
return {documents:catalog.documents,templates,forTab,sourceOptions,label,seed,resolve,snapshot,emptyMeasurement,evaluate,printHtml,renderBlocks,escape,normalizeTab};
});
