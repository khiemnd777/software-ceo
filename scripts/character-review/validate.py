"""Decode delivered GLBs independently; test geometry/skin/clip invariants.

Not an official Khronos validator, cloth collision certificate or art approval.
"""
from pathlib import Path
import hashlib
import json
import struct
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/'art-source/character-redesign-ac'
EVIDENCE=ROOT/'evidence/character-redesign-ac'


def read(path):
    raw=path.read_bytes();magic,version,length=struct.unpack_from('<III',raw)
    assert magic==0x46546c67 and version==2 and length==len(raw)
    size,kind=struct.unpack_from('<II',raw,12);assert kind==0x4e4f534a
    doc=json.loads(raw[20:20+size]);blen,bkind=struct.unpack_from('<II',raw,20+size)
    assert bkind==0x004e4942
    data=raw[28+size:28+size+blen]
    assert len(data)>=doc['buffers'][0]['byteLength']
    def acc(i):
        a=doc['accessors'][i];v=doc['bufferViews'][a['bufferView']]
        components={'SCALAR':1,'VEC3':3,'VEC4':4,'MAT4':16}[a['type']]
        start=v.get('byteOffset',0)+a.get('byteOffset',0)
        out=np.frombuffer(data,dtype={5126:'<f4',5125:'<u4',5123:'<u2'}[a['componentType']],count=a['count']*components,offset=start).reshape(-1,components)
        assert np.isfinite(out).all()
        return out
    return doc,acc


def components(v,f):
    parent=np.arange(len(v))
    def find(i):
        while parent[i]!=i:parent[i]=parent[parent[i]];i=parent[i]
        return i
    for tri in f:
        root=find(tri[0])
        for i in tri[1:]:parent[find(i)]=root
    return len({find(i) for i in np.unique(f)})


def rotation(q):
    x,y,z,w=q
    return np.array([[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w],
                     [2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w],
                     [2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y]])


def run():
    manifest=json.loads((SOURCE/'models-manifest.json').read_text());results=[]
    for meta in manifest['models']:
        path=SOURCE/'models'/meta['file'];doc,acc=read(path)
        assert hashlib.sha256(path.read_bytes()).hexdigest()==meta['sha256']
        skin=doc['skins'][0];joints=skin['joints'];bind=acc(skin['inverseBindMatrices']).reshape(-1,4,4).transpose(0,2,1)
        assert len(joints)==15
        prims=[];topology=[]
        for mesh_index,mesh in enumerate(doc['meshes']):
            for p in mesh['primitives']:
                a=p['attributes'];v,n,j,w,f=acc(a['POSITION']),acc(a['NORMAL']),acc(a['JOINTS_0']),acc(a['WEIGHTS_0']),acc(p['indices']).reshape(-1,3)
                assert len(v)==len(n)==len(j)==len(w)
                assert f.min()>=0 and f.max()<len(v)
                assert j.max()<len(joints) and w.min()>=0
                assert np.allclose(w.sum(1),1,atol=2e-6)
                assert np.allclose(np.linalg.norm(n,axis=1),1,atol=2e-3),mesh['name']
                node_index=next(i for i,n in enumerate(doc['nodes']) if n.get('mesh')==mesh_index)
                target=acc(p['targets'][0]['POSITION']) if p.get('targets') else np.zeros_like(v)
                prims.append((v,j,w,node_index,target))
                if mesh['name'] in ('shirt-continuous-shoulders','trousers-connected-pelvis','shorts-connected-pelvis'):
                    count=components(v,f);assert count==1,(mesh['name'],count)
                    topology.append(dict(mesh=mesh['name'],connectedComponents=count))
        # The bind pose must reproduce authored vertices without a hidden offset.
        for idx,node in enumerate(joints):
            m=np.eye(4);m[:3,3]=doc['nodes'][node]['translation']
            assert np.allclose(m@bind[idx],np.eye(4),atol=1e-6)
        clip_results=[]
        for animation in doc['animations']:
            channels={}
            for ch in animation['channels']:
                sampler=animation['samplers'][ch['sampler']];times=acc(sampler['input']).reshape(-1);values=acc(sampler['output'])
                assert np.all(np.diff(times)>0)
                assert len(times)==len(values)==25
                if ch['target']['path']=='rotation':assert np.allclose(np.linalg.norm(values,axis=1),1,atol=1e-5)
                channels[(ch['target']['node'],ch['target']['path'])]=values
            max_displacement=0;temporal_change=0;first_pose=[]
            for frame in [0,6,12,18,24]:
                matrices=[]
                for idx,node in enumerate(joints):
                    m=np.eye(4);m[:3,:3]=rotation(channels[node,'rotation'][frame]);m[:3,3]=channels[node,'translation'][frame]
                    matrices.append(m@bind[idx])
                matrices=np.array(matrices)
                for primitive_index,(v,j,w,node_index,target) in enumerate(prims):
                    weight=channels.get((node_index,'weights'),np.zeros((25,1)))[frame,0]
                    h=np.c_[v+weight*target,np.ones(len(v))]
                    out=np.zeros((len(v),3))
                    for influence in range(4):out+=np.einsum('nij,nj->ni',matrices[j[:,influence],:3,:],h)*w[:,influence,None]
                    assert np.isfinite(out).all()
                    max_displacement=max(max_displacement,float(np.linalg.norm(out-v,axis=1).max()))
                    if frame==0:first_pose.append(out.copy())
                    else:temporal_change=max(temporal_change,float(np.linalg.norm(out-first_pose[primitive_index],axis=1).max()))
                    assert np.abs(out).max()<3,'unbounded pose'
            assert max_displacement>.0001,animation['name']
            assert temporal_change>.00001,animation['name']+' is a static pose'
            clip_results.append(dict(clip=animation['name'],sampledFrames=5,maxDisplacementMetres=max_displacement,temporalChangeMetres=temporal_change))
        results.append(dict(file=meta['file'],triangles=meta['triangles'],connectedSurfaces=topology,clips=clip_results))
    report=dict(result='PASS',scope='Independent GLB decode, connected garment meshes, finite unit normals, normalized four-joint weights, inverse bind, monotonic keyframes and bounded skin deformation. No collision/aesthetic certification.',models=results,sampledPoses=len(results)*6*5)
    (EVIDENCE/'geometry-validation.json').write_text(json.dumps(report,indent=2))
    print('PASS:',len(results),'GLBs;',report['sampledPoses'],'sampled poses; weighted skinning and connected garment topology')


if __name__=='__main__':run()
