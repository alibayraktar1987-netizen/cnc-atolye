(function (root, factory) {
  const reporting = factory();
  if (typeof module === "object" && module.exports) module.exports = reporting;
  else root.Reporting = reporting;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";
  const number = value => Number.isFinite(Number(value)) ? Number(value) : 0;
  const text = value => String(value ?? "").trim();
  const searchText = value => text(value).toLocaleLowerCase("tr").replace(/[çğıöşü]/g, c => ({ç:"c",ğ:"g",ı:"i",ö:"o",ş:"s",ü:"u"}[c]));
  const format = value => value === null ? "—" : number(value).toLocaleString("tr-TR", { maximumFractionDigits: 2 });
  const localDate = value => {
    if (!value) return "";
    const raw = text(value);
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      const date = new Date(raw + "T12:00:00");
      return !Number.isNaN(date.getTime()) && ymd(date) === raw ? raw : "";
    }
    const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
    return Number.isNaN(date.getTime()) ? "" : ymd(date);
  };
  function ymd(date) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`; }
  function addDays(date, days) { const d = new Date(date + "T12:00:00"); d.setDate(d.getDate()+days); return ymd(d); }
  function range(preset, today, from = "", to = "") {
    if (preset === "all") return { from:"", to:"", label:"Tüm tarihler", valid:true };
    const start = preset === "today" ? today : preset === "month" ? today.slice(0,7)+"-01" : preset === "last30" ? addDays(today,-29) : addDays(today,-6);
    const result = { from:preset === "custom" ? from : start, to:preset === "custom" ? to : today };
    result.valid = Boolean(localDate(result.from) && localDate(result.to) && result.from <= result.to);
    result.label = result.valid ? `${displayDate(result.from)} – ${displayDate(result.to)}` : "Başlangıç ve bitiş tarihini kontrol edin";
    return result;
  }
  function previousRange(current) {
    if (!current.valid || !current.from || !current.to) return null;
    const count = Math.round((Date.parse(current.to+"T12:00:00Z")-Date.parse(current.from+"T12:00:00Z"))/86400000)+1;
    return { from:addDays(current.from,-count), to:addDays(current.from,-1), valid:true };
  }
  function displayDate(value) { const date = localDate(value); return date ? date.split("-").reverse().join(".") : "Tarih yok"; }
  const statusLabels = {planned:"Planlandı",in_production:"Üretimde",waiting:"Bekliyor",completed:"Tamamlandı",cancelled:"İptal",active:"Aktif",passive:"Pasif",liquidation:"Tasfiye",shipped:"Sevk edildi",offer:"Teklif",approved:"Onaylandı",delivered:"Teslim edildi",new:"Yeni",converted:"Dönüştürüldü",pass:"Uygun",fail:"Uygun değil",conditional:"Şartlı kabul",normal:"Normal",acil:"Acil",dusuk:"Düşük"};
  const label = value => Object.hasOwn(statusLabels,value) ? statusLabels[value] : text(value) || "Belirtilmemiş";
  const dimension = (id, label) => ({id,label});
  const metric = (id, label, unit="adet", aggs=["sum","avg","max","min"]) => ({id,label,unit,aggs});
  const count = metric("__count","Kayıt sayısı","kayıt",["sum"]);
  const all = dimension("__all","Tek toplam");
  const sources = {
    entries:{label:"Üretim",question:"Üretim nasıl gidiyor?",description:"Üretim miktarını, sağlam ve hatalı adetleri görün.",collection:"entries",dateLabel:"Üretim tarihi",icon:"giris",dimension:"machine",metric:"totalParts",dimensions:[dimension("machine","Tezgaha göre"),dimension("date","Günlere göre"),dimension("operatorName","Operatöre göre"),dimension("jobCode","İş emrine göre"),dimension("shift","Vardiyaya göre"),all],metrics:[metric("totalParts","Toplam üretim"),metric("correct","Sağlam üretim"),metric("wrong","Hatalı üretim"),metric("partSec","Parça süresi","sn",["avg","max","min"]),count]},
    orders:{label:"Teslimat",question:"Hangi işler gecikiyor?",description:"Açık işleri ve teslim tarihi geçen siparişleri bulun.",collection:"orders",snapshot:true,dateLabel:"Açık işlerin güncel durumu",icon:"orders",dimension:"deliveryState",metric:"__count",dimensions:[dimension("deliveryState","Teslim durumuna göre"),dimension("customerName","Müşteriye göre"),dimension("machineMain","Tezgaha göre"),dimension("status","İş durumuna göre"),dimension("priority","Önceliğe göre"),dimension("material","Malzemeye göre"),all],metrics:[count,metric("qty","Planlanan miktar"),metric("partSec","Parça süresi","sn",["avg","max","min"])]},
    quality:{label:"Kalite",question:"Kalitede sorun var mı?",description:"Muayene sonuçlarını ve hurda nedenlerini inceleyin.",collection:"qualityInspections",dateLabel:"Muayene kayıt tarihi",icon:"quality",dimension:"result",metric:"__count",dimensions:[dimension("result","Sonuca göre"),dimension("scrapReason","Hurda nedenine göre"),dimension("partNo","Parçaya göre"),dimension("orderCode","İş emrine göre"),dimension("date","Günlere göre"),all],metrics:[count,metric("scrapQty","Hurda miktarı"),metric("scrapCost","Hurda maliyeti","currency")]},
    downtime:{label:"Duruş",question:"Nerede zaman kaybediyoruz?",description:"Duruş süresini ve en sık karşılaşılan nedenleri görün.",collection:"downtimeEvents",dateLabel:"Duruş başlangıç tarihi",icon:"downtime",dimension:"typeName",metric:"durationMin",dimensions:[dimension("typeName","Nedene göre"),dimension("machine","Tezgaha göre"),dimension("date","Günlere göre"),dimension("category","Kategoriye göre"),dimension("shift","Vardiyaya göre"),all],metrics:[metric("durationMin","Duruş süresi","dk"),count]},
    materials:{label:"Stok",question:"Hangi malzeme azalıyor?",description:"Eksilen stokları ve sipariş gerektiren malzemeleri bulun.",collection:"materials",snapshot:true,dateLabel:"Güncel stok kartları",icon:"materials",dimension:"stockState",metric:"__count",dimensions:[dimension("stockState","Stok durumuna göre"),dimension("type","Malzeme türüne göre"),dimension("trackingMode","Takip biçimine göre"),dimension("valuationMethod","Değerleme biçimine göre"),dimension("unit","Birime göre"),all],metrics:[count,metric("stock","Stok miktarı","stockUnit"),metric("reorderPoint","Sipariş eşiği","stockUnit"),metric("safetyStock","Güvenlik stoku","stockUnit"),metric("leadTimeDays","Tedarik süresi","gün",["avg","max","min"])]},
    salesOrders:{label:"Satış",question:"Satışların durumu ne?",description:"Sipariş tutarlarını para birimleri ayrı olarak izleyin.",collection:"salesOrders",dateLabel:"Sipariş tarihi",icon:"sales",dimension:"customerName",metric:"totalAmount",dimensions:[dimension("customerName","Müşteriye göre"),dimension("status","Duruma göre"),dimension("date","Günlere göre"),dimension("priority","Önceliğe göre"),all],metrics:[metric("totalAmount","Sipariş tutarı","currency"),metric("qty","Sipariş miktarı"),metric("deliveredQty","Teslim edilen miktar"),metric("openQty","Açık miktar"),count]}
  };
  function normalizeConfig(raw={}) {
    const source = Object.hasOwn(sources,raw.source) ? raw.source : "entries", def = sources[source];
    const selectedMetric = def.metrics.find(m=>m.id===raw.metric) || def.metrics.find(m=>m.id===def.metric);
    return {name:text(raw.name),source,dimension:def.dimensions.some(d=>d.id===raw.dimension)?raw.dimension:def.dimension,metric:selectedMetric.id,aggregation:selectedMetric.aggs.includes(raw.aggregation)?raw.aggregation:selectedMetric.aggs[0],chartType:["column","line","pie","donut","table"].includes(raw.chartType)?raw.chartType:"column",maxItems:Math.max(3,Math.min(40,Math.floor(number(raw.maxItems)||12)))};
  }
  function normalizeRows(source, input, today) {
    return (Array.isArray(input)?input:[]).map((raw,index)=>{
      const r={...raw,id:raw.id||`row-${index}`,currency:text(raw.currency).toUpperCase()||"Para birimi yok",unit:text(raw.unit)||"Birim belirtilmemiş"};
      if(source==="entries") Object.assign(r,{date:localDate(raw.date),operatorName:raw.operatorName||raw.operatorId||"Belirtilmemiş",totalParts:number(raw.correct)+number(raw.wrong)});
      if(source==="orders") {
        const closed=["completed","cancelled","passive","liquidation","shipped"].includes(raw.status);
        const due=localDate(raw.dueDate);
        Object.assign(r,{date:due,machineMain:Array.isArray(raw.machines)&&raw.machines.length?raw.machines.join(", "):raw.machine||"Atanmamış",deliveryState:closed?"Kapalı":!due?"Termin belirtilmemiş":due<today?"Gecikmiş":due===today?"Bugün teslim":"Zamanı var",daysLate:!closed&&due&&due<today?Math.round((Date.parse(today+"T12:00:00Z")-Date.parse(due+"T12:00:00Z"))/86400000):0});
      }
      if(source==="salesOrders") Object.assign(r,{date:localDate(raw.orderDate||raw.date||raw.createdAt),openQty:Math.max(0,number(raw.qty)-number(raw.deliveredQty))});
      if(source==="materials") Object.assign(r,{date:"",stockState:number(raw.stock)<=0?"Stok yok":number(raw.stock)<Math.max(number(raw.reorderPoint),number(raw.safetyStock))?"Sipariş gerekli":"Yeterli"});
      if(source==="downtime") r.date=localDate(raw.date||raw.startAt);
      if(source==="quality") r.date=localDate(raw.date||raw.inspectionDate||raw.createdAt);
      r.recordDate=r.date;
      return r;
    });
  }
  function filterRows(source, rows, filters={}, dateRange={valid:true,from:"",to:""}) {
    if(!dateRange.valid&&!sources[source].snapshot) return [];
    const terms=searchText(filters.search).split(/\s+/).filter(Boolean);
    return rows.filter(row=>{
      if(!sources[source].snapshot&&(dateRange.from||dateRange.to)&&(!row.date||row.date<dateRange.from||row.date>dateRange.to)) return false;
      if(filters.machine&&filters.machine!=="all"&&row.machine!==filters.machine&&row.machineMain!==filters.machine&&!(Array.isArray(row.machines)?row.machines:[]).includes(filters.machine)) return false;
      if(filters.currency&&filters.currency!=="all"&&row.currency!==filters.currency) return false;
      if(filters.focus==="late"&&row.deliveryState!=="Gecikmiş") return false;
      if(filters.focus==="attention"&&!['Stok yok','Sipariş gerekli'].includes(row.stockState)) return false;
      if(filters.focus==="failed"&&row.result!=="fail") return false;
      const searchable=searchText(Object.values(row).filter(v=>typeof v==="string"||typeof v==="number").map(v=>label(v)).join(" "));
      return terms.every(term=>searchable.includes(term));
    });
  }
  function aggregate(values, mode) {
    if(!values.length) return 0;
    if(mode==="avg") return values.reduce((a,b)=>a+b,0)/values.length;
    if(mode==="min") return values.reduce((a,b)=>Math.min(a,b),Infinity);
    if(mode==="max") return values.reduce((a,b)=>Math.max(a,b),-Infinity);
    return values.reduce((a,b)=>a+b,0);
  }
  function groupRows(rows, rawConfig) {
    const config=normalizeConfig(rawConfig), def=sources[config.source], metricDef=def.metrics.find(m=>m.id===config.metric), buckets=new Map();
    for(const row of rows) {
      const group=config.dimension==="__all"?"Toplam":config.dimension==="date"?row.date||"Tarih yok":label(row[config.dimension]);
      const unit=metricDef.unit==="currency"?row.currency:metricDef.unit==="stockUnit"?row.unit:metricDef.unit;
      const key=JSON.stringify([group,unit]);
      if(!buckets.has(key)) buckets.set(key,{key,label:group,unit,values:[],rows:[]});
      const bucket=buckets.get(key);bucket.values.push(config.metric==="__count"?1:number(row[config.metric]));bucket.rows.push(row);
    }
    return [...buckets.values()].map(b=>({...b,value:aggregate(b.values,config.aggregation),count:b.rows.length})).sort((a,b)=>config.dimension==="date"?a.label.localeCompare(b.label):b.value-a.value||a.label.localeCompare(b.label,"tr"));
  }
  function totalsByUnit(rows, rawConfig) {
    return groupRows(rows,{...rawConfig,dimension:"__all"});
  }
  function insights(source, rows, today) {
    const sum=field=>rows.reduce((n,r)=>n+number(r[field]),0);
    const card=(label,value,unit,help,tone="normal")=>({label,value,unit,help,tone});
    if(source==="entries") {
      const total=sum("totalParts"),correct=sum("correct"),wrong=sum("wrong");
      return {cards:[card("Toplam üretim",total,"adet","Sağlam ve hatalı üretilen adetlerin toplamı."),card("Sağlam üretim",correct,"adet","Sağlam olarak kaydedilen üretim.","good"),card("Hatalı üretim",wrong,"adet","Hatalı olarak kaydedilen üretim.",wrong?"warn":"normal"),card("Sağlam ürün oranı",total?correct/total*100:null,"%","Sağlam adet / toplam üretim × 100. Kayıt yoksa oran hesaplanmaz.")],message:total?`${format(total)} adet üretimin ${format(correct)} adedi sağlam. Hatalı üretim ${format(wrong)} adet.`:"Bu seçimde üretim kaydı bulunmuyor. Tarihi veya filtreleri değiştirebilirsiniz."};
    }
    if(source==="orders") {
      const open=rows.filter(r=>r.deliveryState!=="Kapalı"),late=open.filter(r=>r.daysLate>0),due=open.filter(r=>r.date===today),undated=open.filter(r=>!r.date);
      return {cards:[card("Açık iş",open.length,"iş emri","Tamamlanan, iptal, pasif, tasfiye ve sevk edilen işler hariç."),card("Geciken",late.length,"iş emri","Teslim tarihi geçmiş ve hâlâ açık işler.",late.length?"warn":"good"),card("Bugün teslim",due.length,"iş emri","Teslim tarihi bugün olan açık işler."),card("Termini eksik",undated.length,"iş emri","Gecikme değerlendirmesi için tarih girilmesi gerekir.")],message:late.length?`${late.length} açık işin teslim tarihi geçmiş. En uzun gecikme ${Math.max(...late.map(r=>r.daysLate))} gün.`:"Seçimde teslim tarihi geçmiş açık iş bulunmuyor. Termin bilgisi eksik işleri ayrıca kontrol edin."};
    }
    if(source==="quality") {
      const failed=rows.filter(r=>r.result==="fail").length,decided=rows.filter(r=>["pass","fail"].includes(r.result)).length;
      return {cards:[card("Muayene",rows.length,"kayıt","Seçili dönemde açılan muayene kayıtları."),card("Uygun olmayan",failed,"muayene","Sonucu uygun değil olarak kaydedilen muayeneler.",failed?"warn":"good"),card("Hurda",sum("scrapQty"),"adet","Muayenelerde kaydedilen hurda miktarı."),card("Olumsuz sonuç oranı",decided?failed/decided*100:null,"%","Uygun değil / sonucu uygun veya uygun değil olan muayeneler. Ürün hata oranı değildir.")],message:rows.length?`${rows.length} muayenenin ${failed} tanesi uygun değil. Hurda nedenlerine göre görünümü seçerek kayıtları inceleyebilirsiniz.`:"Bu tarihlerde muayene kaydı bulunmuyor."};
    }
    if(source==="downtime") {
      const total=sum("durationMin"),machines=new Set(rows.map(r=>r.machine).filter(Boolean));
      return {cards:[card("Toplam duruş",total,"dk","Kaydedilen duruş sürelerinin toplamı.",total?"warn":"normal"),card("Duruş sayısı",rows.length,"kayıt","Seçili filtrelere uyan duruş kayıtları."),card("Ortalama duruş",rows.length?total/rows.length:null,"dk","Toplam süre / duruş kaydı sayısı."),card("Etkilenen tezgah",machines.size,"tezgah","Duruş kaydı olan farklı tezgah sayısı.")],message:rows.length?`${machines.size} tezgahta toplam ${format(total)} dakika duruş kaydedilmiş. En uzun kayba neden olan gruptan başlayın.`:"Bu dönemde kayıtlı duruş bulunmuyor."};
    }
    if(source==="materials") {
      const zero=rows.filter(r=>r.stockState==="Stok yok").length,low=rows.filter(r=>r.stockState==="Sipariş gerekli").length;
      return {cards:[card("Malzeme kartı",rows.length,"kart","Güncel filtreye uyan malzeme kartları."),card("Stok yok",zero,"kart","Stok miktarı sıfır veya negatif olan kartlar.",zero?"warn":"good"),card("Sipariş gerekli",low,"kart","Stok miktarı sipariş veya güvenlik eşiğinin altında.",low?"warn":"normal"),card("Yeterli stok",rows.length-zero-low,"kart","Kayıtlı eşiklere göre yeterli olan kartlar.")],message:`${zero+low} malzeme kartı stok açısından dikkat gerektiriyor. Farklı ölçü birimlerindeki stok miktarları birbiriyle toplanmaz.`};
    }
    const amounts=totalsByUnit(rows,{source:"salesOrders",metric:"totalAmount"}).map(r=>`${format(r.value)} ${r.unit}`).join(" · ");
    return {cards:[card("Satış siparişi",rows.length,"kayıt","Seçili sipariş tarihlerindeki kayıt sayısı."),card("Müşteri",new Set(rows.map(r=>r.customerId||r.customerName).filter(Boolean)).size,"müşteri","Siparişi bulunan farklı müşteri sayısı."),card("Sipariş miktarı",sum("qty"),"adet","Siparişlerde kayıtlı miktarların toplamı."),card("Açık miktar",rows.filter(r=>!["cancelled","delivered"].includes(r.status)).reduce((n,r)=>n+r.openQty,0),"adet","İptal ve teslim edilmiş siparişler hariç kalan miktar.")],message:rows.length?`Sipariş tutarları: ${amounts}. Bunlar sipariş kayıtlarının tutarlarıdır; tahsilat veya ciro hesabı değildir.`:"Bu tarihlerde satış siparişi kaydı bulunmuyor."};
  }
  const detailColumns = {
    entries:[["date","Üretim tarihi"],["jobCode","İş emri"],["machine","Tezgah"],["operatorName","Operatör"],["correct","Sağlam","number"],["wrong","Hatalı","number"],["totalParts","Toplam","number"]],
    orders:[["code","İş emri"],["name","Parça"],["customerName","Müşteri"],["date","Termin"],["deliveryState","Teslim durumu"],["daysLate","Gecikme (gün)","number"],["qty","Miktar","number"]],
    quality:[["date","Kayıt tarihi"],["orderCode","İş emri"],["partNo","Parça"],["result","Sonuç"],["scrapQty","Hurda","number"],["scrapReason","Hurda nedeni"]],
    downtime:[["date","Tarih"],["machine","Tezgah"],["typeName","Duruş nedeni"],["durationMin","Süre (dk)","number"],["shift","Vardiya"]],
    materials:[["code","Malzeme kodu"],["name","Malzeme"],["stock","Stok","number"],["unit","Birim"],["reorderPoint","Sipariş eşiği","number"],["safetyStock","Güvenlik stoku","number"],["stockState","Stok durumu"]],
    salesOrders:[["code","Sipariş"],["date","Sipariş tarihi"],["customerName","Müşteri"],["status","Durum"],["totalAmount","Tutar","number"],["currency","Para birimi"],["qty","Miktar","number"]]
  };
  function cell(row, column) { const [key,,type]=column;return key==="date"?displayDate(row[key]):type==="number"?format(row[key]):label(row[key]); }
  function csv(columns, rows) {
    const escape=value=>{let s=String(value??"");if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
    return '\uFEFF'+[columns.map(c=>escape(c[1])).join(';'),...rows.map(r=>columns.map(c=>escape(cell(r,c))).join(';'))].join('\r\n');
  }
  function collections(rows, {mode="planned",from="",to="",currency="all",granularity="day"}={}) {
    const eligible=(rows||[]).filter(r=>{const status=String(r.status||"planned").toLowerCase();return (r.flow||"tahsilat")==="tahsilat" && (mode==="collected"?status==="collected":!["collected","paid","cancelled"].includes(status));});
    const prepared=eligible.map(r=>({...r,currency:text(r.currency||"TRY").toUpperCase(),chartDate:localDate(mode==="collected"?r.collectionDate:r.dueDate)}));
    const currencies=[...new Set(prepared.map(r=>r.currency))].sort();
    const scoped=prepared.filter(r=>currency==="all"||r.currency===currency);
    const undated=scoped.filter(r=>!r.chartDate).length;
    const valid=(!from||Boolean(localDate(from)))&&(!to||Boolean(localDate(to)))&&(!from||!to||from<=to);
    const filtered=valid?scoped.filter(r=>r.chartDate&&(!from||r.chartDate>=from)&&(!to||r.chartDate<=to)):[];
    const buckets=new Map();
    filtered.forEach(r=>{const date=granularity==="month"?r.chartDate.slice(0,7):r.chartDate,key=JSON.stringify([date,r.currency]);if(!buckets.has(key))buckets.set(key,{key,date,currency:r.currency,amount:0,rows:[]});const b=buckets.get(key);b.amount+=number(r.amount);b.rows.push(r);});
    return {valid,currencies,undated,rows:filtered,groups:[...buckets.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.currency.localeCompare(b.currency))};
  }
  return {sources,detailColumns,number,format,label,localDate,displayDate,range,previousRange,addDays,normalizeConfig,normalizeRows,filterRows,groupRows,totalsByUnit,insights,cell,csv,collections};
});
