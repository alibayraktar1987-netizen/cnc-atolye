(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FaiDetection=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const normalize=value=>String(value??'').replace(/[⌀∅]/g,'Ø').replace(/\b(?:DIA(?:METER)?|DIAM)\s*/gi,'Ø').replace(/×/g,'x').replace(/[−‐‑–—]/g,'-').replace(/\s+/g,' ').trim();
  const canonical=value=>normalize(value).replace(/,/g,'.').replace(/\s/g,'').toUpperCase();
  const num='(?:\\d{1,5}(?:[.,]\\d{1,6})?|[.,]\\d{1,6})';
  const tolerance=`(?:\\s*±\\s*${num}|\\s*[+]\\s*${num}\\s*(?:/\\s*)?-\\s*${num}|\\s*-\\s*${num}\\s*(?:/\\s*)?[+]\\s*${num})?`;
  const pattern=`(?:[ØR]\\s*)?${num}(?:\\s*[xX]\\s*${num}){0,2}(?:\\s*(?:mm|[°]|(?:[HhGgFfKk]|[Jj][Ss])\\d{1,2}))?${tolerance}`;
  function matches(text){
    const input=normalize(text),out=[];
    if(/\b(?:REV(?:ISION)?|DRAWING|DWG|SCALE|SHEET|DATE|MATERIAL|DRAWN|CHECKED|APPROVED|TARIH|ÖLÇEK|SAYFA|MALZEME|PARÇA\s*NO)\b/i.test(input))return out;
    const re=new RegExp(`M\\s*${num}(?:\\s*[xX]\\s*${num})?(?:\\s*-\\s*\\d{1,2}[GHgh])?|${pattern}`,'g');
    for(const m of input.matchAll(re)){
      const before=input.slice(0,m.index),after=input.slice(m.index+m[0].length);
      if(/[\w:./+-]$/.test(before)||/^[\w:./+-]/.test(after))continue;
      const value=normalize(m[0]);if(!value||!Number.isFinite(Number(value.replace(/[^0-9.]/g,'')))&&/^\d+$/.test(value))continue;
      out.push({text:value,start:m.index,end:m.index+m[0].length,plain:/^\d+(?:[.,]\d+)?$/.test(value)});
    }
    return out;
  }
  const multiply=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
  function pdfRuns(items,viewport){
    return (items||[]).filter(i=>String(i.str||'').trim()).map(item=>{
      const t=multiply(viewport.transform,item.transform),length=Math.hypot(t[0],t[1])||1,ux=t[0]/length,uy=t[1]/length;
      const height=Math.hypot(t[2],t[3])||Math.abs(item.height*viewport.scale)||8,vx=t[2]/(height||1),vy=t[3]/(height||1);
      return {text:normalize(item.str),x:t[4]+vx*height/2,y:t[5]+vy*height/2,ux,uy,width:Math.abs(item.width*viewport.scale)||length,height,confidence:1,source:'pdf_text'};
    });
  }
  function groupRuns(runs){
    const groups=[];
    for(const run of runs){
      const same=groups.find(g=>g.ux*run.ux+g.uy*run.uy>.98&&Math.abs((run.x-g.x)*(-g.uy)+(run.y-g.y)*g.ux)<=Math.max(2,Math.min(g.height,run.height)*.55));
      if(same)same.runs.push(run);else groups.push({...run,runs:[run]});
    }
    const lines=[];
    for(const g of groups){
      const sorted=g.runs.sort((a,b)=>(a.x-b.x)*g.ux+(a.y-b.y)*g.uy);let segment=null,previous=null;
      for(const run of sorted){
        const gap=previous?(run.x-previous.x)*g.ux+(run.y-previous.y)*g.uy-previous.width:Infinity;
        if(!segment||gap>Math.max(run.height,previous.height)*2.2){segment={text:'',spans:[],height:run.height};lines.push(segment);}
        const space=segment.text&&gap>Math.min(run.height,previous?.height||run.height)*.12?' ':'';
        segment.text+=space;const start=segment.text.length;segment.text+=run.text;segment.spans.push({...run,start,end:segment.text.length});previous=run;
      }
    }
    return lines;
  }
  function detect(runs,width,height,page=1){
    const lines=groupRuns(runs),rows=[];
    for(const line of lines)for(const match of matches(line.text)){
      const spans=line.spans.filter(s=>s.start<match.end&&s.end>match.start);if(!spans.length)continue;
      const points=spans.flatMap(s=>{const n=s.end-s.start,from=Math.max(0,match.start-s.start)/n,to=Math.min(n,match.end-s.start)/n;return [from,to].map(t=>({x:s.x+s.ux*s.width*t,y:s.y+s.uy*s.width*t}));});
      const x=points.reduce((n,p)=>n+p.x,0)/points.length,y=points.reduce((n,p)=>n+p.y,0)/points.length;
      if(x<0||x>width||y<0||y>height)continue;
      const confidence=Math.min(...spans.map(s=>Number(s.confidence??1)))*(match.plain?.65:.95);
      rows.push({text:match.text,page,xPct:x/width*100,yPct:y/height*100,confidence:Number(confidence.toFixed(2)),source:spans[0].source||'ocr',reviewRequired:true});
    }
    return {rows:dedupe(rows),lineCount:lines.length};
  }
  function dedupe(rows){
    const result=[];
    for(const row of rows){if(!row.text||!Number.isFinite(row.xPct)||!Number.isFinite(row.yPct)||row.xPct<0||row.xPct>100||row.yPct<0||row.yPct>100)continue;
      if(result.some(r=>r.page===row.page&&canonical(r.text)===canonical(row.text)&&Math.abs(r.xPct-row.xPct)<.35&&Math.abs(r.yPct-row.yPct)<.35))continue;result.push(row);}
    return result.sort((a,b)=>a.page-b.page||a.yPct-b.yPct||a.xPct-b.xPct);
  }
  function ocrRuns(data,width,height,rotation=0){
    const words=(data.blocks||[]).flatMap(b=>(b.paragraphs||[]).flatMap(p=>(p.lines||[]).flatMap(l=>l.words||[])));
    return words.filter(w=>w.text&&w.bbox&&Number(w.confidence)>=25).map(w=>{
      const b=w.bbox,x=b.x0,y=(b.y0+b.y1)/2,base={text:normalize(w.text),width:b.x1-b.x0,height:b.y1-b.y0,confidence:Number(w.confidence)/100,source:'ocr'};
      if(rotation===90)return {...base,x:y,y:height-x,ux:0,uy:-1};
      if(rotation===270)return {...base,x:width-y,y:x,ux:0,uy:1};
      return {...base,x,y,ux:1,uy:0};
    });
  }
  return {normalize,canonical,matches,pdfRuns,groupRuns,detect,dedupe,ocrRuns};
});
