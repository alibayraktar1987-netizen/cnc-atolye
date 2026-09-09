const {test}=require('node:test'),assert=require('node:assert/strict');
const f=require('../js/fai-detection.js');
const mm={unit:'mm',generalClass:'m'};
test('H7/h6 fit lookup converts micrometres to millimetres and supersedes general tolerance',()=>{
 const hole=f.dimension('Ø8 H7',mm),shaft=f.dimension('8 h6',mm);
 assert.equal(hole.lowerLimit,8);assert.equal(hole.upperLimit,8.015);assert.equal(hole.toleranceStatus,'iso_fit');
 assert.equal(shaft.lowerLimit,7.991);assert.equal(shaft.upperLimit,8);
 assert.equal(f.dimension('10 H7',mm).upperDeviation,.015);
 assert.equal(f.dimension('10.001 H7',mm).upperDeviation,.018);
 for(const [code,lo,hi] of [['g6',-.014,-.005],['k6',.001,.010],['m6',.006,.015],['n6',.010,.019]]){
  const row=f.dimension(`8 ${code}`,mm);assert.equal(row.lowerDeviation,lo);assert.equal(row.upperDeviation,hi);assert.equal(f.matches(`8 ${code}`)[0].text,`8 ${code}`);
 }
});
test('unsupported fits, units and ranges never fall back to a general tolerance',()=>{
 for(const text of ['8 p6','0.5 H7','501 H7','400 g6','8 H12']){const d=f.dimension(text,mm);assert.equal(d.upperLimit,null);assert.equal(d.toleranceStatus,'iso_fit_unsupported');}
 assert.equal(f.dimension('8 H7',{unit:'inch'}).upperLimit,null);
 assert.equal(f.dimension('8 H7').upperLimit,null);
});
test('ISO 2768 linear classes and boundaries; explicit deviation takes precedence',()=>{
 assert.equal(f.dimension('8',mm).lowerLimit,7.8);assert.equal(f.dimension('8',mm).upperLimit,8.2);
 assert.equal(f.dimension('8 ±0.1',mm).lowerLimit,7.9);
 assert.equal(f.dimension('3',mm).upperDeviation,.1);assert.equal(f.dimension('6',mm).upperDeviation,.1);assert.equal(f.dimension('6.001',mm).upperDeviation,.2);
 assert.equal(f.dimension('8',{...mm,generalClass:'f'}).upperDeviation,.1);
 assert.equal(f.dimension('8',{...mm,generalClass:'c'}).upperDeviation,.5);
 assert.equal(f.dimension('8',{...mm,generalClass:'v'}).upperDeviation,1);
 for(const text of ['0.49','4001'])assert.equal(f.dimension(text,mm).upperLimit,null);
 assert.equal(f.dimension('2500',{...mm,generalClass:'f'}).upperLimit,null);
 assert.equal(f.dimension('8',{unit:'mm'}).upperLimit,null);
 assert.equal(f.dimension('8',{...mm,excluded:true}).upperLimit,null);
 assert.equal(f.dimension('M8',mm).upperLimit,null);
});
test('angular general tolerance requires shorter-side length; broken edges require explicit kind',()=>{
 assert.equal(f.dimension('45°',mm).toleranceStatus,'angle_length_required');
 const angle=f.dimension('45°',{...mm,shortSideMm:50});assert.equal(angle.lowerLimit,44.5);assert.equal(angle.upperLimit,45.5);
 assert.equal(f.dimension('R8',mm).upperLimit,null);
 assert.equal(f.dimension('R8',{...mm,kind:'edge'}).upperDeviation,1);
 assert.equal(f.dimension('R8',{...mm,kind:'linear'}).upperDeviation,.2);
});
