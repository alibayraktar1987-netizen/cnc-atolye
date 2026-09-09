"""Build reviewed source text and blank forms. Never import filled examples as records.
Run with Python 3 from the repository root. DOCX/XLSX use standard library only.
"""
from pathlib import Path
import zipfile, xml.etree.ElementTree as ET, json, re

ROOT = Path(__file__).resolve().parents[1]
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

def doc_blocks(path):
    with zipfile.ZipFile(path) as z:
        body = ET.fromstring(z.read('word/document.xml')).find('w:body', NS)
        out = []
        text = lambda e: ''.join(t.text or '' for t in e.findall('.//w:t', NS)).strip()
        for node in body:
            if node.tag.endswith('}p') and text(node): out.append({'text': text(node)})
            elif node.tag.endswith('}tbl'):
                out.append({'rows': [[text(c) for c in r.findall('w:tc', NS)] for r in node.findall('w:tr', NS)]})
        return out

groups = {'EYS': ['compliance_qms', 'compliance_eydep'], 'MUS': ['customers','sales','quotes'],
          'OPS': ['orders','planning','quality_fai'], 'TED': ['purchase','purchase_requests','purchase_suppliers','warehouse'],
          'KLT': ['quality_inspect','quality_fai','measurement'], 'BAK': ['downtime','machineprep','giris','entryrecords'],
          'IK': ['users','assignments','compliance_eydep'], 'BG': ['compliance_security','users','progenergy'],
          'TG': ['compliance_security'], 'EY': ['compliance_eydep'], 'SRD': ['compliance_eydep','compliance_security']}
docs, templates = [], []
files = sorted((ROOT/'qualityDocument').iterdir())
for path in files:
    num = path.name[:2]
    docs.append({'id': num, 'file': path.name, 'title': path.stem[3:].replace('_',' '), 'kind': path.suffix[1:]})
    if path.suffix != '.docx': continue
    blocks = doc_blocks(path)
    if num in ('01','02','03','04','05'):
        docs[-1]['blocks'] = blocks
    if num == '04':
        current = None
        for b in blocks:
            m = re.match(r'^([A-Z]+-FR-\d+) — (.+)', b.get('text',''))
            if m:
                current={'id':m[1], 'code':m[1], 'title':m[2], 'source':num,'revision':'00', 'kind':'form',
                         'tabs':groups[m[1].split('-')[0]], 'fields':[], 'tables':[]}
                templates.append(current)
            elif current and 'rows' in b and b['rows'] and b['rows'][0][0]=='Alan':
                current['fields']=[{'key':'f'+str(i),'label':r[0]} for i,r in enumerate(b['rows'][1:]) if r and r[0]]
    if num in ('07','08','09'):
        t={'id':{'07':'IK-SZ-02','08':'HUK-SZ-01','09':'IK-SZ-01'}[num], 'code':{'07':'İK-SZ-02','08':'HUK-SZ-01','09':'İK-SZ-01'}[num],
           'title':blocks[0]['text'],'source':num,'revision':'Kaynakta belirtilmemiş','kind':'contract',
           'tabs':['customers','sales','purchase_suppliers'] if num=='08' else ['users','assignments'], 'fields':[],'tables':[],'blocks':[]}
        def slots(value, context=''):
            def replace(m):
                raw=m.group(0)
                if raw=='[ ]': return raw
                key='f'+str(len(t['fields']))
                t['fields'].append({'key':key,'label':(context+' — ' if context else '')+(raw[1:-1] if raw.startswith('[') else 'Tarih / bilgi')})
                return '{{'+key+'}}'
            return re.sub(r'\[[^\]\n]+\]|_{2,}(?:\s*/\s*_{2,})*(?:\s*/\s*20_{2,})?',replace,value)
        for b in blocks:
            if 'text' in b: t['blocks'].append({'text':slots(b['text'])})
            else:
                t['blocks'].append({'rows':[[slots(v,(r[j-1] if j else '')+(' (Karşı taraf)' if j>1 else '')) for j,v in enumerate(r)] for r in b['rows']]})
        templates.append(t)
    if num in ('10','12','13'):
        # Keep only the explicit blank template, never the sample customer or decisions.
        start=next(i for i,b in enumerate(blocks) if b.get('text','').startswith('BOŞ ŞABLON'))
        blank=blocks[start+1:]
        t={'id':{'10':'FR-QUA-18','12':'FR-QUA-19','13':'FR-QUA-20'}[num], 'code':{'10':'FR-QUA-18','12':'FR-QUA-19','13':'FR-QUA-20'}[num],
           'title':{'10':'Uygunluk Sertifikası (CoC)','12':'Malzeme Sertifikası İnceleme ve Uygunluk Kaydı','13':'Özel Proses Sertifikası ve Doğrulama Kaydı'}[num],
           'source':num,'revision':'00','kind':'form','tabs':{'10':['sales','orders','quality_inspect'],'12':['warehouse','materials','purchase','quality_trace'],'13':['purchase','purchase_suppliers','orders','quality_inspect']}[num], 'fields':[],'tables':[], 'notes':[]}
        heading=''
        for b in blank:
            if 'text' in b:
                if len(b['text'])>100:t['notes'].append(b['text'])
                else:heading=b['text']
            else:
                rs=b['rows']
                if any('Ad Soyad / Tarih / İmza' in c for r in rs for c in r):
                    t['signatures']=rs[0]
                    continue
                if rs and rs[0][0]=='Özellik':
                    t['tables'].append({'title':heading,'columns':rs[0], 'rows':[['']*len(rs[0]) for r in rs[1:] if len(r)==len(rs[0])] or [['']*len(rs[0])]})
                    for r in rs[1:]:
                        if len(r)==len(rs[0]):continue
                        for j in range(0,len(r)-1,2):
                            t['fields'].append({'key':'f'+str(len(t['fields'])),'label':r[j]})
                elif any('___' in c or c.startswith('[ ]') for r in rs for c in r) or (rs and rs[0][0]=='Kriter'):
                    for r in rs:
                        for j in range(0,len(r)-1,2):
                            if r[j] and r[j] not in ('Kriter','Değer / Kayıt'):
                                t['fields'].append({'key':'f'+str(len(t['fields'])),'label':r[j]})
                elif rs:
                    t['tables'].append({'title':heading,'columns':rs[0], 'rows':[[c if j==0 and num=='12' and rs[0][0]=='Kontrol Noktası' else '' for j,c in enumerate(r)] for r in rs[1:]]})
        templates.append(t)

# The management workbook contains blank registers plus example rows. Only headers become inputs.
path=next(p for p in files if p.name.startswith('06'))
with zipfile.ZipFile(path) as z:
    ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    strings=[]
    if 'xl/sharedStrings.xml' in z.namelist():strings=[''.join(t.text or '' for t in n.findall('.//s:t',ns)) for n in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
    rels={r.attrib['Id']:r.attrib['Target'] for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    for i,sh in enumerate(ET.fromstring(z.read('xl/workbook.xml')).findall('s:sheets/s:sheet',ns)):
        target=rels[sh.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']]
        target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
        sheet=ET.fromstring(z.read(target))
        def val(c):
            v=c.find('s:v',ns)
            if c.attrib.get('t')=='s':return strings[int(v.text)] if v is not None else ''
            if c.attrib.get('t')=='inlineStr':return ''.join(x.text or '' for x in c.findall('.//s:t',ns))
            return v.text if v is not None else ''
        rs=[[val(c) for c in r.findall('s:c',ns)] for r in sheet.findall('s:sheetData/s:row',ns)]
        title=rs[0][0];headers=[c for c in rs[1] if c]
        tabs=['compliance_qms','compliance_eydep']
        if sh.attrib['name']=='Tedarikciler':tabs+=['purchase_suppliers']
        if sh.attrib['name']=='Kalibrasyon':tabs+=['measurement','tools']
        if sh.attrib['name']=='Egitim Yetkinlik':tabs+=['users','assignments']
        if sh.attrib['name'].startswith('Guvenlik'):tabs=['compliance_security']
        if sh.attrib['name']=='DÖF 8D':tabs+=['compliance_as9100']
        templates.append({'id':'MATRIX-'+str(i+1),'code':'06 / '+sh.attrib['name'],'title':title,'source':'06','revision':'Kaynak çalışma kitabı','kind':'form','tabs':tabs,
                          'fields':[],'tables':[{'title':title,'columns':headers,'rows':[['']*len(headers)]}]})

out={'documents':docs,'templates':templates}
(ROOT/'js/quality-document-catalog.js').write_text('(function(r){const data='+json.dumps(out,ensure_ascii=False,separators=(',',':'))+';if(typeof module==="object"&&module.exports)module.exports=data;else r.QualityDocumentCatalog=data;})(typeof window!=="undefined"?window:globalThis);\n',encoding='utf-8')
print(len(docs),'sources;',len(templates),'blank templates;',sum(len(t['fields']) for t in templates),'fields')
