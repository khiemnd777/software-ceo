"""Read GLB bytes independently of Blender; verify review inputs and scope."""
from pathlib import Path
import hashlib, json, math, struct

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'art-source/character-redesign-v2'
EVIDENCE=ROOT/'evidence/character-redesign-v2'


def check_glb(metadata):
    data=(OUT/metadata['file']).read_bytes()
    assert hashlib.sha256(data).hexdigest()==metadata['sha256']
    magic,version,length=struct.unpack_from('<4sII',data)
    assert magic==b'glTF' and version==2 and length==len(data)
    offset=12;chunks={}
    while offset<len(data):
        size,kind=struct.unpack_from('<II',data,offset);offset+=8
        chunks[kind]=data[offset:offset+size];offset+=size
    doc=json.loads(chunks[0x4e4f534a]);blob=chunks[0x004e4942]
    assert len(doc['buffers'])==1 and 'uri' not in doc['buffers'][0]
    assert doc['buffers'][0]['byteLength']<=len(blob)<doc['buffers'][0]['byteLength']+4
    assert not any(doc.get(k) for k in ['skins','animations','cameras','images','textures'])
    assert not doc.get('extensions',{}).get('KHR_lights_punctual')
    assert all(not any(k in n for k in ['matrix','translation','rotation','scale','skin']) for n in doc['nodes'])
    formats={5121:('B',1),5123:('H',2),5125:('I',4),5126:('f',4)}
    components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}
    cache={}
    def accessor(i):
        if i in cache:return cache[i]
        a=doc['accessors'][i];view=doc['bufferViews'][a['bufferView']]
        f,sz=formats[a['componentType']];n=components[a['type']]
        stride=view.get('byteStride',n*sz);start=view.get('byteOffset',0)+a.get('byteOffset',0)
        values=[struct.unpack_from('<'+f*n,blob,start+k*stride) for k in range(a['count'])]
        assert all(math.isfinite(v) for row in values for v in row)
        cache[i]=values;return values
    points=[];triangle_count=0;degenerate=0;normal_max_error=0
    for mesh in doc['meshes']:
        for primitive in mesh['primitives']:
            assert primitive.get('mode',4)==4
            pos=accessor(primitive['attributes']['POSITION']);normal=accessor(primitive['attributes']['NORMAL'])
            assert len(pos)==len(normal)
            normal_max_error=max(normal_max_error,max(abs(math.sqrt(sum(v*v for v in row))-1) for row in normal))
            indices=[v[0] for v in accessor(primitive['indices'])]
            assert len(indices)%3==0 and min(indices)>=0 and max(indices)<len(pos)
            triangle_count+=len(indices)//3
            for k in range(0,len(indices),3):
                p,q,r=[pos[i] for i in indices[k:k+3]]
                u=[q[i]-p[i] for i in range(3)];v=[r[i]-p[i] for i in range(3)]
                area=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
                if sum(c*c for c in area)<1e-20:degenerate+=1
            points.extend(pos)
    lo=[min(v[i] for v in points) for i in range(3)];hi=[max(v[i] for v in points) for i in range(3)]
    assert normal_max_error<.002
    assert triangle_count==metadata['triangles']
    assert abs((lo[0]+hi[0])/2)<.01 and -.005<=lo[1]<=.015
    assert 1.7<hi[1]-lo[1]<2.1
    assert degenerate==0,(metadata['file'],degenerate)
    return {'file':metadata['file'],'sha256':metadata['sha256'],'triangles':triangle_count,'bounds_gltf_y_up':{'min':lo,'max':hi},'unit_normal_max_error':normal_max_error,'zero_area_triangles':degenerate,'external_resources':False,'skins_or_animations':False,'pass':True}


def main():
    manifest=json.loads((OUT/'manifest.json').read_text());models=[check_glb(m) for m in manifest['models']]
    preservation=json.loads((EVIDENCE/'preservation-baseline.json').read_text())
    differences=[path for path,sha in preservation.items() if not (ROOT/path).exists() or hashlib.sha256((ROOT/path).read_bytes()).hexdigest()!=sha]
    assert not differences,differences
    receipts=[]
    for name in ['render-receipt.json','turntable-receipt.json']:
        path=EVIDENCE/name
        assert path.exists(),name+' is not ready'
        r=json.loads(path.read_text());images=r.get('stills',r.get('frames',[]))
        assert len(images)==(13 if name=='render-receipt.json' else 24)
        for source in r['model_inputs']:assert hashlib.sha256((OUT/source['file']).read_bytes()).hexdigest()==source['sha256']
        for item in images:
            image_path=EVIDENCE/item['file']
            if name=='turntable-receipt.json':image_path=EVIDENCE/'turntable'/item['file']
            assert image_path.exists() and hashlib.sha256(image_path.read_bytes()).hexdigest()==item['sha256']
        receipts.append({'file':name,'images':len(images),'input_and_output_hashes_match':True})
    source_paths=[OUT/'characters-v2.blend',OUT/'export-review-v2.blend',OUT/'review.html',*sorted((ROOT/'scripts/character-redesign-v2').glob('*.py'))]
    sources=[{'file':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in source_paths]
    receipt={'models':models,'preservation':{'files':len(preservation),'differences':differences,'pass':True},'render_receipts_checked':receipts,'sources':sources,'limits':['Not a Khronos validator or collision certification','Static geometry only; no rig/deformation or game integration acceptance','Owner art review remains OPEN']}
    (EVIDENCE/'validation.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(receipt,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
