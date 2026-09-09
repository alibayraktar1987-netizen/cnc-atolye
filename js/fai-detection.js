(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FaiDetection=api;})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';
  const normalize=value=>String(value??'').replace(/[⌀∅]/g,'Ø').replace(/\b(?:DIA(?:METER)?|DIAM)\s*/gi,'Ø').replace(/×/g,'x').replace(/[−‐‑–—]/g,'-').replace(/\+\s*\/?\s*-/g,'±').replace(/\s+/g,' ').trim();
  const canonical=value=>normalize(value).replace(/,/g,'.').replace(/\s/g,'').toUpperCase();
  const num='(?:\\d{1,5}(?:[.,]\\d{1,6})?|[.,]\\d{1,6})';
  const tolerance=`(?:\\s*±\\s*${num}|\\s*[+-]\\s*${num}\\s*(?:/\\s*)?[+-]\\s*${num})?`;
  const pattern=`(?:[ØR]\\s*)?${num}(?:\\s*[xX]\\s*${num}){0,2}(?:\\s*(?:mm|[°]|(?:[HhGgFfKk]|[Jj][Ss])\\d{1,2}))?${tolerance}`;
  function matches(text){
    const input=normalize(text),out=[];
    if(/(?:\b(?:REV(?:ISION)?|DRAWING|DWG|SCALE|SHEET|DATE|MATERIAL|DRAWN|CHECKED|APPROVED|TARIH|SAYFA|MALZEME|WEIGHT|MASS|QTY|QUANTITY|ITEM|NOTE|NOTES)\b|ÖLÇEK|PARÇA\s*NO|AĞIRLIK|ADET|POZ\s*NO)/i.test(input))return out;
    const re=new RegExp(`(?:\\d+\\s*[xX]\\s*)?(?:M\\s*${num}(?:\\s*[xX]\\s*${num})?(?:\\s*-\\s*\\d{1,2}[GHgh])?|${pattern})`,'g');
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
    const consumed=new Set();
    for(const base of lines){
      if(!/^(?:[ØR]\s*)?\d+(?:[.,]\d+)?$/.test(base.text))continue;
      const last=base.spans[base.spans.length-1],ux=last.ux,uy=last.uy;
      const nearby=lines.filter(other=>other!==base&&!consumed.has(other)&&/^[+−-]\s*\d+(?:[.,]\d+)?$/.test(other.text)).filter(other=>{
        const first=other.spans[0],dx=first.x-last.x-ux*last.width,dy=first.y-last.y-uy*last.width;
        return first.ux*ux+first.uy*uy>.98&&dx*ux+dy*uy>=-base.height*.25&&dx*ux+dy*uy<base.height*1.5&&Math.abs(-dx*uy+dy*ux)<base.height*1.6&&other.height<=base.height;
      });
      const plus=nearby.filter(l=>l.text.startsWith('+')),minus=nearby.filter(l=>l.text.startsWith('-'));
      if(plus.length!==1||minus.length!==1)continue;
      for(const other of [plus[0],minus[0]]){const offset=base.text.length+1;base.text+=' '+other.text;base.spans.push(...other.spans.map(s=>({...s,start:s.start+offset,end:s.end+offset})));consumed.add(other);}
    }
    return lines.filter(line=>!consumed.has(line));
  }
  function detect(runs,width,height,page=1){
    const lines=groupRuns(runs),rows=[];
    for(const line of lines)for(const match of matches(line.text)){
      const spans=line.spans.filter(s=>s.start<match.end&&s.end>match.start);if(!spans.length)continue;
      const points=spans.flatMap(s=>{const n=s.end-s.start,from=Math.max(0,match.start-s.start)/n,to=Math.min(n,match.end-s.start)/n;return [from,to].map(t=>({x:s.x+s.ux*s.width*t,y:s.y+s.uy*s.width*t}));});
      const x=points.reduce((n,p)=>n+p.x,0)/points.length,y=points.reduce((n,p)=>n+p.y,0)/points.length;
      if(x<0||x>width||y<0||y>height)continue;
      const confidence=Math.min(...spans.map(s=>Number(s.confidence??1)))*(match.plain?.65:.95);
      const pad=Math.max(...spans.map(s=>s.height))/2;
      const bounds={left:(Math.min(...points.map(p=>p.x))-pad)/width*100,right:(Math.max(...points.map(p=>p.x))+pad)/width*100,top:(Math.min(...points.map(p=>p.y))-pad)/height*100,bottom:(Math.max(...points.map(p=>p.y))+pad)/height*100};
      rows.push({text:match.text,page,xPct:x/width*100,yPct:y/height*100,bounds,plain:match.plain,confidence:Number(confidence.toFixed(2)),source:spans[0].source||'ocr',reviewRequired:true});
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
  // Bare numbers have no reliable semantic meaning without drawing context.
  // Keep them available for explicit review instead of assigning a balloon.
  function classify(rows){
    const accepted=[],review=[];
    for(const row of rows){
      const explicit=/[ØR±°]|(?:^|\s|x)M\s*\d|\d\s*(?:H|h|g|G|Js)\d|\d\s*[+]\s*\d|\d\s*[xX]\s*\d|\d\s*mm/i.test(row.text);
      (row.confidence>=(explicit?.55:.5)?accepted:review).push({...row,...dimension(row.text),reason:explicit?'Ölçü gösterimi':'Sayısal ölçü adayı; çizimle karşılaştırın'});
    }
    return {accepted,review};
  }
  function dimension(value){
    const text=normalize(value).replace(/,/g,'.'),number='(?:\\d+(?:\\.\\d+)?|\\.\\d+)';
    const result={nominal:null,upperDeviation:null,lowerDeviation:null,upperLimit:null,lowerLimit:null,toleranceStatus:'not_specified',unit:text.includes('°')?'°':/\bmm\b/i.test(text)?'mm':'drawing',quantity:1};
    const qty=text.match(/^(\d+)\s*x\s*(?=[ØRM])/i);if(qty)result.quantity=Number(qty[1]);
    const body=qty?text.slice(qty[0].length):text;
    const match=body.match(new RegExp(`^(?:[ØRM]\\s*)?(${number})(.*)$`));if(!match)return {...result,toleranceStatus:'review'};
    result.nominal=Number(match[1]);const rest=match[2].trim();
    const symmetric=rest.match(new RegExp(`^(?:mm|°)?\\s*±\\s*(${number})\\s*(?:mm|°)?$`));
    const bilateral=rest.match(new RegExp(`^([+-])\\s*(${number})\\s*/?\\s*([+-])\\s*(${number})\\s*(?:mm|°)?$`));
    if(symmetric){result.upperDeviation=Number(symmetric[1]);result.lowerDeviation=-Number(symmetric[1]);}
    else if(bilateral){const a=Number(bilateral[1]+bilateral[2]),b=Number(bilateral[3]+bilateral[4]);result.upperDeviation=Math.max(a,b);result.lowerDeviation=Math.min(a,b);}
    else if(/[HhGgFfKk]\d|[Jj][Ss]\d/.test(rest))result.toleranceStatus='iso_fit_required';
    else if(rest&&!/^(?:mm|°)$/.test(rest))result.toleranceStatus='review';
    if(result.upperDeviation!==null){const round=n=>Number(n.toFixed(9));result.upperLimit=round(result.nominal+result.upperDeviation);result.lowerLimit=round(result.nominal+result.lowerDeviation);result.toleranceStatus='explicit';}
    return result;
  }
  function place(rows,{width=800,height=600,ink=()=>0,obstacles=[]}={}){
    const radius=12,placed=[],boxes=[...obstacles,...rows.map(r=>r.bounds).filter(Boolean)];
    const overlap=(x,y,b)=>x+radius>b.left*width/100&&x-radius<b.right*width/100&&y+radius>b.top*height/100&&y-radius<b.bottom*height/100;
    return rows.map(row=>{
      const ax=(row.anchorXPct??row.xPct)*width/100,ay=(row.anchorYPct??row.yPct)*height/100;
      let best=null;
      for(const distance of [28,40,56,76,100,132])for(let i=0;i<24;i++){
        const angle=i*Math.PI/12,x=ax+Math.cos(angle)*distance,y=ay+Math.sin(angle)*distance;
        if(x<radius||y<radius||x>width-radius||y>height-radius)continue;
        const collisions=boxes.filter(b=>overlap(x,y,b)).length+placed.filter(p=>Math.hypot(x-p.x,y-p.y)<radius*2+4).length;
        const score=collisions*100000+ink(x,y,radius)*2000+distance;
        if(!best||score<best.score)best={x,y,score,collisions};
      }
      best=best||{x:Math.max(radius,Math.min(width-radius,ax)),y:Math.max(radius,Math.min(height-radius,ay)),collisions:1};placed.push(best);
      return {...row,anchorXPct:ax/width*100,anchorYPct:ay/height*100,xPct:best.x/width*100,yPct:best.y/height*100,placementReview:best.collisions>0};
    });
  }
  return {normalize,canonical,matches,pdfRuns,groupRuns,detect,dedupe,ocrRuns,classify,place,dimension};
});
