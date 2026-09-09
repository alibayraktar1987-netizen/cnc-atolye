const {test}=require('node:test');
const assert=require('node:assert/strict');
const f=require('../js/fai-detection.js');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('explicit tolerances produce separate deviations and exact limits',()=>{
  for(const text of ['8 +- 0.1','8 ±0,1','8 +/-0.1']){
    const d=f.dimension(text);assert.equal(d.nominal,8);assert.equal(d.upperDeviation,.1);assert.equal(d.lowerDeviation,-.1);assert.equal(d.upperLimit,8.1);assert.equal(d.lowerLimit,7.9);
  }
  const d=f.dimension('8 +0.2/-0.1');assert.equal(d.upperLimit,8.2);assert.equal(d.lowerLimit,7.9);
  assert.equal(f.dimension('8').upperLimit,null);
  assert.equal(f.dimension('Ø8 H7').toleranceStatus,'iso_fit_required');
  assert.equal(f.dimension('8 +0.2/+0.1').lowerLimit,8.1);
});
test('technical callouts combine quantity, diameter and tolerance; ambiguous numbers need review',()=>{
  assert.deepEqual(f.matches('4 x Ø10 ±0.1').map(r=>r.text),['4 x Ø10 ±0.1']);
  const result=f.classify([{text:'20',confidence:.95},{text:'Ø10 ±0.1',confidence:.9},{text:'R5',confidence:.2}]);
  assert.equal(result.accepted.length,2);assert.equal(result.review.length,1);
  for(const text of ['QTY 4','WEIGHT 20','ADET 6','ÖLÇEK 1:2'])assert.equal(f.matches(text).length,0);
});
test('stacked signed tolerances belong to a nearby nominal value',()=>{
  const runs=[{text:'20',x:20,y:50,width:20,height:12},{text:'+0.1',x:43,y:44,width:18,height:6},{text:'-0.2',x:43,y:56,width:18,height:6}].map(r=>({...r,ux:1,uy:0,confidence:1,source:'pdf_text'}));
  assert.deepEqual(f.detect(runs,100,100).rows.map(r=>r.text),['20 +0.1 -0.2']);
});
test('balloons avoid text, other balloons and ink while preserving measurement anchors',()=>{
  const rows=[{text:'Ø10',page:1,xPct:50,yPct:50,bounds:{left:45,right:55,top:48,bottom:52}},{text:'R5',page:1,xPct:51,yPct:50}];
  const placed=f.place(rows,{width:800,height:600,ink:(x,y)=>y>300?1:0});
  assert.equal(placed[0].anchorXPct,50);assert.equal(placed[0].anchorYPct,50);
  assert.ok(placed[0].yPct<48);assert.ok(Math.hypot((placed[0].xPct-placed[1].xPct)*8,(placed[0].yPct-placed[1].yPct)*6)>=28);
  assert.deepEqual(f.place(placed,{width:800,height:600,ink:(x,y)=>y>300?1:0}),placed);
});
test('empty rerun cannot overwrite a saved balloon list',async()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const start=html.indexOf('  async function runAutoBalloon('),end=html.indexOf('  async function openOrCreateAutoBalloon(',start);
  let error='',writes=0;
  const context=vm.createContext({balloonBusy:false,balloonSaveBusy:false,pdfOrderById:{order:{id:'order'}},balloonForm:{orderId:'order',page:'1'},selectedPdfFile:{id:'pdf'},safeNum:Number,
    setDragBalloon(){},setBalloonBusy(){},setBalloonProgress(){},setBalloonError(value){error=value;},
    autoBalloonOcrDrawing:async()=>({balloons:[]}),window:{DB:{updateDoc:async()=>{writes++;}}}});
  vm.runInContext(html.slice(start,end),context);
  await vm.runInContext('runAutoBalloon({replaceRunId:"saved"})',context);
  assert.equal(writes,0);assert.match(error,/mevcut çalışma korunuyor/);
});
test('linear, tolerance, diameter, thread and repeated dimensions',()=>{
  for(const value of ['20','125','12.5','Ø12 H7','M8 x 1.25','25 ±0.1','45°','R5','20 +0.2/-0.1'])assert.equal(f.matches(value)[0]?.text,value);
  assert.equal(f.matches('20   20').length,2);
  assert.equal(f.normalize('DIA 12 H7'),'Ø12 H7');
  assert.equal(f.normalize('⏥'),'⏥');
});
test('exclude metadata, dates, scale and identifiers',()=>{
  for(const value of ['DRAWING 125','SCALE 1:2','2026/09/08','ABC125','REV 2'])assert.equal(f.matches(value).length,0,value);
});
test('same values remain at different locations; invalid coordinates discarded',()=>{
  const row={text:'20',page:1,xPct:10,yPct:20};
  assert.equal(f.dedupe([row,{...row},{...row,xPct:40},{...row,page:2},{...row,xPct:NaN},{...row,yPct:101}]).length,3);
});
test('PDF viewport transforms apply rotation and crop before placing dimensions',()=>{
  const item={str:'20',transform:[10,0,0,10,30,40],width:20,height:10};
  for(const [transform,x,y] of [[[1,0,0,-1,0,100],40,55],[[0,1,1,0,0,0],45,40],[[-1,0,0,1,100,0],60,45],[[0,-1,-1,0,100,100],55,60],[[1,0,0,-1,-10,90],30,45]]){
    const result=f.detect(f.pdfRuns([item],{transform,scale:1}),100,100).rows;
    assert.equal(result.length,1);assert.ok(Math.abs(result[0].xPct-x)<1e-8);assert.ok(Math.abs(result[0].yPct-y)<1e-8);
  }
});
test('distant columns never share a guessed whole-line coordinate',()=>{
  const runs=[10,80].map(x=>({text:'20',x,y:50,ux:1,uy:0,width:10,height:5,confidence:1}));
  assert.deepEqual(f.detect(runs,100,100).rows.map(r=>r.xPct),[15,85]);
});
test('rotated OCR coordinates map back to original image',()=>{
  const data={blocks:[{paragraphs:[{lines:[{words:[{text:'20',confidence:90,bbox:{x0:20,x1:40,y0:10,y1:20}}]}]}]}]};
  const row=f.detect(f.ocrRuns(data,100,200,90),100,200).rows[0];
  assert.equal(row.xPct,15);assert.equal(row.yPct,85);
});
