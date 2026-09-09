const {test}=require('node:test'),assert=require('node:assert/strict'),api=require('../js/quality-documents');
const template=id=>api.templates.find(t=>t.id===id),user={id:'admin',fullName:'Hazırlayan'};
const field=(t,d,label)=>d.values[t.fields.find(f=>f.label===label).key];
test('all 15 sources and each form are connected, with no filled sample defaults',()=>{
 assert.equal(api.documents.length,15);assert.equal(api.templates.length,63);
 for(const t of api.templates){assert.ok(t.tabs.length);assert.ok(api.documents.some(d=>d.id===t.source));assert.ok(t.fields.length||t.tables.length);}
 assert.equal(new Set(api.templates.map(t=>t.id)).size,63);
 assert.ok(api.forTab('compliance_as9100').some(t=>t.id==='EYS-FR-06'));
 assert.ok(!JSON.stringify(api.templates).includes('ÖRNEK SAVUNMA'));
 assert.deepEqual(template('FR-QUA-19').tables[1].columns,['Özellik','Şartname Alt','Şartname Üst','Sertifika','Sonuç']);
 assert.ok(template('FR-QUA-19').fields.some(f=>f.label==='Nihai Karar'));
 assert.ok(template('FR-QUA-19').fields.some(f=>f.label==='Karantina Durumu'));
 assert.equal(api.sourceOptions('downtime')[0][0],'downtimeEvents');
});
test('measurement decisions require complete numeric samples and separate signed deviations',()=>{
 const row={...api.emptyMeasurement(),nominal:'8',lower:'-0,1',upper:'0,1',expected:'2',samples:['7,9','8.1']};
 assert.deepEqual(api.evaluate(row),{lower:7.9,upper:8.1,min:7.9,max:8.1,status:'UYGUN'});
 for(const patch of [{samples:['text','8']},{lower:''},{nominal:''},{expected:''},{samples:['8']},{unit:''},{lower:1,upper:0},{samples:['Infinity','8']}])assert.equal(api.evaluate({...row,...patch}).status,'EKSİK');
 assert.equal(api.evaluate({...row,samples:['8','8.101']}).status,'UYGUN DEĞİL');
 assert.equal(api.evaluate({...row,lower:0,upper:0,samples:['8','8']}).status,'UYGUN');
 assert.equal(api.evaluate({...row,kind:'attribute',attribute:''}).status,'EKSİK');
 assert.equal(api.evaluate({...row,kind:'attribute',attribute:'fail'}).status,'UYGUN DEĞİL');
});
test('source relationships resolve inspection, trace, order and customer without guessing missing links',async()=>{
 const data={qualityInspections:{i:{traceId:'t'}},partTraceability:{t:{orderId:'o',serialNo:'LOT1'}},orders:{o:{code:'WO1',partNo:'P1',revision:'B',sourceSalesOrderId:'s'}},salesOrders:{s:{code:'SO1',customerId:'c'}},customers:{c:{name:'Müşteri'}}};
 const db={getDoc:async(col,id,opts)=>{assert.equal(opts.throwOnError,true);return data[col]?.[id]||null;}};
 const ctx=await api.resolve(db,'qualityInspections','i'),t=template('FR-QUA-18'),d=api.seed(t,ctx,user,'2026-09-09');
 assert.equal(field(t,d,'Müşteri'),'Müşteri');assert.equal(field(t,d,'İş Emri / Lot'),'WO1 / LOT1');assert.equal(field(t,d,'Parça No / Rev.'),'P1 / B');assert.equal(field(t,d,'Hammadde Isı/Şarj No'),'');assert.equal(field(t,d,'Teslim Miktarı'),'');
 assert.equal(ctx.links.length,5);delete data.orders.o;await assert.rejects(api.resolve(db,'qualityInspections','i'),/Bağlı kayıt/);
});
test('production jobCode links to actual order, and correct/wrong seed shift quantities',async()=>{
 const r={jobCode:'WO1',correct:30,wrong:2,shiftLabel:'Sabah',date:'2026-09-09',machine:'K1'};
 const db={getDoc:async()=>r,getAll:async()=>[{id:'o',code:'WO1',partSec:10}]};
 const ctx=await api.resolve(db,'entries','e'),t=template('OPS-FR-07/A'),d=api.seed(t,ctx,user,'2026-09-09');
 assert.equal(field(t,d,'İş Emri'),'WO1');assert.equal(field(t,d,'Uygun'),'30');assert.equal(field(t,d,'Hurda'),'2');assert.equal(field(t,d,'Vardiya'),'Sabah');
 db.getAll=async()=>[{id:'o',code:'WO1'},{id:'other',code:'WO1'}];await assert.rejects(api.resolve(db,'entries','e'),/birden fazla/);
});
test('OCR measurements and immutable revisions retain original source values',()=>{
 const ctx={collection:'faiRecords',record:{id:'f',orderCode:'WO1'},balloon:{toleranceSettings:{unit:'mm'},dimensions:[{no:7,text:'8 ±0.1',nominal:8,lowerDeviation:-.1,upperDeviation:.1}]}};
 const t=template('FR-QUA-21'),d=api.seed(t,ctx,user,'2026-09-09');
 assert.equal(d.measurementRows[0].balloon,'7');assert.equal(d.measurementRows[0].unit,'mm');assert.equal(api.evaluate(d.measurementRows[0]).status,'EKSİK');
 const saved=api.snapshot(t,d,ctx,user);d.measurementRows[0].nominal=99;assert.equal(saved.measurementRows[0].nominal,8);
 const next=api.snapshot(t,d,ctx,user,{previous:{...saved,id:'old'}});assert.equal(next.supersedesId,'old');assert.equal(next.revision,1);assert.equal(saved.revision,0);assert.ok(!saved.source.blocks);
});
test('prints escape user text, retain contract clauses and never claim an electronic approval',()=>{
 for(const t of api.templates){const ctx={collection:'orders',record:{id:'o',code:'<script>oops</script>'}},d=api.seed(t,ctx,user,'2026-09-09');
  if(t.fields.length)d.values[t.fields[0].key]='<img src=x onerror=alert(1)>';
  const r=api.snapshot(t,d,ctx,user),html=api.printHtml(r,{logo:'javascript:alert(1)'});
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<img src=x'));assert.ok(!html.includes('src="javascript:'));assert.ok(html.includes('İmza / onay bekleyen kayıt'));assert.ok(!html.includes('ÖRNEK SAVUNMA'));
 }
 const t=template('HUK-SZ-01');assert.ok(api.renderBlocks(t.blocks).includes('Alan Taraf'));assert.ok(api.renderBlocks(t.blocks).includes('________________'));
});
