(function(root){
  'use strict';
  async function render(file,{pageNumber=1,loadBytes,loadScript}={}){
    if(!await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',()=>Boolean(root.pdfjsLib?.getDocument)))throw new Error('PDF motoru yüklenemedi. Bağlantınızı kontrol edin.');
    root.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const task=root.pdfjsLib.getDocument({data:await loadBytes(file)});
    try{
      const pdf=await task.promise,pageNo=Number(pageNumber);
      if(!Number.isInteger(pageNo)||pageNo<1||pageNo>pdf.numPages)throw new Error(`PDF ${pdf.numPages} sayfa içeriyor. Geçerli bir sayfa seçin.`);
      const page=await pdf.getPage(pageNo),base=page.getViewport({scale:1});
      const viewport=page.getViewport({scale:Math.min(3,4000/Math.max(base.width,base.height))});
      const canvas=document.createElement('canvas');canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
      await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
      const content=await page.getTextContent();
      return {canvas,page:pageNo,pageCount:pdf.numPages,pageWidth:viewport.width,pageHeight:viewport.height,previewDataUrl:canvas.toDataURL('image/png'),runs:root.FaiDetection.pdfRuns(content.items,viewport)};
    }finally{await task.destroy();}
  }
  async function recognize(canvas,loadScript,onProgress){
    if(!await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@6.0.0/dist/tesseract.min.js',()=>Boolean(root.Tesseract?.createWorker)))throw new Error('OCR motoru yüklenemedi. Bağlantınızı kontrol edip tekrar deneyin.');
    let worker,timer,expired=false;
    const work=(async()=>{
      worker=await root.Tesseract.createWorker('eng',1,{logger:m=>onProgress(`OCR: ${m.status} ${Math.round((m.progress||0)*100)}%`)});
      if(expired){await worker.terminate();throw new Error('OCR zaman aşımına uğradı.');}
      await worker.setParameters({tessedit_pageseg_mode:'11'});
      const runs=[];
      for(const rotation of [0,90,270]){
        let input=canvas;
        if(rotation){input=document.createElement('canvas');input.width=canvas.height;input.height=canvas.width;const ctx=input.getContext('2d');ctx.translate(input.width/2,input.height/2);ctx.rotate(rotation*Math.PI/180);ctx.drawImage(canvas,-canvas.width/2,-canvas.height/2);}
        const result=await worker.recognize(input,{}, {blocks:true});
        runs.push(...root.FaiDetection.ocrRuns(result.data,canvas.width,canvas.height,rotation));
      }
      return runs;
    })();
    try{return await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>{expired=true;reject(new Error('OCR zaman aşımına uğradı. Daha net bir PDF ile tekrar deneyin.'));},180000);})]);}
    finally{clearTimeout(timer);if(worker)await worker.terminate();}
  }
  async function detect(file,options){
    const onProgress=options.onProgress||(()=>{});onProgress('PDF okunuyor…');
    const page=await render(file,options),engine=root.FaiDetection;
    let result=engine.detect(page.runs,page.pageWidth,page.pageHeight,page.page),usedOcr=false;
    if(options.forceOcr||!result.rows.length){
      onProgress('Görüntüdeki ölçüler OCR ile okunuyor…');
      const ocr=await recognize(page.canvas,options.loadScript,onProgress);
      const detected=engine.detect(ocr,page.canvas.width,page.canvas.height,page.page);
      result={rows:engine.dedupe([...result.rows,...detected.rows]),lineCount:result.lineCount+detected.lineCount};usedOcr=true;
    }
    const tokens=result.rows,balloons=tokens.slice(0,Math.max(1,Math.min(500,Number(options.maxItems)||260))).map((row,i)=>({...row,no:i+1}));
    return {...page,canvas:undefined,runs:undefined,tokens,balloons,detection:{engine:usedOcr?'pdf_ocr_v3':'pdf_geometry_v3',textItemCount:page.runs.length,lineCount:result.lineCount,detectedCount:tokens.length,balloonCount:balloons.length,limited:tokens.length>balloons.length,note:`${usedOcr?'OCR ve PDF metni':'PDF metni'} ile ${tokens.length} ölçü adayı bulundu. Sayısal işaretler de aday olabilir; eksik, yanlış ve tekrarlanan ölçüleri kaydetmeden önce kontrol edin.`}};
  }
  root.FaiReader={render,detect};
})(window);
