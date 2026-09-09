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

      return {canvas,page:pageNo,pageCount:pdf.numPages,pageWidth:viewport.width,pageHeight:viewport.height,previewDataUrl:canvas.toDataURL('image/png'),runs:[]};
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
    onProgress('Görüntüdeki ölçüler ve toleranslar OCR ile okunuyor…');
    const ocr=await recognize(page.canvas,options.loadScript,onProgress);
    const result=engine.detect(ocr,page.canvas.width,page.canvas.height,page.page);
    const tokens=result.rows,classified=engine.classify(tokens);
    const balloons=arrange(classified.accepted.slice(0,Math.max(1,Math.min(500,Number(options.maxItems)||260))).map((row,i)=>({...row,no:i+1})),page.canvas,tokens.map(r=>r.bounds).filter(Boolean));
    return {...page,canvas:undefined,runs:undefined,tokens,reviewCandidates:classified.review,balloons,detection:{engine:'ocr_dimensions_v5',textItemCount:page.runs.length,lineCount:result.lineCount,detectedCount:tokens.length,balloonCount:balloons.length,reviewCount:classified.review.length,limited:classified.accepted.length>balloons.length,note:`${balloons.length} ölçü balonlandı; ${classified.review.length} belirsiz aday incelemeye ayrıldı. Düz sayısal ölçüler dahildir. Düşük güvenli okumaları ayrıca inceleyin. Ölçü listesini teknik resimle karşılaştırın.`}};
  }
  function arrange(rows,image,obstacles=[]){
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=Math.round(800*(image.height||image.naturalHeight)/(image.width||image.naturalWidth));
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,canvas.width,canvas.height);
    const {data}=ctx.getImageData(0,0,canvas.width,canvas.height);
    const ink=(x,y,r)=>{let count=0,total=0;for(let yy=Math.max(0,Math.floor(y-r));yy<Math.min(canvas.height,y+r);yy+=2)for(let xx=Math.max(0,Math.floor(x-r));xx<Math.min(canvas.width,x+r);xx+=2){const i=(yy*canvas.width+xx)*4;total++;if(data[i+3]>0&&(data[i]+data[i+1]+data[i+2])<660)count++;}return count/Math.max(1,total);};
    return root.FaiDetection.place(rows,{width:canvas.width,height:canvas.height,ink,obstacles});
  }
  async function arrangePreview(rows,src,obstacles=[]){const img=new Image();img.src=src;await img.decode();return arrange(rows,img,obstacles);}
  root.FaiReader={render,detect,arrange,arrangePreview};
})(window);
