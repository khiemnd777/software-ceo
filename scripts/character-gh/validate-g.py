"""Independent G skin/face/approved-motion and conservative contact checks."""
from pathlib import Path
import json, hashlib, importlib.util
import numpy as np

ROOT=Path(__file__).resolve().parents[2];ART=ROOT/'art-source/character-gh';EV=ROOT/'evidence/character-gh'
spec=importlib.util.spec_from_file_location('f_validate',ROOT/'scripts/character-f/validate.py')
v=importlib.util.module_from_spec(spec);spec.loader.exec_module(v)
catalog=json.loads((ROOT/'src/characters/catalog.json').read_text())
manifest=json.loads((ART/'manifest-g.json').read_text());result=[]
for model in manifest['models']:
    asset=v.GLB(ART/model['glb']);accepted=v.GLB(ROOT/'art-source/character-f'/(model['gender']+'-rigged-f.glb'))
    assert hashlib.sha256((ART/model['glb']).read_bytes()).hexdigest()==model['glb_sha256']
    assert {k:model[k] for k in ['gender','bottom','hair','label']}==catalog[model['id']]
    assert len(asset.doc['skins'])==1 and len(asset.doc['skins'][0]['joints'])==22
    assert set(asset.clips)==v.CLIPS
    parts=list(asset.parts());triangles=0
    for node,p in parts:
        attrs=p['attributes'];w=asset.accessor(attrs['WEIGHTS_0']);j=asset.accessor(attrs['JOINTS_0'])
        assert w.shape[1]==4 and np.min(w)>=0 and np.max(np.abs(w.sum(1)-1))<.0001 and j.max()<22
        n=asset.accessor(attrs['NORMAL']);assert np.max(np.abs(np.linalg.norm(n,axis=1)-1))<.002
        indices=asset.accessor(p['indices'])[:,0];assert indices.max()<len(w) and len(indices)%3==0
        triangles+=len(indices)//3
    head_error=None
    if model['gender']=='female':
        before,after=accepted.head_triangles(),asset.head_triangles()
        assert before.keys()==after.keys() and len(before)==21
        keys=[key for key in before if not (model['hair']=='long' and 'rounded bob back' in key)]
        assert len(keys)==(20 if model['hair']=='long' else 21)
        assert all(before[key].shape==after[key].shape for key in keys)
        head_error=max(float(np.max(np.abs(before[key]-after[key]))) for key in keys)
        assert head_error<.000001,(model['id'],head_error)
    pose_error=0;ground=[];desk=[];motion=[]
    nodes={n.get('name'):i for i,n in enumerate(asset.doc['nodes'])}
    previous_nodes={n.get('name'):i for i,n in enumerate(accepted.doc['nodes'])}
    for clip in sorted(asset.clips):
        times=[asset.accessor(s['input'])[:,0] for s in asset.clips[clip]['samplers']]
        start=min(float(t[0]) for t in times);end=max(float(t[-1]) for t in times)
        assert abs(end-start-2)<.002
        first=None;maximum=0
        for t in np.linspace(start,end,17):
            world=asset.worlds(clip,t);old=accepted.worlds(clip,t)
            for name in nodes:
                if name and name.startswith('DEF_'):
                    pose_error=max(pose_error,float(np.max(np.abs(world[nodes[name]]-old[previous_nodes[name]]))))
            clouds=[]
            for node,p in parts:
                label=node.get('extras',{}).get('source_part','')
                cloth='G |' in label
                points=asset.skin(node,p,world,1 if cloth or 'outsole' in label else 47)
                assert np.isfinite(points).all() and np.max(np.abs(points))<4
                clouds.append(points)
                if points[:,1].min()<-.004:ground.append([clip,float(t),label,float(points[:,1].min())])
                if clip!='walk':
                    forward=-points[:,2]
                    inside=(np.abs(points[:,0])<.78)&(forward>.10)&(forward<.84)&(points[:,1]>.714)&(points[:,1]<.759)
                    if np.any(inside):desk.append([clip,float(t),label,int(inside.sum())])
            cloud=np.concatenate(clouds)
            if first is None:first=cloud
            maximum=max(maximum,float(np.max(np.linalg.norm(cloud-first,axis=1))))
        assert maximum>.0005
        motion.append({'clip':clip,'max_vertex_motion_m':maximum})
    assert pose_error<.00001,(model['id'],pose_error)
    result.append({'id':model['id'],'triangles':triangles,'approved_face_error_m':head_error,
        'approved_f_motion_matrix_error':pose_error,'ground_penetrations':ground,'desk_interior_penetrations':desk,'clips':motion,
        'pass':not ground and not desk})
baseline=json.loads((EV/'baseline.json').read_text())['files']
old_art=[p for p in baseline if p.startswith('art-source/')]
assert all(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==baseline[p] for p in old_art)
receipt={'pass':all(m['pass'] for m in result),'models':result,'approved_art_files_unchanged':len(old_art),
    'limits':['Conservative sampled contacts, not cloth/hair physics or exhaustive collision certification','Long hair intentionally changes one approved bob surface; all other face/head parts preserved']}
(EV/'validation-g.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'pass':receipt['pass'],'models':len(result),'contacts':[(m['id'],len(m['ground_penetrations']),len(m['desk_interior_penetrations'])) for m in result]}))
assert receipt['pass'],'G contact failures; inspect validation-g.json'
