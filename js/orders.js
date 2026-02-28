// Basit sipariş yönetimi - localStorage kullanır
(function(){
  const LS_ORD='orders_v1';
  const LS_WORK='workorders_v1';

  function uid(){return 'o'+Date.now()+Math.floor(Math.random()*999);} 
  function getOrders(){try{return JSON.parse(localStorage.getItem(LS_ORD)||'[]')}catch(e){return []}}
  function setOrders(v){localStorage.setItem(LS_ORD,JSON.stringify(v))}
  function getWork(){try{return JSON.parse(localStorage.getItem(LS_WORK)||'[]')}catch(e){return []}}
  function setWork(v){localStorage.setItem(LS_WORK,JSON.stringify(v))}

  function renderOrders(){
    const out=document.getElementById('ordersList');
    const arr=getOrders();
    if(!arr.length){out.innerHTML='<div class="empty">Bekleyen sipariş yok.</div>';return}
    out.innerHTML = '<table class="list"><thead><tr><th>#</th><th>Müşteri</th><th>Ürün</th><th>Adet</th><th>Teslim</th><th>İşlem</th></tr></thead><tbody>'+
      arr.map((o,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(o.customer)}</td><td>${escapeHtml(o.product)}</td><td>${o.qty}</td><td>${o.due||'-'}</td><td><button data-id="${o.id}" class="convert">İş emrine dönüştür</button> <button data-id="${o.id}" class="del">Sil</button></td></tr>`).join('')+
      '</tbody></table>';
    out.querySelectorAll('.convert').forEach(b=>b.addEventListener('click',()=>convertToWork(b.dataset.id)));
    out.querySelectorAll('.del').forEach(b=>b.addEventListener('click',()=>{ if(confirm('Silinsin mi?')){ deleteOrder(b.dataset.id)}}));
  }

  function renderWork(){
    const out=document.getElementById('workList');
    const arr=getWork();
    if(!arr.length){out.innerHTML='<div class="empty">İş emri yok.</div>';return}
    out.innerHTML = '<table class="list"><thead><tr><th>#</th><th>Referans</th><th>Müşteri</th><th>Ürün</th><th>Adet</th><th>Durum</th><th>İşlem</th></tr></thead><tbody>'+
      arr.map((w,i)=>`<tr><td>${i+1}</td><td>${w.ref}</td><td>${escapeHtml(w.customer)}</td><td>${escapeHtml(w.product)}</td><td>${w.qty}</td><td>${w.status||'Açık'}</td><td><button data-id="${w.id}" class="complete">Tamamla</button> <button data-id="${w.id}" class="wdel">Sil</button></td></tr>`).join('')+
      '</tbody></table>';
    out.querySelectorAll('.complete').forEach(b=>b.addEventListener('click',()=>completeWork(b.dataset.id)));
    out.querySelectorAll('.wdel').forEach(b=>b.addEventListener('click',()=>{ if(confirm('İş emrini silinsin mi?')){ deleteWork(b.dataset.id)}}));
  }

  function escapeHtml(s){if(!s) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]);}

  function addOrder(o){ const arr=getOrders(); arr.unshift(o); setOrders(arr); renderOrders(); }
  function deleteOrder(id){ setOrders(getOrders().filter(x=>x.id!==id)); renderOrders(); }

  function convertToWork(id){
    const arr=getOrders(); const o=arr.find(x=>x.id===id); if(!o) return; 
    // remove from orders
    setOrders(arr.filter(x=>x.id!==id));
    // create work order
    const w={id:uid(), ref:'WE-'+(new Date().getFullYear())+'-'+(Math.floor(Math.random()*9000)+1000), customer:o.customer, product:o.product, qty:o.qty, due:o.due, created:new Date().toISOString(), status:'Açık'};
    const ws=getWork(); ws.unshift(w); setWork(ws);
    renderOrders(); renderWork();
    alert('Sipariş iş emrine dönüştürüldü: '+w.ref);
  }

  function completeWork(id){ const ws=getWork(); const item=ws.find(x=>x.id===id); if(!item) return; item.status='Tamamlandı'; setWork(ws); renderWork(); }
  function deleteWork(id){ setWork(getWork().filter(x=>x.id!==id)); renderWork(); }

  document.addEventListener('DOMContentLoaded',()=>{
    const form=document.getElementById('orderForm');
    form.addEventListener('submit',e=>{
      e.preventDefault(); const fd=new FormData(form); const o={ id:uid(), customer:fd.get('customer')||'', product:fd.get('product')||'', qty: Number(fd.get('qty')||1), due: fd.get('due')||'' };
      addOrder(o); form.reset();
    });
    document.getElementById('clearAll').addEventListener('click',()=>{ if(confirm('Tüm siparişler temizlensin mi?')){ localStorage.removeItem(LS_ORD); localStorage.removeItem(LS_WORK); renderOrders(); renderWork(); }});
    renderOrders(); renderWork();
  });
})();
