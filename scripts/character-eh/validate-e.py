"""Independent byte-level E checks; art/deformation acceptance stays separate."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import math
import struct

ROOT=Path(__file__).resolve().parents[2]
ART=ROOT/'art-source/character-eh'
EV=ROOT/'evidence/character-eh'


def sha(path):return hashlib.sha256(path.read_bytes()).hexdigest()


class GLB:
    def __init__(self,path):
        raw=path.read_bytes();magic,version,length=struct.unpack_from('<4sII',raw)
        assert magic==b'glTF' and version==2 and length==len(raw)
        offset=12;chunks=[]
        while offset<len(raw):
            assert offset+8<=len(raw)
            size,kind=struct.unpack_from('<II',raw,offset);offset+=8
            assert size%4==0 and offset+size<=len(raw)
            chunks.append((kind,raw[offset:offset+size]));offset+=size
        assert [c[0] for c in chunks]==[0x4e4f534a,0x004e4942]
        self.doc=json.loads(chunks[0][1]);self.blob=chunks[1][1];self.cache={}
        d=self.doc
        assert len(d['buffers'])==1 and 'uri' not in d['buffers'][0]
        assert d['buffers'][0]['byteLength']<=len(self.blob)<d['buffers'][0]['byteLength']+4
        assert not any(d.get(k) for k in ['skins','animations','cameras','textures','images'])
        assert 'KHR_lights_punctual' not in d.get('extensions',{})
        assert all(not any(k in n for k in ['matrix','translation','rotation','scale','skin']) for n in d['nodes'])
        for index in range(len(d['accessors'])):self.accessor(index)

    def accessor(self,index):
        if index in self.cache:return self.cache[index]
        a=self.doc['accessors'][index];view=self.doc['bufferViews'][a['bufferView']]
        assert not a.get('sparse') and not a.get('normalized',False)
        assert view['buffer']==0 and view.get('byteOffset',0)+view['byteLength']<=self.doc['buffers'][0]['byteLength']
        fmt,size={5121:('B',1),5123:('H',2),5125:('I',4),5126:('f',4)}[a['componentType']]
        count={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
        stride=view.get('byteStride',count*size);local=a.get('byteOffset',0)
        assert a['count']>0 and stride>=count*size and local>=0
        assert local+(a['count']-1)*stride+count*size<=view['byteLength']
        start=view.get('byteOffset',0)+local
        values=[struct.unpack_from('<'+fmt*count,self.blob,start+i*stride) for i in range(a['count'])]
        assert all(math.isfinite(v) for row in values for v in row)
        self.cache[index]=values;return values

    def primitives(self,node):return self.doc['meshes'][node['mesh']]['primitives']

    def head_triangles(self):
        result={}
        for node in self.doc['nodes']:
            name=node.get('extras',{}).get('source_part',node.get('name',''))
            if not name.startswith('Female V3 · '):continue
            key=name.split(' [static head')[0];triangles=[]
            for primitive in self.primitives(node):
                positions=self.accessor(primitive['attributes']['POSITION']);indices=[r[0] for r in self.accessor(primitive['indices'])]
                for start in range(0,len(indices),3):
                    # Canonical triangle positions, independent of vertex order
                    # or split normals introduced by glTF re-export.
                    points=sorted(tuple(round(c,6) for c in positions[i]) for i in indices[start:start+3])
                    triangles.append(tuple(points))
            result[key]=Counter(triangles)
        return result


def validate_model(item):
    path=ART/item['file'];assert sha(path)==item['sha256'] and path.stat().st_size==item['bytes']
    glb=GLB(path);triangles=0;degenerate=0;normal_error=0;points=[]
    for mesh in glb.doc['meshes']:
        for primitive in mesh['primitives']:
            assert primitive.get('mode',4)==4
            p=glb.accessor(primitive['attributes']['POSITION']);n=glb.accessor(primitive['attributes']['NORMAL'])
            indices=[row[0] for row in glb.accessor(primitive['indices'])]
            assert len(p)==len(n) and len(indices)%3==0 and min(indices)>=0 and max(indices)<len(p)
            normal_error=max(normal_error,max(abs(math.sqrt(sum(c*c for c in v))-1) for v in n))
            triangles+=len(indices)//3;points.extend(p)
            for start in range(0,len(indices),3):
                a,b,c=[p[i] for i in indices[start:start+3]]
                u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)]
                cross=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]
                degenerate+=sum(c*c for c in cross)<1e-20
    lo=[min(p[i] for p in points) for i in range(3)];hi=[max(p[i] for p in points) for i in range(3)]
    assert triangles==item['triangles'] and normal_error<.002
    assert abs((lo[0]+hi[0])/2)<.01 and 0<=lo[1]<.015 and 1.7<hi[1]<1.9
    assert degenerate==0,(item['file'],degenerate)
    return {'file':item['file'],'sha256':item['sha256'],'triangles':triangles,'zero_area_triangles':degenerate,'normal_max_error':normal_error,'bounds_y_up':{'min':lo,'max':hi},'static_only':True,'pass':True},glb


def main():
    manifest=json.loads((ART/'manifest-e.json').read_text());models=[];female=None
    for item in manifest['models']:
        result,glb=validate_model(item);models.append(result)
        if item['gender']=='female':female=glb
    approved=GLB(ROOT/'art-source/character-female-head-v3/female-head-v3.glb')
    before,after=approved.head_triangles(),female.head_triangles()
    assert len(before)==21 and before==after,'Approved female head triangles differ in full-body export'
    assert sha(ART/manifest['source_file'])==manifest['source_sha256']
    assert all(item['all_quads'] and item['knee_support_rings']>=3 for item in manifest['trouser_retopology'])
    baseline=json.loads((EV/'baseline.json').read_text())['files']
    changes=[p for p,h in baseline.items() if not (ROOT/p).exists() or sha(ROOT/p)!=h]
    # Model/game bytes are immutable at E. Checkpoint docs have their own
    # explicit final digests so normal handoff updates do not invalidate a
    # rerun, and arbitrary edits cannot silently pass as documentation work.
    checkpoint_path=EV/'checkpoint-e.json'
    expected_docs={item['file']:item['sha256'] for item in json.loads(checkpoint_path.read_text())['checkpoint_docs']} if checkpoint_path.exists() else {}
    allowed={'PROJECT_STATE.md','SESSION_HANDOFF.md','RELEASE_CHECKLIST.md','TASKS.md','docs/CHARACTER_FEMALE_HEAD_V3.md'}
    assert all(p in allowed and expected_docs.get(p)==sha(ROOT/p) for p in changes),changes
    receipt={'stage':'E','models':models,'approved_head_meshes_compared':len(before),'approved_head_triangles_match_to_1_micrometer':True,'quad_trouser_cages':manifest['trouser_retopology'],'existing_files_checked':len(baseline),'existing_documentation_changes':changes,'other_existing_files_changed':[],'pass':True,'full_body_owner_acceptance':'OPEN','rig_or_deformation_proof':False,'limits':['Custom binary checks, not Khronos validator','Static preview meshes are subdivided review exports, not optimized shipping models','Rig and deformation remain untested until F']}
    render_path=EV/'render-e-receipt.json'
    if render_path.exists():
        renders=json.loads(render_path.read_text());assert renders['input_models']==manifest['models']
        for item in renders['renders']:assert sha(EV/item['file'])==item['sha256']
        receipt['render_hashes_checked']=len(renders['renders'])
    (EV/'validation-e.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(receipt,ensure_ascii=False,indent=2))


if __name__=='__main__':main()
