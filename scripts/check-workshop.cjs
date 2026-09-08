const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const W=require('../js/workshop.js');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const firebase=html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm,'');
function fixture(seed={}){
  const records=new Map(Object.entries(structuredClone(seed)));let counter=0,failCommit=false;
  const context=vm.createContext({console,Event,window:{Workshop:W,dispatchEvent(){}},initializeApp:()=>({}),getFirestore:()=>({}),getStorage:()=>({}),
    collection:(_,name)=>({path:name}),doc:(...args)=>{const key=args.length===1?args[0].path+'/new-'+(++counter):args.slice(1).join('/');return {path:key,id:key.split('/').at(-1)};},
    runTransaction:async(_,callback)=>{const writes=[];const result=await callback({get:async ref=>({exists:()=>records.has(ref.path),data:()=>structuredClone(records.get(ref.path))}),set:(ref,data)=>writes.push([ref.path,data]),update:(ref,data)=>{assert.ok(records.has(ref.path));writes.push([ref.path,data]);}});if(failCommit)throw new Error('commit failed');for(const [key,data] of writes)records.set(key,{...records.get(key),...structuredClone(data)});return result;}
  });vm.runInContext(firebase,context);return {db:context.window.DB,records,setFail:v=>failCommit=v};
}
test('measurement validates required numbers and preserves precision',()=>{
  const r=W.measurement({machine:'CNC-1',target:10,actual:10.02,tolerance:.02,wear:''});assert.equal(r.result,'pass');assert.equal(r.deviation,.02);assert.equal(r.recommendedWear,-.02);
  assert.throws(()=>W.measurement({machine:'CNC-1',target:'',actual:1,tolerance:0}));
  assert.throws(()=>W.measurement({machine:'CNC-1',target:1,actual:1,tolerance:-1}));
});
test('stock edit applies only the difference, including material/type changes',()=>{
  assert.deepEqual(W.stockDeltas({materialId:'a',moveType:'in',qty:10},{materialId:'a',moveType:'in',qty:15}),[{materialId:'a',delta:5}]);
  assert.deepEqual(W.stockDeltas({materialId:'a',moveType:'out',qty:5},{materialId:'b',moveType:'in',qty:3}),[{materialId:'a',delta:5},{materialId:'b',delta:3}]);
  assert.throws(()=>W.adjustedStock(2,-3));assert.throws(()=>W.movement({materialId:'a',moveType:'out',qty:0}));
});
test('warehouse creation atomically saves movement and current stock',async()=>{
  const f=fixture({'materials/a':{code:'A',stock:10,unit:'kg'}});
  const result=await f.db.saveWarehouseMove('',{materialId:'a',moveType:'out',qty:3},'tester');
  assert.equal(f.records.get('materials/a').stock,7);assert.equal(f.records.get('warehouseMoves/'+result.row.id).qty,3);
});
test('failed movement commit changes neither stock nor records',async()=>{
  const f=fixture({'materials/a':{stock:10}});f.setFail(true);
  await assert.rejects(f.db.saveWarehouseMove('',{materialId:'a',moveType:'in',qty:3},'tester'));
  assert.equal(f.records.get('materials/a').stock,10);assert.equal(f.records.size,1);
});
test('stock edit uses current stock and reverses the old effect',async()=>{
  const f=fixture({'materials/a':{stock:30},'warehouseMoves/m':{materialId:'a',moveType:'in',qty:10,revision:1}});
  await f.db.saveWarehouseMove('m',{materialId:'a',moveType:'in',qty:15},'tester','1');
  assert.equal(f.records.get('materials/a').stock,35);assert.equal(f.records.get('warehouseMoves/m').revision,2);
  await assert.rejects(f.db.saveWarehouseMove('m',{materialId:'a',moveType:'in',qty:20},'tester','1'));
  assert.equal(f.records.get('materials/a').stock,35);
});
test('material change restores old material and adjusts new material together',async()=>{
  const f=fixture({'materials/a':{stock:5},'materials/b':{stock:20},'warehouseMoves/m':{materialId:'a',moveType:'out',qty:5,createdAt:'old'}});
  await f.db.saveWarehouseMove('m',{materialId:'b',moveType:'out',qty:3},'tester','old');
  assert.equal(f.records.get('materials/a').stock,10);assert.equal(f.records.get('materials/b').stock,17);
});
test('editing a consumed stock receipt cannot make the stock negative',async()=>{
  const f=fixture({'materials/a':{stock:1},'warehouseMoves/m':{materialId:'a',moveType:'in',qty:10,createdAt:'old'}});
  await assert.rejects(f.db.saveWarehouseMove('m',{materialId:'a',moveType:'in',qty:5},'tester','old'));
  assert.equal(f.records.get('materials/a').stock,1);assert.equal(f.records.get('warehouseMoves/m').qty,10);
});
test('measurement edit does not duplicate the record; stale updates are rejected',async()=>{
  const f=fixture({'measurementFeedback/m':{machine:'CNC-1',createdAt:'old',applyStatus:'pending'}});
  await f.db.saveMeasurement('m',{machine:'CNC-1',target:10,actual:10.1,tolerance:.02,toolCode:'T1'},'tester','old');
  assert.equal(f.records.size,1);assert.equal(f.records.get('measurementFeedback/m').result,'fail');
  await assert.rejects(f.db.saveMeasurement('m',{machine:'CNC-1',target:10,actual:10,tolerance:.02},'tester','old'));
});
test('offset creation is idempotent and locks applied measurement edits',async()=>{
  const f=fixture({'measurementFeedback/m':{machine:'CNC-1',toolCode:'T1',recommendedWear:-.1,applyStatus:'pending',revision:1}});
  await f.db.applyMeasurement('m','tester');await f.db.applyMeasurement('m','tester');
  assert.equal(f.records.size,2);assert.equal(f.records.get('toolOffsets/measurement_m').wearOffset,-.1);
  await assert.rejects(f.db.saveMeasurement('m',{machine:'CNC-1',target:1,actual:1,tolerance:0},'tester','2'));
});
test('offset failure does not leave an orphan offset or applied status',async()=>{
  const f=fixture({'measurementFeedback/m':{machine:'CNC-1',toolCode:'T1',recommendedWear:0,applyStatus:'pending'}});f.setFail(true);
  await assert.rejects(f.db.applyMeasurement('m','tester'));assert.equal(f.records.size,1);assert.equal(f.records.get('measurementFeedback/m').applyStatus,'pending');
});
test('legacy module access and hidden menu settings expand to both separate screens',()=>{
  const app=html.match(/<script id="factorab-app-source" type="text\/plain">([\s\S]*?)<\/script>/)[1];
  const get=name=>{const start=app.indexOf('function '+name+'(');return app.slice(start,app.indexOf('\n}',start)+2);};
  const c=vm.createContext({ALL_MODULE_IDS:['measurement','warehouse','orders'],MENU_ALWAYS_VISIBLE_TAB_IDS:['users']});
  vm.runInContext(get('normalizeModuleAccessIds')+'\n'+get('normalizeMenuVisibilityConfig'),c);
  assert.equal(vm.runInContext('JSON.stringify(normalizeModuleAccessIds(["closedloop","warehouse"]))',c),'["measurement","warehouse"]');
  assert.equal(vm.runInContext('JSON.stringify(normalizeMenuVisibilityConfig({hiddenTabs:["closedloop"]}).hiddenTabs)',c),'["measurement","warehouse"]');
});
