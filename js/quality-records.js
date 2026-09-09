(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.QualityRecords=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const collections={trace:'partTraceability',inspect:'qualityInspections',fai:'faiRecords'};
  const labels={trace:'İz kaydı',inspect:'Muayene / hurda kaydı',fai:'FAI kaydı'};
  async function remove(db,view,row,confirm){
    const collection=collections[view];
    if(!collection||!row?.id)throw new Error('Silinecek kayıt bulunamadı.');
    const name=[row.orderCode,row.serialNo||row.partNo,row.id].filter(Boolean).join(' · ');
    if(!await confirm(`${labels[view]} silinsin mi?\n${name}\nBu işlem kaydı listeden kaldırır.${view==='fai'?' Teknik resim ve balon çalışması korunur.':''}`))return {deleted:false};
    // Read fresh dependencies after confirmation, and fail closed on read errors.
    const current=(await db.getAll(collection,{throwOnError:true})).find(r=>r.id===row.id);
    if(!current)throw new Error('Kayıt artık mevcut değil. Listeyi yenileyin.');
    if(view==='trace'){
      const linked=(await db.getAll('qualityInspections',{throwOnError:true})).filter(r=>r.traceId===row.id);
      if(linked.length)throw new Error(`Bu iz kaydına bağlı ${linked.length} muayene kaydı var. Önce bağlı muayeneleri düzenleyin veya silin.`);
    }
    if(view==='trace'||view==='inspect'){
      const key=view==='trace'?'sourceTraceId':'sourceInspectionId';
      const linked=(await db.getAll('complianceRecords',{throwOnError:true})).filter(r=>r[key]===row.id);
      if(linked.length)throw new Error(`Bu kayda bağlı ${linked.length} uygunluk / düzeltici faaliyet kaydı var. Önce bu bağlantıları Uygunluk ekranında düzenleyin.`);
    }
    if(!await db.deleteDoc(collection,row.id))throw new Error('Kayıt silinemedi. Bağlantınızı ve yetkinizi kontrol edip tekrar deneyin.');
    return {deleted:true,collection,before:current};
  }
  return {remove};
});
