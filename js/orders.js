(function(){
  const COL_ORD = "legacySalesOrders";
  const COL_WORK = "legacyWorkOrders";
  const hasDb = () => Boolean(window.DB && window.DB.getAll && window.DB.addDoc && window.DB.updateDoc && window.DB.deleteDoc);

  let ordersState = [];
  let workState = [];

  function uid() {
    return "o" + Date.now() + Math.floor(Math.random() * 999);
  }

  function escapeHtml(s) {
    if (!s) return "";
    return String(s).replace(/[&<>\"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  }

  async function loadState() {
    if (hasDb()) {
      const [orders, work] = await Promise.all([
        window.DB.getAll(COL_ORD),
        window.DB.getAll(COL_WORK),
      ]);
      ordersState = (orders || []).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      workState = (work || []).sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
    }
    renderOrders();
    renderWork();
  }

  async function addOrder(order) {
    if (hasDb()) {
      const id = await window.DB.addDoc(COL_ORD, order);
      if (!id) {
        alert("Siparis kaydedilemedi.");
        return;
      }
      ordersState = [{ id, ...order, createdAt: new Date().toISOString() }, ...ordersState];
    } else {
      ordersState = [{ id: uid(), ...order, createdAt: new Date().toISOString() }, ...ordersState];
    }
    renderOrders();
  }

  async function deleteOrder(id) {
    if (hasDb()) await window.DB.deleteDoc(COL_ORD, id);
    ordersState = ordersState.filter(x => x.id !== id);
    renderOrders();
  }

  async function addWork(work) {
    if (hasDb()) {
      const id = await window.DB.addDoc(COL_WORK, work);
      if (!id) return null;
      workState = [{ id, ...work, createdAt: new Date().toISOString() }, ...workState];
      return id;
    }
    const id = uid();
    workState = [{ id, ...work, createdAt: new Date().toISOString() }, ...workState];
    return id;
  }

  async function updateWork(id, patch) {
    if (hasDb()) await window.DB.updateDoc(COL_WORK, id, patch);
    workState = workState.map(w => (w.id === id ? { ...w, ...patch } : w));
  }

  async function deleteWork(id) {
    if (hasDb()) await window.DB.deleteDoc(COL_WORK, id);
    workState = workState.filter(x => x.id !== id);
    renderWork();
  }

  function renderOrders() {
    const out = document.getElementById("ordersList");
    const arr = ordersState;
    if (!arr.length) {
      out.innerHTML = '<div class="empty">Bekleyen siparis yok.</div>';
      return;
    }
    out.innerHTML =
      '<table class="list"><thead><tr><th>#</th><th>Musteri</th><th>Urun</th><th>Adet</th><th>Teslim</th><th>Islem</th></tr></thead><tbody>' +
      arr
        .map(
          (o, i) =>
            `<tr><td>${i + 1}</td><td>${escapeHtml(o.customer)}</td><td>${escapeHtml(o.product)}</td><td>${o.qty}</td><td>${o.due || "-"}</td><td><button data-id="${o.id}" class="convert">Is emrine donustur</button> <button data-id="${o.id}" class="del">Sil</button></td></tr>`
        )
        .join("") +
      "</tbody></table>";
    out.querySelectorAll(".convert").forEach(b => b.addEventListener("click", () => convertToWork(b.dataset.id)));
    out.querySelectorAll(".del").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Silinsin mi?")) await deleteOrder(b.dataset.id);
    }));
  }

  function renderWork() {
    const out = document.getElementById("workList");
    const arr = workState;
    if (!arr.length) {
      out.innerHTML = '<div class="empty">Is emri yok.</div>';
      return;
    }
    out.innerHTML =
      '<table class="list"><thead><tr><th>#</th><th>Referans</th><th>Musteri</th><th>Urun</th><th>Adet</th><th>Durum</th><th>Islem</th></tr></thead><tbody>' +
      arr
        .map(
          (w, i) =>
            `<tr><td>${i + 1}</td><td>${w.ref}</td><td>${escapeHtml(w.customer)}</td><td>${escapeHtml(w.product)}</td><td>${w.qty}</td><td>${w.status || "Acik"}</td><td><button data-id="${w.id}" class="complete">Tamamla</button> <button data-id="${w.id}" class="wdel">Sil</button></td></tr>`
        )
        .join("") +
      "</tbody></table>";
    out.querySelectorAll(".complete").forEach(b => b.addEventListener("click", () => completeWork(b.dataset.id)));
    out.querySelectorAll(".wdel").forEach(b => b.addEventListener("click", async () => {
      if (confirm("Is emri silinsin mi?")) await deleteWork(b.dataset.id);
    }));
  }

  async function convertToWork(id) {
    const order = ordersState.find(x => x.id === id);
    if (!order) return;

    await deleteOrder(id);
    const work = {
      ref: "WE-" + new Date().getFullYear() + "-" + (Math.floor(Math.random() * 9000) + 1000),
      customer: order.customer,
      product: order.product,
      qty: Number(order.qty || 0),
      due: order.due || "",
      created: new Date().toISOString(),
      status: "Acik",
    };
    const workId = await addWork(work);
    if (!workId) {
      alert("Is emri olusturulamadi.");
      return;
    }
    renderOrders();
    renderWork();
    alert("Siparis is emrine donusturuldu: " + work.ref);
  }

  async function completeWork(id) {
    const item = workState.find(x => x.id === id);
    if (!item) return;
    await updateWork(id, { status: "Tamamlandi" });
    renderWork();
  }

  async function clearAll() {
    if (!confirm("Tum siparisler temizlensin mi?")) return;
    if (hasDb()) {
      await Promise.all([
        ...ordersState.map(o => window.DB.deleteDoc(COL_ORD, o.id)),
        ...workState.map(w => window.DB.deleteDoc(COL_WORK, w.id)),
      ]);
    }
    ordersState = [];
    workState = [];
    renderOrders();
    renderWork();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("orderForm");
    form.addEventListener("submit", async e => {
      e.preventDefault();
      const fd = new FormData(form);
      const order = {
        customer: String(fd.get("customer") || "").trim(),
        product: String(fd.get("product") || "").trim(),
        qty: Math.max(1, Number(fd.get("qty") || 1)),
        due: String(fd.get("due") || ""),
      };
      await addOrder(order);
      form.reset();
    });
    document.getElementById("clearAll").addEventListener("click", clearAll);
    loadState();
  });
})();
