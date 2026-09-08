// No live Firebase access: execute the module boundary with an in-memory SDK.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
const firebase = html.match(/<script type="module">([\s\S]*?)<\/script>/)[1].replace(/^import .*;$/gm, '');
const app = html.match(/<script id="factorab-app-source" type="text\/plain">([\s\S]*?)<\/script>/)[1];
function declaration(name) {
  const start = app.search(new RegExp(`^(?:async )?function ${name}\\(`, 'm'));
  assert.ok(start >= 0, `Missing function ${name}`);
  const end = app.indexOf('\n}', start);
  return app.slice(start, end + 2);
}
const uploads = [];
const context = vm.createContext({
  console, Blob, TextEncoder, URL, Event, Date,
  window: {dispatchEvent() {}},
  initializeApp: () => ({}), getFirestore: () => ({}), getStorage: () => ({}),
  storageRef: (_, key) => key,
  uploadBytes: async (...args) => uploads.push(args),
  getDownloadURL: async key => `https://files.test/${key}`,
});
vm.runInContext(`(function(){${firebase}\n})();`, context);
vm.runInContext(declaration('estimateSerializedBytes'), context);
async function main() {
  assert.equal(vm.runInContext('typeof sanitizeForFirestore', context), 'undefined', 'Module internals should remain private');
  assert.equal(vm.runInContext('estimateSerializedBytes({a:undefined,b:"ç",n:Infinity})', context),
    Buffer.byteLength(JSON.stringify({b:'ç',n:0})));
  assert.equal(typeof context.window.FileStorage.blobToDataUrl, 'function');
  for (const folder of ['parts', 'work-orders']) {
    const file = new Blob(['drawing'], {type:'application/pdf'});
    file.name = 'teknik resim.pdf';
    const saved = await context.window.FileStorage.uploadFileToStorage(file, {folder});
    assert.ok(saved.storagePath.startsWith(`${folder}/`));
    assert.ok(saved.url.startsWith('https://files.test/'));
    assert.equal(saved.size, 7);
  }
  assert.equal(uploads.length, 2);
  for (const helper of ['uploadFileToStorage', 'blobToDataUrl', 'sanitizeForFirestore']) {
    assert.ok(!new RegExp(`(?<![\\w.])${helper}\\(`).test(app), `Unscoped module helper: ${helper}`);
  }
  vm.runInContext('const LOGO_SRC="./logo.png"; const FACTORAB_FAVICON_FALLBACK="data:image/svg+xml,test";', context);
  vm.runInContext(declaration('resolvePrintAssetUrl'), context);
  assert.equal(vm.runInContext('resolvePrintAssetUrl(LOGO_SRC)', context), 'data:image/svg+xml,test');
  assert.equal(vm.runInContext('resolvePrintAssetUrl("",{useDefault:false})', context), '');
  vm.runInContext(declaration('buildPrintReadyScript'), context);
  const printScript = vm.runInContext('buildPrintReadyScript()', context);
  assert.ok(printScript.endsWith('</script>'), 'Print window must contain a valid closing script tag');
  new vm.Script(printScript.replace(/^<script>/, '').replace(/<\/script>$/, ''));
  vm.runInContext(declaration('buildTabPageHref'), context);
  for (const tab of ['orders', 'quality_fai', 'entryrecords', 'compliance_qms']) {
    const url = new URL(vm.runInContext(`buildTabPageHref(${JSON.stringify(tab)})`, context), 'https://app.test/');
    assert.equal(url.pathname, '/index.html');
    assert.equal(url.searchParams.get('tab'), tab);
  }
  vm.runInContext('const DEFAULT_MACHINES=["CNC-DEFAULT"];', context);
  vm.runInContext(declaration('normalizeMachineList')+'\n'+declaration('machineNamesFromConnectors'), context);
  assert.equal(vm.runInContext('JSON.stringify(normalizeMachineList([],[]))',context),'[]');
  assert.equal(vm.runInContext('JSON.stringify(machineNamesFromConnectors([]))',context),'[]');
  assert.equal(vm.runInContext('JSON.stringify(normalizeMachineList(["MANUEL-1","CNC-1"," cnc-1 ","CNC-NEW"]))',context),'["MANUEL-1","CNC-1","CNC-NEW"]');
  assert.equal(vm.runInContext('JSON.stringify(normalizeMachineList([]))',context),'["CNC-DEFAULT"]');
  console.log('PASS: module boundaries, file uploads, document sizing, default logos, print script and module links');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
