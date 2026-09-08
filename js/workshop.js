(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Workshop=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  function numeric(value,label){if(value===null||value===undefined||String(value).trim()===''||!Number.isFinite(Number(value)))throw new Error(`${label} için geçerli bir sayı girin.`);return Number(value);}
  function measurement(form){
    if(!String(form.machine||'').trim())throw new Error('Tezgah seçin.');
    const target=numeric(form.target,'Hedef ölçü'),actual=numeric(form.actual,'Gerçek ölçü'),tolerance=numeric(form.tolerance,'Tolerans');
    if(tolerance<0)throw new Error('Tolerans sıfırdan küçük olamaz.');
    const deviation=Number((actual-target).toFixed(8));
    if(!Number.isFinite(deviation))throw new Error('Ölçü değerleri hesaplama sınırını aşıyor.');
    const recommendedWear=String(form.wear??'').trim()===''?Number((-deviation).toFixed(4)):numeric(form.wear,'Aşınma düzeltmesi');
    return {machine:String(form.machine).trim(),programCode:String(form.programCode||'').trim().toUpperCase(),toolCode:String(form.toolCode||'').trim().toUpperCase(),target,actual,tolerance,deviation,recommendedWear,wearMode:String(form.wear??'').trim()===''?'auto':'manual',result:Math.abs(deviation)<=tolerance+1e-9?'pass':'fail',note:String(form.note||'').trim()};
  }
  function movement(form){
    if(!form.materialId)throw new Error('Malzeme seçin.');
    if(!['in','out'].includes(form.moveType))throw new Error('Geçerli bir hareket türü seçin.');
    const qty=numeric(form.qty,'Miktar');if(qty<=0)throw new Error('Miktar sıfırdan büyük olmalıdır.');
    return {materialId:form.materialId,moveType:form.moveType,qty,lotNo:String(form.lotNo||'').trim(),location:String(form.location||'').trim(),note:String(form.note||'').trim()};
  }
  function stockDeltas(previous,next){
    const deltas=new Map();
    for(const [row,sign] of [[previous,-1],[next,1]]){if(!row)continue;const r=movement(row),delta=sign*(r.moveType==='in'?r.qty:-r.qty);deltas.set(r.materialId,(deltas.get(r.materialId)||0)+delta);}
    return [...deltas].map(([materialId,delta])=>({materialId,delta:Number(delta.toFixed(8))}));
  }
  function adjustedStock(stock,delta){const before=numeric(stock??0,'Mevcut stok'),after=Number((before+delta).toFixed(8));if(!Number.isFinite(after))throw new Error('Stok miktarı hesaplama sınırını aşıyor.');if(after<0)throw new Error('Stok yetersiz. Bu işlem mevcut stoku eksiye düşürüyor.');return after;}
  return {measurement,movement,stockDeltas,adjustedStock};
});
