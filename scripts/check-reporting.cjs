// Pure calculations: no network, Firebase or customer data.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../js/reporting.js');
const today='2026-09-08';
test('inclusive date windows and equally long previous periods',()=>{
  const range=R.range('last7',today);
  assert.equal(range.from,'2026-09-02');assert.equal(range.to,today);
  assert.deepEqual(R.previousRange(range),{from:'2026-08-26',to:'2026-09-01',valid:true});
  assert.equal(R.range('custom',today,'2026-09-10',today).valid,false);
  assert.equal(R.range('custom',today,'2026-02-30',today).valid,false);
});
test('numeric strings are added numerically; ratios are weighted by pieces',()=>{
  const rows=R.normalizeRows('entries',[{correct:'99',wrong:'1'},{correct:0,wrong:1}],today);
  assert.equal(rows[0].totalParts,100);
  const cards=R.insights('entries',rows,today).cards;
  assert.equal(cards[0].value,101);assert.equal(cards[3].value,99/101*100);
  assert.equal(R.insights('entries',[],today).cards[3].value,null);
});
test('date, machine and Turkish search filters intersect; missing dates excluded only in date ranges',()=>{
  const rows=R.normalizeRows('entries',[{id:'a',date:today,machine:'CNC-1',operatorName:'IŞIK ÇELİK'},{id:'b',date:today,machine:'CNC-2',operatorName:'Işık Çelik'},{id:'c',machine:'CNC-1',operatorName:'Işık Çelik'}],today);
  assert.deepEqual(R.filterRows('entries',rows,{search:'isik celik',machine:'CNC-1'},R.range('today',today)).map(r=>r.id),['a']);
  assert.equal(R.filterRows('entries',rows,{},R.range('all',today)).length,3);
});
test('late jobs exclude closed statuses; missing due date is not on time',()=>{
  const rows=R.normalizeRows('orders',[{id:'late',dueDate:'2026-09-01',status:'active',machines:['A','B']},{id:'closed',dueDate:'2026-09-01',status:'completed'},{id:'unknown',status:'active'}],today);
  assert.equal(rows[0].daysLate,7);assert.equal(rows[1].deliveryState,'Kapalı');assert.equal(rows[2].deliveryState,'Termin belirtilmemiş');
  assert.deepEqual(R.filterRows('orders',rows,{focus:'late',machine:'B'},R.range('today',today)).map(r=>r.id),['late']);
});
test('snapshot reports ignore historical date filters',()=>{
  const rows=R.normalizeRows('materials',[{stock:3,reorderPoint:5,updatedAt:'2020-01-01'}],today);
  assert.equal(R.filterRows('materials',rows,{},R.range('today',today)).length,1);
  assert.equal(rows[0].stockState,'Sipariş gerekli');
});
test('currencies and stock units are never combined',()=>{
  const sales=R.normalizeRows('salesOrders',[{customerName:'A',currency:'TRY',totalAmount:100},{customerName:'A',currency:'EUR',totalAmount:10},{customerName:'A',currency:'TRY',totalAmount:50}],today);
  const totals=R.totalsByUnit(sales,{source:'salesOrders',metric:'totalAmount'});
  assert.deepEqual(totals.map(t=>[t.unit,t.value]),[['TRY',150],['EUR',10]]);
  const stock=R.normalizeRows('materials',[{stock:10,unit:'kg'},{stock:2,unit:'adet'},{stock:3}],today);
  assert.equal(R.totalsByUnit(stock,{source:'materials',metric:'stock'}).length,3);
});
test('sales use order date, quality uses inspection date, not a later update',()=>{
  assert.equal(R.normalizeRows('salesOrders',[{createdAt:'2026-08-01T12:00:00Z',dueDate:'2026-10-01'}],today)[0].date,'2026-08-01');
  assert.equal(R.normalizeRows('quality',[{date:'2026-08-02',updatedAt:'2026-09-08T12:00:00Z'}],today)[0].date,'2026-08-02');
});
test('group totals include all records beyond the display limit',()=>{
  const rows=R.normalizeRows('entries',Array.from({length:30},(_,i)=>({machine:'M'+i,correct:10,wrong:0})),today);
  assert.equal(R.groupRows(rows,{source:'entries',maxItems:3}).length,30);
  assert.equal(R.totalsByUnit(rows,{source:'entries',maxItems:3})[0].value,300);
});
test('averages aggregate records rather than already grouped averages',()=>{
  const rows=R.normalizeRows('entries',[{machine:'A',partSec:10},{machine:'A',partSec:10},{machine:'B',partSec:100}],today);
  assert.equal(R.totalsByUnit(rows,{source:'entries',metric:'partSec',aggregation:'avg'})[0].value,40);
});
test('group names cannot alter object prototypes',()=>{
  const rows=R.normalizeRows('entries',[{machine:'__proto__',correct:8},{machine:'constructor',correct:4}],today);
  assert.deepEqual(R.groupRows(rows,{source:'entries'}).map(g=>g.label),['__proto__','constructor']);
});
test('CSV exports all rows, Turkish characters, quoted fields and formula protection',()=>{
  const csv=R.csv([['name','Ad']], [{name:'Çelik; "A"'},{name:'=HYPERLINK("evil")'},{name:'@SUM(1)'}]);
  assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('"Çelik; ""A"""'));
  assert.ok(csv.includes('"\'=HYPERLINK'));assert.ok(csv.includes('"\'@SUM'));
});
test('saved report settings are validated against the source',()=>{
  const c=R.normalizeConfig({source:'entries',metric:'partSec',aggregation:'sum',dimension:'missing',maxItems:1000});
  assert.equal(c.aggregation,'avg');assert.equal(c.dimension,'machine');assert.equal(c.maxItems,40);
});
const ledger=[
  {id:'planned',flow:'tahsilat',status:'planned',dueDate:'2026-09-05',amount:100,currency:'TRY'},
  {id:'collected',flow:'tahsilat',status:'collected',dueDate:'2026-08-01',collectionDate:'2026-09-06',amount:200,currency:'TRY'},
  {id:'eur',flow:'tahsilat',status:'collected',collectionDate:'2026-09-06',amount:20,currency:'EUR'},
  {id:'old',flow:'tahsilat',status:'collected',dueDate:'2026-09-06',updatedAt:'2026-09-06',amount:50,currency:'TRY'},
  {id:'payment',flow:'odeme',status:'planned',dueDate:'2026-09-05',amount:500,currency:'TRY'},
  {id:'cancelled',flow:'tahsilat',status:'cancelled',dueDate:'2026-09-05',amount:600,currency:'TRY'},
];
test('finance expected collections exclude payments, cancellations and collected amounts',()=>{
  const r=R.collections(ledger,{mode:'planned',from:'2026-09-01',to:today});
  assert.deepEqual(r.rows.map(r=>r.id),['planned']);assert.equal(r.groups[0].amount,100);
});
test('actual collections use explicit date, never due date or last update',()=>{
  const r=R.collections(ledger,{mode:'collected',from:'2026-09-06',to:'2026-09-06'});
  assert.deepEqual(r.rows.map(r=>r.id),['collected','eur']);assert.equal(r.undated,1);assert.equal(r.groups.length,2);
});
test('finance monthly groups and currency filters remain accurate',()=>{
  const r=R.collections(ledger,{mode:'collected',granularity:'month',currency:'TRY'});
  assert.equal(r.groups[0].date,'2026-09');assert.equal(r.groups[0].amount,200);
  assert.equal(R.collections(ledger,{from:'2026-09-09',to:'2026-09-01'}).valid,false);
});
