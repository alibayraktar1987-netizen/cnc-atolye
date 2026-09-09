const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const start=html.indexOf('function buildMachineScreenHref('),end=html.indexOf('\n}',start);
const context=vm.createContext({URL});vm.runInContext(html.slice(start,end+2),context);
const href=context.buildMachineScreenHref;
test('cancelling a switch preserves an unsaved production entry',async()=>{
 const begin=html.indexOf('  async function switchStationScreen(){'),finish=html.indexOf('\n  }',begin);
 const navigations=[],busy=[],ctx=vm.createContext({stationSwitchBusy:false,stationTarget:'CNC-2',form:{machine:'CNC-1',correct:'5',wrong:'',machineToolId:''},machines:['CNC-1','CNC-2'],buildMachineScreenHref:href,setStationSwitchBusy:v=>busy.push(v),askAppConfirm:async()=>false,window:{location:{href:'https://example.com/?machine=CNC-1',assign:v=>navigations.push(v)}}});
 vm.runInContext(html.slice(begin,finish+4),ctx);await vm.runInContext('switchStationScreen()',ctx);assert.deepEqual(navigations,[]);assert.deepEqual(busy,[true,false]);assert.equal(ctx.form.correct,'5');
});
test('station navigation preserves page and updates both machine parameters',()=>{
 const url=new URL(href('https://cnc-atolye.onrender.com/?tab=dashboard&machine=K1+-+STAR+SR32&station=K1+-+STAR+SR32&theme=dark#details','K2 - ÖZEL + CNC',['K2 - ÖZEL + CNC']));
 assert.equal(url.searchParams.get('machine'),'K2 - ÖZEL + CNC');assert.equal(url.searchParams.get('station'),'K2 - ÖZEL + CNC');assert.equal(url.searchParams.get('tab'),'dashboard');assert.equal(url.searchParams.get('theme'),'dark');assert.equal(url.hash,'#details');assert.equal(url.origin,'https://cnc-atolye.onrender.com');
});
test('legacy screen labels update; unavailable targets cannot navigate',()=>{
 const url=new URL(href('https://example.com/index.html?tab=giris&screen=old','CNC-2',['CNC-2']));assert.equal(url.searchParams.get('screen'),'CNC-2');assert.equal(url.pathname,'/index.html');
 assert.throws(()=>href(url.href,'missing',['CNC-2']),/tezgâh seçin/);assert.throws(()=>href(url.href,'',[]),/tezgâh seçin/);
});
