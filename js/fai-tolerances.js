(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FaiTolerances=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  // ISO 286 tables, micrometres. Sources and supported ranges: docs/fai-iso-tolerances.md.
  const bands=[3,6,10,18,30,50,80,120,180,250,315,400,500];
  const grades={5:[4,5,6,8,9,11,13,15,18,20,23,25,27],6:[6,8,9,11,13,16,19,22,25,29,32,36,40],7:[10,12,15,18,21,25,30,35,40,46,52,57,63],8:[14,18,22,27,33,39,46,54,63,72,81,89,97],9:[25,30,36,43,52,62,74,87,100,115,130,140,155]};
  // Upper deviations for g6, lower deviations for k6/m6/n6; >3 through 315 mm.
  const shaft={g6:[-4,-5,-6,-7,-9,-10,-12,-14,-15,-17],k6:[1,1,1,2,2,2,3,3,4,4],m6:[4,6,7,8,9,11,13,15,17,20],n6:[8,10,12,15,17,20,23,27,31,34]};
  const linearBands=[3,6,30,120,400,1000,2000,4000];
  const linear={f:[.05,.05,.1,.15,.2,.3,.5,null],m:[.1,.1,.2,.3,.5,.8,1.2,2],c:[.2,.3,.5,.8,1.2,2,3,4],v:[null,.5,1,1.5,2.5,4,6,8]};
  const angular={f:[60,30,20,10,5],m:[60,30,20,10,5],c:[90,60,30,15,10],v:[180,120,60,30,20]};
  const index=(size,limits)=>limits.findIndex(limit=>size<=limit);
  function finish(d,lower,upper,status,basis){const round=n=>Number(n.toFixed(9));return {...d,lowerDeviation:round(lower),upperDeviation:round(upper),lowerLimit:round(d.nominal+lower),upperLimit:round(d.nominal+upper),toleranceStatus:status,toleranceBasis:basis};}
  function apply(d,text,options={}){
    const result={...d,toleranceBasis:d.toleranceStatus==='explicit'?'Çizimde yazılı tolerans':''};
    if(d.toleranceStatus==='explicit'||d.nominal===null)return result;
    if(options.excluded||/[\[\]()]/.test(text))return {...result,toleranceStatus:'excluded'};
    const fit=text.match(/^(?:\d+\s*x\s*)?(?:Ø\s*)?\d+(?:[.,]\d+)?\s*([A-Za-z]{1,2}\d{1,2})\s*(?:mm)?$/);
    const unit=/mm\s*$/i.test(text)?'mm':options.unit;
    if(fit){
      const code=fit[1];
      if(unit!=='mm')return {...result,toleranceStatus:'unit_required'};
      const n=d.nominal,i=index(n,bands),grade=grades[Number(code.slice(1))];
      if(n>1&&i>=0&&/^[Hh][5-9]$/.test(code)&&grade){const t=grade[i]/1000;return finish(result,code[0]==='H'?0:-t,code[0]==='H'?t:0,'iso_fit',`ISO 286-2:2010 · ${code}`);}
      if(n>3&&n<=315&&shaft[code]){const t=grades[6][i]/1000,offset=shaft[code][i-1]/1000;return finish(result,code==='g6'?offset-t:offset,code==='g6'?offset:offset+t,'iso_fit',`ISO 286-2:2010 · ${code}`);}
      return {...result,toleranceStatus:'iso_fit_unsupported'};
    }
    if(d.toleranceStatus!=='not_specified'||!linear[options.generalClass])return result;
    if(/^M/i.test(text))return {...result,toleranceStatus:'review'};
    const cls=options.generalClass;let delta;
    if(d.unit==='°'){
      const length=Number(options.shortSideMm);
      if(!Number.isFinite(length)||length<=0)return {...result,toleranceStatus:'angle_length_required'};
      delta=angular[cls][index(length,[10,50,120,400,Infinity])]/60;
    }else{
      if(unit!=='mm')return {...result,toleranceStatus:'unit_required'};
      if(/^R/i.test(text)&&!options.kind)return {...result,toleranceStatus:'feature_kind_required'};
      if(d.nominal<.5)return {...result,toleranceStatus:'outside_table'};
      if(options.kind==='edge'){delta=(cls==='f'||cls==='m'?[.2,.5,1]:[.4,1,2])[index(d.nominal,[3,6,Infinity])];}
      else{const i=index(d.nominal,linearBands);delta=i<0?null:linear[cls][i];}
    }
    if(delta===null||delta===undefined)return {...result,toleranceStatus:'outside_table'};
    return finish(result,-delta,delta,'iso_general',`ISO 2768-1:1989 · ${cls}${options.kind==='edge'?' · kenar':''}`);
  }
  function settings(value={}){return {unit:['mm','inch'].includes(value?.unit)?value.unit:'',generalClass:['f','m','c','v'].includes(value?.generalClass)?value.generalClass:''};}
  return {apply,settings};
});
