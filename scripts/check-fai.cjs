const {test}=require('node:test');
const assert=require('node:assert/strict');
const f=require('../js/fai-detection.js');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
test('empty rerun cannot overwrite a saved balloon list',async()=>{
  const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
  const start=html.indexOf('  async function runAutoBalloon('),end=html.indexOf('  async function openOrCreateAutoBalloon(',start);
  let error='',writes=0;
  const context=vm.createContext({balloonBusy:false,balloonSaveBusy:false,pdfOrderById:{order:{id:'order'}},balloonForm:{orderId:'order',page:'1'},selectedPdfFile:{id:'pdf'},safeNum:Number,
    setDragBalloon(){},setBalloonBusy(){},setBalloonProgress(){},setBalloonError(value){error=value;},
    autoBalloonPdfDrawing:async()=>({balloons:[]}),window:{DB:{updateDoc:async()=>{writes++;}}}});
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
