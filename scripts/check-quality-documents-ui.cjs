const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{chromium}=require('playwright'),babel=require('@babel/core');
const html=fs.readFileSync('index.html','utf8'),source=html.match(/<script id="factorab-app-source" type="text\/plain">([\s\S]*?)<\/script>/)[1].replace('ReactDOM.createRoot(document.getElementById("root")).render(<App/>);','');
const output=process.env.CNC_AUDIT_OUTPUT||path.join(require('os').tmpdir(),'cnc-quality-document-check');fs.mkdirSync(output,{recursive:true});
const code=babel.transformSync(source,{presets:[[require.resolve('@babel/preset-react'),{runtime:'classic'}]],configFile:false,babelrc:false}).code;
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true}),p=await browser.newPage({viewport:{width:820,height:1180}}),errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.route('**/*',r=>r.request().isNavigationRequest()?r.fulfill({contentType:'text/html',body:'<div id="root"></div>'}):r.abort());await p.goto('http://audit.local/');
 for(const pkg of ['react','react-dom'])await p.addScriptTag({path:path.join(path.dirname(require.resolve(pkg+'/package.json')),'umd',pkg+'.development.js')});
 for(const f of ['quality-document-catalog','quality-documents','employee-appointments'])await p.addScriptTag({path:path.resolve('js/'+f+'.js')});
 await p.addStyleTag({content:html.match(/<style>([\s\S]*?)<\/style>/)[1]+'\n'+fs.readFileSync('css/quality-documents.css','utf8')});
 await p.evaluate(()=>{window.fail=false;window.data={qualityFormRecords:[],orders:[{id:'o1',code:'WO-TEST',partNo:'P-01',revision:'B',sourceSalesOrderId:'s1',qty:40}],salesOrders:[{id:'s1',code:'SO-TEST',customerId:'c1'}],customers:[{id:'c1',name:'Örnek Müşteri'}],faiRecords:[{id:'f1',orderId:'o1',balloonRunId:'b1'}],faiBalloonRuns:[{id:'b1',orderId:'o1',toleranceSettings:{unit:'mm'},dimensions:[{no:1,text:'8 ±0,1',nominal:8,lowerDeviation:-.1,upperDeviation:.1}]}],warehouseMoves:[{id:'w1',materialId:'m1',lotNo:'LOT-1',heatNo:'HEAT-1',qty:10}],materials:[{id:'m1',code:'MAT1',name:'Çelik'}],users:[{id:'u1',fullName:'Örnek Çalışan',status:'active'}]};window.DB={getAll:async c=>structuredClone(window.data[c]||[]),getDoc:async(c,id)=>c==='config'?{companyName:'ABBA TEKNOLOJİ',companyAddress:'Test Atölyesi',companyPhone:'0216 000 00 00',companyEmail:'test@example.com'}:structuredClone((window.data[c]||[]).find(r=>r.id===id)||null),addDoc:async(c,r)=>{if(window.fail)return null;const id='doc-'+(window.data.qualityFormRecords.length+1);window.data.qualityFormRecords.push({...r,id});return id;}};window.FB_READY=true;window.Session={get:()=>null};});
 await p.addScriptTag({content:code});await p.evaluate(()=>{window.root=ReactDOM.createRoot(document.getElementById('root'));window.mount=(tab,role='admin')=>window.root.render(React.createElement(QualityDocumentPanel,{key:tab+role,tab,currentUser:{id:role==='admin'?'admin':'u1',role,fullName:'Örnek Hazırlayan'}}));window.mount('quality_fai');});
 const brandCheck=await p.evaluate(()=>{
  const logo='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="10" height="10"%3E%3Crect width="10" height="10" fill="green"/%3E%3C/svg%3E';
  const output=buildQualityLetterheadHtml('<html><head></head><body><header>Old header</header><table><tr><td>Kontrol içeriği</td></tr></table></body></html>',{companyProfile:{companyName:'Firma & Ortakları',companyAddress:'Şirket Adresi',companyPhone:'0216 000',companyEmail:'firma@example.com'},logoSrc:logo,templateLibrary:{templates:{order:{blocks:[{id:'brand',type:'brandHeader',accentColor:'#125e54',metaText:'{{company.address}}\n{{company.phone}} · {{company.email}}'}]}}},title:'Kalite Formu',code:'KLT-FR-01',recordNo:'record-123',revision:2,date:'2026-09-09'});
  const d=new DOMParser().parseFromString(output,'text/html');return {logo:d.querySelector('.dt-logo img').getAttribute('src'),expectedLogo:logo,color:d.querySelector('.dt-brand').style.borderBottom,company:d.querySelector('.dt-company-name').textContent,meta:d.querySelector('.dt-company-meta').textContent,side:d.querySelector('.dt-brand-side').textContent,old:output.includes('Old header'),content:d.querySelector('.qd-print-content').textContent};
 });
 assert.equal(brandCheck.logo,brandCheck.expectedLogo);assert.equal(brandCheck.company,'Firma & Ortakları');assert.ok(brandCheck.color.includes('18, 94, 84'));assert.ok(brandCheck.meta.includes('firma@example.com'));assert.ok(brandCheck.side.includes('record-123'));assert.equal(brandCheck.old,false);assert.ok(brandCheck.content.includes('Kontrol içeriği'));
 const dialog=p.getByRole('dialog',{name:'İlgili kalite evrakları'});
 // Exercise the real page shell: its flex rule must not stretch the launcher row.
 await p.evaluate(()=>{
  const root=document.getElementById('root');root.className='mrp-view-slot-inner';
  const shell=document.createElement('div');shell.className='mrp-view-slot';shell.style.height='100vh';root.before(shell);shell.append(root);
  const content=document.createElement('section');content.id='layout-content';content.textContent='Modül içeriği';root.append(content);
 });
 for(const [width,height] of [[2048,1169],[1024,768],[820,1180],[390,844]]){
  await p.setViewportSize({width,height});
  const launcher=await p.locator('.qd-launcher').boundingBox(),panel=await p.locator('.qd-panel').boundingBox(),content=await p.locator('#layout-content').boundingBox();
  assert.ok(launcher.height>=44&&launcher.height<=56,`Launcher stretched at ${width}: ${launcher.height}`);
  assert.ok(panel.height<=56&&content.y-panel.y<=66,`Empty space above content at ${width}`);
  assert.ok(launcher.x>=0&&launcher.x+launcher.width<=width);
 }
 await p.screenshot({path:path.join(output,'quality-launcher-page-layout.png')});
 await p.evaluate(()=>document.getElementById('layout-content').remove());
 await p.setViewportSize({width:820,height:1180});
 async function open(tab){await p.evaluate(t=>window.mount(t),tab);await p.getByRole('button',{name:'Kalite Evrakları',exact:true}).click();await dialog.waitFor();}
 async function create(template,source){await dialog.getByRole('button',{name:'Yeni Evrak',exact:true}).click();await dialog.getByLabel('Evrak türü',{exact:true}).selectOption(template);await dialog.getByLabel('İlişkili kayıt',{exact:true}).selectOption(source);await dialog.getByRole('button',{name:'Kaydı Bağla ve Formu Doldur',exact:true}).click();}
 await p.getByRole('button',{name:'Kalite Evrakları',exact:true}).click();await create('FR-QUA-21','f1');
 assert.equal(await dialog.getByLabel('Nominal 1',{exact:true}).inputValue(),'8');assert.equal(await dialog.getByLabel('Alt sapma 1',{exact:true}).inputValue(),'-0.1');
 await dialog.getByLabel('Numune sayısı 1',{exact:true}).fill('2');await dialog.getByLabel('Karakteristik 1 Ölçüm 1',{exact:true}).fill('7,9');await dialog.getByLabel('Karakteristik 1 Ölçüm 2',{exact:true}).fill('8,1');await dialog.getByText('Karakteristik 1 · UYGUN',{exact:true}).waitFor();
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await p.screenshot({path:path.join(output,'quality-documents-tablet.png')});
 await p.evaluate(()=>window.fail=true);await dialog.getByRole('button',{name:'Evrakı Kaydet',exact:true}).click();await dialog.getByRole('alert').waitFor();assert.equal(await p.evaluate(()=>window.data.qualityFormRecords.length),0);
 await p.evaluate(()=>window.fail=false);await dialog.getByRole('button',{name:'Evrakı Kaydet',exact:true}).click();await dialog.getByRole('button',{name:'Yazdır',exact:true}).waitFor();
 await dialog.getByRole('button',{name:'Yeni Revizyon',exact:true}).click();await dialog.getByLabel('Karakteristik 1 Ölçüm 2',{exact:true}).fill('8.2');await dialog.getByRole('button',{name:'Evrakı Kaydet',exact:true}).click();
 const records=await p.evaluate(()=>window.data.qualityFormRecords);assert.equal(records.length,2);assert.equal(records[1].supersedesId,records[0].id);assert.equal(records[0].measurementRows[0].samples[1],'8,1');assert.equal(await dialog.getByRole('button',{name:'Yeni Revizyon',exact:true}).count(),1);
 async function pdf(name){const event=p.waitForEvent('popup');await dialog.getByRole('button',{name:'Yazdır',exact:true}).first().click();const popup=await event;await popup.waitForLoadState();await popup.pdf({path:path.join(output,name),preferCSSPageSize:true,printBackground:true});assert.equal(await popup.locator('.dt-brand').count(),1);assert.equal(await popup.locator('.qd-print-content').count(),1);assert.ok((await popup.locator('.dt-company-meta').innerText()).includes('Test Atölyesi'));const text=await popup.locator('body').innerText();await popup.close();return text;}
 assert.ok((await pdf('quality-measurement-sample.pdf')).includes('UYGUN DEĞİL'));
 assert.equal(await dialog.locator('.qd-record-table tbody tr').count(),1);
 await dialog.getByLabel('Evrak sürümü',{exact:true}).selectOption('all');assert.equal(await dialog.locator('.qd-record-table tbody tr').count(),2);
 await dialog.getByLabel('Evrak sürümü',{exact:true}).selectOption('latest');
 await p.evaluate(()=>{window.originalDocuments=structuredClone(window.data.qualityFormRecords);const base=window.data.qualityFormRecords[1];for(let i=0;i<23;i++)window.data.qualityFormRecords.push({...structuredClone(base),id:'bulk-'+i,supersedesId:'',sourceLabel:'WO-2026-'+(100+i)+' / Uzun parça ve müşteri açıklaması',createdByName:'Kalite Kontrol Sorumlusu',createdAt:'2026-09-10T12:00:00Z'});});
 await dialog.getByRole('button',{name:'Yenile',exact:true}).click();await dialog.getByText('24 evrak',{exact:true}).waitFor();assert.equal(await dialog.locator('.qd-record-table tbody tr').count(),10);
 await dialog.getByRole('button',{name:'Sonraki',exact:true}).click();await dialog.getByText('11–20 / 24 evrak',{exact:true}).waitFor();
 await dialog.getByLabel('Evrak türü filtresi',{exact:true}).selectOption('KLT-FR-01');await dialog.getByText('Aramanıza uygun evrak yok',{exact:true}).waitFor();await dialog.getByRole('button',{name:'Filtreleri Temizle',exact:true}).click();
 for(const [width,height] of [[1280,900],[820,1180],[390,844]]){await p.setViewportSize({width,height});assert.ok(await dialog.locator('.qd-dialog-body').evaluate(el=>el.scrollWidth<=el.clientWidth+1));await p.screenshot({path:path.join(output,`quality-records-${width}.png`)});}
 await p.setViewportSize({width:820,height:1180});await p.evaluate(()=>window.data.qualityFormRecords=window.originalDocuments);
 await open('warehouse');await create('FR-QUA-19','w1');assert.equal(await dialog.getByLabel('Depo Lot No',{exact:true}).inputValue(),'LOT-1');assert.equal(await dialog.getByLabel('Isı / Şarj No',{exact:true}).inputValue(),'HEAT-1');assert.equal(await dialog.getByLabel('Malzeme Tanımı',{exact:true}).inputValue(),'Çelik');await dialog.getByRole('button',{name:'Evrakı Kaydet',exact:true}).click();await pdf('quality-material-sample.pdf');
 await open('orders');await create('FR-QUA-18','o1');assert.equal(await dialog.getByLabel('Müşteri',{exact:true}).inputValue(),'Örnek Müşteri');await dialog.locator('summary').filter({hasText:'Bağlı evraklar ve sertifikalar'}).click();await dialog.getByLabel('Bağlı evraklar',{exact:true}).selectOption('doc-2');await dialog.getByRole('button',{name:'Evrakı Kaydet',exact:true}).click();assert.ok((await pdf('quality-coc-sample.pdf')).includes('FR-QUA-21'));
 await open('users');await create('IK-SZ-02','u1');const values=await dialog.locator('textarea').evaluateAll(els=>els.map(el=>el.value));assert.ok(values.includes('Örnek Çalışan'));await dialog.getByRole('button',{name:'Evrakı Kaydet',exact:true}).click();assert.ok((await pdf('quality-nda-sample.pdf')).includes('Gizli Bilgi'));
 await dialog.getByRole('button',{name:'Doküman Rehberi',exact:true}).click();await dialog.getByLabel('Kaynak belge',{exact:true}).selectOption('03');await dialog.getByLabel('Doküman içinde ara',{exact:true}).fill('GT-08');await dialog.locator('summary').filter({hasText:'GT-08'}).click();await dialog.getByText('GT-08 — CNC Operatörü',{exact:true}).waitFor();await p.screenshot({path:path.join(output,'quality-reference-design.png')});
 for(const [width,height] of [[390,844],[1024,768],[820,1180]]){
  await p.setViewportSize({width,height});const box=await dialog.boundingBox();assert.ok(box.x>=0&&box.y>=0&&box.x+box.width<=width+1&&box.y+box.height<=height+1);
  assert.ok(await dialog.locator('.qd-dialog-body').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
 }
 await p.evaluate(()=>window.mount('quality_fai','viewer'));await p.getByRole('button',{name:'Kalite Evrakları',exact:true}).click();assert.equal(await dialog.getByRole('button',{name:'Yeni Evrak',exact:true}).count(),0);
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: OCR prefill, strict measurements, failed save, revision snapshots, lot/heat separation, linked CoC, employee NDA, references, viewer and PDF outputs');
})().catch(e=>{console.error(e);process.exit(1);});
